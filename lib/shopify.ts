import {
  ShopifyConfig,
  ShopifyGraphQLResponse,
  ShopifyError,
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCart,
  ShopifyProductsResponse,
  ShopifyProductResponse,
  ShopifyCollectionsResponse,
  ShopifyCollectionResponse,
  ShopifyCartResponse,
  ProductsQueryParams,
  CollectionsQueryParams,
  CollectionProductsQueryParams,
  CartCreateInput,
  CartLineAddInput,
  CartLineUpdateInput,
  ShopifyHandle,
  ShopifyID
} from '../types/shopify';

// Environment Configuration
const SHOPIFY_CONFIG: ShopifyConfig = {
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  apiVersion: '2024-10',
  retries: 3,
  retryDelay: 1000,
  timeout: 10000
};

// Validate required environment variables
if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) {
  throw new Error('Missing required Shopify environment variables. Ensure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are set.');
}

// GraphQL Fragments
// Base fragments - defined once and reused
const MONEY_FRAGMENT = `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

// Variant fragment without including base fragments (will be included at query level)
const PRODUCT_VARIANT_FRAGMENT = `
  fragment ProductVariantFragment on ProductVariant {
    id
    title
    availableForSale
    selectedOptions {
      name
      value
    }
    price {
      ...MoneyFragment
    }
    compareAtPrice {
      ...MoneyFragment
    }
    image {
      ...ImageFragment
    }
    sku
  }
`;

// Product fragment without including base fragments (will be included at query level)
const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    createdAt
    updatedAt
    publishedAt
    vendor
    productType
    tags
    images(first: 10) {
      edges {
        node {
          ...ImageFragment
        }
      }
    }
    variants(first: 250) {
      edges {
        node {
          ...ProductVariantFragment
        }
      }
    }
    options {
      id
      name
      values
    }
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
    featuredImage {
      ...ImageFragment
    }
    seo {
      title
      description
    }
  }
`;

const COLLECTION_FRAGMENT = `
  fragment CollectionFragment on Collection {
    id
    handle
    title
    description
    descriptionHtml
    updatedAt
    image {
      ...ImageFragment
    }
    seo {
      title
      description
    }
  }
`;

const CART_LINE_FRAGMENT = `
  fragment CartLineFragment on CartLine {
    id
    quantity
    merchandise {
      ... on ProductVariant {
        ...ProductVariantFragment
      }
    }
    cost {
      totalAmount {
        ...MoneyFragment
      }
      subtotalAmount {
        ...MoneyFragment
      }
      compareAtAmountPerQuantity {
        ...MoneyFragment
      }
    }
    attributes {
      key
      value
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 250) {
      edges {
        node {
          ...CartLineFragment
        }
      }
    }
    cost {
      totalAmount {
        ...MoneyFragment
      }
      subtotalAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
    }
    buyerIdentity {
      email
      phone
      customer {
        id
      }
      countryCode
    }
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
    createdAt
    updatedAt
  }
`;

// Custom Error Class
class ShopifyAPIError extends Error implements ShopifyError {
  type: ShopifyError['type'];
  originalError?: Error;
  graphqlErrors?: ShopifyGraphQLResponse['errors'];
  retryable: boolean;

  constructor(
    message: string,
    type: ShopifyError['type'],
    originalError?: Error,
    graphqlErrors?: ShopifyGraphQLResponse['errors']
  ) {
    super(message);
    this.name = 'ShopifyAPIError';
    this.type = type;
    this.originalError = originalError;
    this.graphqlErrors = graphqlErrors;
    this.retryable = type === 'NETWORK_ERROR' || type === 'RATE_LIMIT_ERROR';
  }
}

// Utility function to sleep
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// HTTP Client with retry logic
async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  retryCount = 0
): Promise<T> {
  const url = `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SHOPIFY_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : SHOPIFY_CONFIG.retryDelay!;

        if (retryCount < SHOPIFY_CONFIG.retries!) {
          await sleep(delay);
          return shopifyFetch<T>(query, variables, retryCount + 1);
        }

        throw new ShopifyAPIError(
          'Rate limit exceeded',
          'RATE_LIMIT_ERROR'
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new ShopifyAPIError(
          'Authentication failed',
          'AUTHENTICATION_ERROR'
        );
      }

      throw new ShopifyAPIError(
        `HTTP ${response.status}: ${response.statusText}`,
        'NETWORK_ERROR'
      );
    }

    const result: ShopifyGraphQLResponse<T> = await response.json();

    if (result.errors?.length) {
      // Create detailed error message with GraphQL error information
      const errorDetails = result.errors.map(err => 
        `${err.message} ${err.path ? `(Path: ${err.path.join('.')})` : ''}`
      ).join('; ');
      
      throw new ShopifyAPIError(
        `GraphQL errors occurred: ${errorDetails}`,
        'GRAPHQL_ERROR',
        undefined,
        result.errors
      );
    }

    if (!result.data) {
      throw new ShopifyAPIError(
        'No data returned from API',
        'UNKNOWN_ERROR'
      );
    }

    return result.data;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ShopifyAPIError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ShopifyAPIError(
          'Request timeout',
          'NETWORK_ERROR',
          error
        );
      }

      // Network errors that might be retryable
      if (retryCount < SHOPIFY_CONFIG.retries! &&
          (error.message.includes('fetch') || error.message.includes('network'))) {
        await sleep(SHOPIFY_CONFIG.retryDelay! * (retryCount + 1));
        return shopifyFetch<T>(query, variables, retryCount + 1);
      }

      throw new ShopifyAPIError(
        error.message,
        'NETWORK_ERROR',
        error
      );
    }

    throw new ShopifyAPIError(
      'Unknown error occurred',
      'UNKNOWN_ERROR'
    );
  }
}

// Product API
export async function getProducts(params: ProductsQueryParams = {}): Promise<ShopifyProduct[]> {
  const {
    first = 20,
    last,
    after,
    before,
    query
  } = params;

  // Simplified query without sortKey first to test
  const gqlQuery = `
    query GetProducts(
      $first: Int
      $last: Int
      $after: String
      $before: String
      $query: String
    ) {
      products(
        first: $first
        last: $last
        after: $after
        before: $before
        query: $query
      ) {
        edges {
          node {
            ...ProductFragment
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
    ${PRODUCT_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<ShopifyProductsResponse>(gqlQuery, {
    first,
    last,
    after,
    before,
    query
  });

  return result.products.edges.map(edge => edge.node);
}

export async function getProduct(handle: ShopifyHandle): Promise<ShopifyProduct | null> {
  const query = `
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        ...ProductFragment
      }
    }
    ${PRODUCT_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<ShopifyProductResponse>(query, { handle });
  return result.product;
}

export async function getProductById(id: ShopifyID): Promise<ShopifyProduct | null> {
  const query = `
    query GetProductById($id: ID!) {
      product(id: $id) {
        ...ProductFragment
      }
    }
    ${PRODUCT_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<ShopifyProductResponse>(query, { id });
  return result.product;
}

// Collection API
export async function getCollections(params: CollectionsQueryParams = {}): Promise<ShopifyCollection[]> {
  const {
    first = 20,
    last,
    after,
    before,
    query,
    sortKey = 'UPDATED_AT',
    reverse = false
  } = params;

  const gqlQuery = `
    query GetCollections(
      $first: Int
      $last: Int
      $after: String
      $before: String
      $query: String
      $sortKey: CollectionSortKeys
      $reverse: Boolean
    ) {
      collections(
        first: $first
        last: $last
        after: $after
        before: $before
        query: $query
        sortKey: $sortKey
        reverse: $reverse
      ) {
        edges {
          node {
            ...CollectionFragment
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
    ${COLLECTION_FRAGMENT}
    ${IMAGE_FRAGMENT}
  `;

  const result = await shopifyFetch<ShopifyCollectionsResponse>(gqlQuery, {
    first,
    last,
    after,
    before,
    query,
    sortKey,
    reverse
  });

  return result.collections.edges.map(edge => edge.node);
}

export async function getCollection(handle: ShopifyHandle): Promise<ShopifyCollection | null> {
  const query = `
    query GetCollection($handle: String!) {
      collection(handle: $handle) {
        ...CollectionFragment
      }
    }
    ${COLLECTION_FRAGMENT}
    ${IMAGE_FRAGMENT}
  `;

  const result = await shopifyFetch<ShopifyCollectionResponse>(query, { handle });
  return result.collection;
}

export async function getCollectionProducts(params: CollectionProductsQueryParams): Promise<ShopifyProduct[]> {
  const {
    collectionHandle,
    first = 20,
    last,
    after,
    before,
    query,
    sortKey = 'COLLECTION_DEFAULT',
    reverse = false
  } = params;

  const gqlQuery = `
    query GetCollectionProducts(
      $handle: String!
      $first: Int
      $last: Int
      $after: String
      $before: String
      $query: String
      $sortKey: ProductCollectionSortKeys
      $reverse: Boolean
    ) {
      collection(handle: $handle) {
        products(
          first: $first
          last: $last
          after: $after
          before: $before
          query: $query
          sortKey: $sortKey
          reverse: $reverse
        ) {
          edges {
            node {
              ...ProductFragment
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
    ${PRODUCT_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<{ collection: { products: ShopifyProductsResponse['products'] } }>(
    gqlQuery,
    {
      handle: collectionHandle,
      first,
      last,
      after,
      before,
      query,
      sortKey,
      reverse
    }
  );

  return result.collection.products.edges.map(edge => edge.node);
}

// Cart API
export async function createCart(input: CartCreateInput = {}): Promise<ShopifyCart> {
  const query = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<{ cartCreate: { cart: ShopifyCart; userErrors: Array<{ field?: string[]; message: string; code?: string }> } }>(
    query,
    { input }
  );

  if (result.cartCreate.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Cart creation failed: ${result.cartCreate.userErrors.map(e => e.message).join(', ')}`,
      'GRAPHQL_ERROR'
    );
  }

  return result.cartCreate.cart;
}

export async function getCart(cartId: ShopifyID): Promise<ShopifyCart | null> {
  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ...CartFragment
      }
    }
    ${CART_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<ShopifyCartResponse>(query, { cartId });
  return result.cart;
}

export async function addCartLines(cartId: ShopifyID, lines: CartLineAddInput[]): Promise<ShopifyCart> {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart; userErrors: Array<{ field?: string[]; message: string; code?: string }> } }>(
    query,
    { cartId, lines }
  );

  if (result.cartLinesAdd.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Add to cart failed: ${result.cartLinesAdd.userErrors.map(e => e.message).join(', ')}`,
      'GRAPHQL_ERROR'
    );
  }

  return result.cartLinesAdd.cart;
}

export async function updateCartLines(cartId: ShopifyID, lines: CartLineUpdateInput[]): Promise<ShopifyCart> {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart; userErrors: Array<{ field?: string[]; message: string; code?: string }> } }>(
    query,
    { cartId, lines }
  );

  if (result.cartLinesUpdate.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Cart update failed: ${result.cartLinesUpdate.userErrors.map(e => e.message).join(', ')}`,
      'GRAPHQL_ERROR'
    );
  }

  return result.cartLinesUpdate.cart;
}

export async function removeCartLines(cartId: ShopifyID, lineIds: ShopifyID[]): Promise<ShopifyCart> {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFragment
        }
        userErrors {
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${MONEY_FRAGMENT}
  `;

  const result = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart; userErrors: Array<{ field?: string[]; message: string; code?: string }> } }>(
    query,
    { cartId, lineIds }
  );

  if (result.cartLinesRemove.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Remove from cart failed: ${result.cartLinesRemove.userErrors.map(e => e.message).join(', ')}`,
      'GRAPHQL_ERROR'
    );
  }

  return result.cartLinesRemove.cart;
}

// Debug product query - step by step field testing
export interface DebugProductResponse {
  success: boolean;
  message: string;
  details?: {
    productCount: number;
    products: Array<{
      id: string;
      title: string;
      handle: string;
      description: string;
      availableForSale: boolean;
      vendor: string;
      priceRange: {
        minVariantPrice: {
          amount: string;
          currencyCode: string;
        };
        maxVariantPrice: {
          amount: string;
          currencyCode: string;
        };
      };
      variantCount: number;
      imageCount: number;
    }>;
  } | {
    type: string;
    retryable: boolean;
    graphqlErrors?: ShopifyGraphQLResponse['errors'];
  };
}

export async function debugProductQuery(): Promise<DebugProductResponse> {
  try {
    // Progressive field testing to identify problematic fields
    const query = `
      query DebugProducts {
        products(first: 5) {
          edges {
            node {
              id
              title
              handle
              description
              availableForSale
              vendor
              productType
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                id
                url
                altText
                width
                height
              }
              images(first: 3) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    sku
                  }
                }
              }
              options {
                id
                name
                values
              }
            }
          }
        }
      }
    `;

    const result = await shopifyFetch<{ products: ShopifyProductsResponse['products'] }>(query);

    return {
      success: true,
      message: 'Products query successful',
      details: {
        productCount: result.products.edges.length,
        products: result.products.edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          description: edge.node.description,
          availableForSale: edge.node.availableForSale,
          vendor: edge.node.vendor,
          priceRange: edge.node.priceRange,
          variantCount: edge.node.variants.edges.length,
          imageCount: edge.node.images.edges.length
        }))
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Products query failed',
      details: error instanceof ShopifyAPIError ? {
        type: error.type,
        retryable: error.retryable,
        graphqlErrors: error.graphqlErrors
      } : undefined
    };
  }
}

// Simple working products query for ProductGrid
export async function getProductsSimple(params: ProductsQueryParams = {}): Promise<ShopifyProduct[]> {
  const {
    first = 20,
    last,
    after,
    before,
    query,
  } = params;

  try {
    console.log('🔍 getProductsSimple called with params:', params);

    const gqlQuery = `
      query GetProductsSimple(
        $first: Int
        $last: Int
        $after: String
        $before: String
        $query: String
      ) {
        products(
          first: $first
          last: $last
          after: $after
          before: $before
          query: $query
        ) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              availableForSale
              createdAt
              updatedAt
              publishedAt
              vendor
              productType
              tags
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                id
                url
                altText
                width
                height
              }
              images(first: 3) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    sku
                  }
                }
              }
              options {
                id
                name
                values
              }
              seo {
                title
                description
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    console.log('🚀 Executing GraphQL query...');
    const result = await shopifyFetch<ShopifyProductsResponse>(gqlQuery, {
      first,
      last,
      after,
      before,
      query
    });

    console.log('✅ Query successful, product count:', result.products.edges.length);
    console.log('📦 Products data:', result.products.edges.map((edge) => edge.node.title));

    return result.products.edges.map((edge) => edge.node);

  } catch (error) {
    console.error('❌ getProductsSimple failed:', error);
    if (error instanceof ShopifyAPIError) {
      console.error('GraphQL Errors:', error.graphqlErrors);
    }
    throw error;
  }
}

// Test API Connection
interface TestConnectionResponse {
  success: boolean;
  message: string;
  details?: {
    shopName: string;
    domain: string;
    currency: string;
    description: string;
  } | {
    type: string;
    retryable: boolean;
    graphqlErrors?: ShopifyGraphQLResponse['errors'];
  };
}

export async function testConnection(): Promise<TestConnectionResponse> {
  try {
    const query = `
      query TestConnection {
        shop {
          name
          description
          primaryDomain {
            url
          }
          paymentSettings {
            currencyCode
          }
        }
      }
    `;

    const result = await shopifyFetch<{ shop: { name: string; description: string; primaryDomain: { url: string }; paymentSettings: { currencyCode: string } } }>(query);

    return {
      success: true,
      message: 'Successfully connected to Shopify Storefront API',
      details: {
        shopName: result.shop.name,
        domain: result.shop.primaryDomain.url,
        currency: result.shop.paymentSettings.currencyCode,
        description: result.shop.description
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error',
      details: error instanceof ShopifyAPIError ? {
        type: error.type,
        retryable: error.retryable,
        graphqlErrors: error.graphqlErrors
      } : undefined
    };
  }
}

// Export configuration for debugging
export { SHOPIFY_CONFIG };