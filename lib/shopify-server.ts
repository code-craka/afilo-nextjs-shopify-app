/**
 * Server-only Shopify Client
 *
 * CRITICAL SECURITY: This file should ONLY be imported in server-side code
 * The Shopify Storefront Access Token is NEVER exposed to the client
 *
 * Use this in:
 * - API routes (app/api/**)
 * - Server components
 * - Server actions
 *
 * DO NOT import in client components or hooks
 */

import 'server-only';

import {
  ShopifyConfig,
  ShopifyGraphQLResponse,
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

/**
 * Custom Shopify Error class for server-side operations
 */
class ShopifyAPIError extends Error {
  code: string;
  context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'ShopifyAPIError';
    this.code = code;
    this.context = context;
  }
}

// Server-only Shopify configuration
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
  throw new Error(
    'Missing required Shopify environment variables. ' +
    'Ensure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are set.'
  );
}

// GraphQL Fragments (same as client, but isolated here)
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
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
  }
`;

const CART_LINE_FRAGMENT = `
  fragment CartLineFragment on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...MoneyFragment
      }
      amountPerQuantity {
        ...MoneyFragment
      }
      compareAtAmountPerQuantity {
        ...MoneyFragment
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        selectedOptions {
          name
          value
        }
        product {
          id
          handle
          title
          featuredImage {
            ...ImageFragment
          }
        }
        price {
          ...MoneyFragment
        }
        image {
          ...ImageFragment
        }
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    attributes {
      key
      value
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
    lines(first: 250) {
      edges {
        node {
          ...CartLineFragment
        }
      }
    }
    discountCodes {
      code
      applicable
    }
    discountAllocations {
      discountedAmount {
        ...MoneyFragment
      }
    }
  }
`;

/**
 * Execute a Shopify GraphQL query with retry logic and error handling
 */
async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, any>,
  options?: {
    retries?: number;
    retryDelay?: number;
    timeout?: number;
  }
): Promise<T> {
  const retries = options?.retries ?? SHOPIFY_CONFIG.retries ?? 3;
  const retryDelay = options?.retryDelay ?? SHOPIFY_CONFIG.retryDelay ?? 1000;
  const timeout = options?.timeout ?? SHOPIFY_CONFIG.timeout ?? 10000;

  const url = `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

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
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * Math.pow(2, attempt);
          console.warn(`Rate limited by Shopify. Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json: ShopifyGraphQLResponse<T> = await response.json();

      if (json.errors) {
        const errorMessage = json.errors.map(e => e.message).join(', ');
        throw new Error(`GraphQL Errors: ${errorMessage}`);
      }

      if (!json.data) {
        throw new Error('No data returned from Shopify GraphQL API');
      }

      return json.data;

    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Request timeout after ${timeout}ms (attempt ${attempt + 1}/${retries + 1})`);
      } else {
        console.error(`Shopify API error (attempt ${attempt + 1}/${retries + 1}):`, error);
      }

      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new ShopifyAPIError(
    lastError?.message || 'Unknown Shopify API error',
    'SHOPIFY_API_ERROR',
    { retriesExhausted: true, lastError }
  );
}

// Export all Shopify functions from original lib/shopify.ts
// Re-export with server-side fetch implementation

export async function getProducts(params?: ProductsQueryParams): Promise<ShopifyProduct[]> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetProducts($first: Int, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  `;

  const variables = {
    first: params?.first || 50,
    query: params?.query,
    sortKey: params?.sortKey || 'RELEVANCE',
    reverse: params?.reverse || false,
  };

  const data = await shopifyFetch<ShopifyProductsResponse>(query, variables);
  return data.products.edges.map(edge => edge.node);
}

export async function getProductByHandle(handle: ShopifyHandle): Promise<ShopifyProduct | null> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        ...ProductFragment
      }
    }
  `;

  const data = await shopifyFetch<ShopifyProductResponse>(query, { handle });
  return data.product;
}

export async function getProductById(id: ShopifyID): Promise<ShopifyProduct | null> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetProductById($id: ID!) {
      product(id: $id) {
        ...ProductFragment
      }
    }
  `;

  const data = await shopifyFetch<ShopifyProductResponse>(query, { id });
  return data.product;
}

export async function getCollections(params?: CollectionsQueryParams): Promise<ShopifyCollection[]> {
  const query = `
    ${IMAGE_FRAGMENT}

    query GetCollections($first: Int) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml
            updatedAt
            image {
              ...ImageFragment
            }
          }
        }
      }
    }
  `;

  const variables = { first: params?.first || 250 };
  const data = await shopifyFetch<ShopifyCollectionsResponse>(query, variables);
  return data.collections.edges.map(edge => edge.node);
}

export async function getCollectionByHandle(handle: ShopifyHandle): Promise<ShopifyCollection | null> {
  const query = `
    ${IMAGE_FRAGMENT}

    query GetCollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        updatedAt
        image {
          ...ImageFragment
        }
      }
    }
  `;

  const data = await shopifyFetch<ShopifyCollectionResponse>(query, { handle });
  return data.collection;
}

export async function getCollectionProducts(
  handle: ShopifyHandle,
  params?: CollectionProductsQueryParams
): Promise<ShopifyProduct[]> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetCollectionProducts($handle: String!, $first: Int, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
      collection(handle: $handle) {
        products(first: $first, sortKey: $sortKey, reverse: $reverse) {
          edges {
            node {
              ...ProductFragment
            }
          }
        }
      }
    }
  `;

  const variables = {
    handle,
    first: params?.first || 50,
    sortKey: params?.sortKey || 'COLLECTION_DEFAULT',
    reverse: params?.reverse || false,
  };

  const data = await shopifyFetch<{ collection: { products: { edges: Array<{ node: ShopifyProduct }> } } }>(
    query,
    variables
  );

  return data.collection?.products?.edges?.map(edge => edge.node) || [];
}

// Cart operations
export async function createCart(input: CartCreateInput): Promise<ShopifyCart> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${CART_FRAGMENT}

    mutation CreateCart($input: CartInput!) {
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
  `;

  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart; userErrors: any[] } }>(query, { input });

  if (data.cartCreate.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Cart creation failed: ${data.cartCreate.userErrors.map(e => e.message).join(', ')}`,
      'CART_CREATE_ERROR',
      { userErrors: data.cartCreate.userErrors }
    );
  }

  return data.cartCreate.cart;
}

export async function getCart(cartId: ShopifyID): Promise<ShopifyCart | null> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${CART_FRAGMENT}

    query GetCart($id: ID!) {
      cart(id: $id) {
        ...CartFragment
      }
    }
  `;

  const data = await shopifyFetch<ShopifyCartResponse>(query, { id: cartId });
  return data.cart;
}

export async function addCartLines(cartId: ShopifyID, lines: CartLineAddInput[]): Promise<ShopifyCart> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${CART_FRAGMENT}

    mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
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
  `;

  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart; userErrors: any[] } }>(query, {
    cartId,
    lines,
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Add cart lines failed: ${data.cartLinesAdd.userErrors.map(e => e.message).join(', ')}`,
      'CART_LINES_ADD_ERROR',
      { userErrors: data.cartLinesAdd.userErrors }
    );
  }

  return data.cartLinesAdd.cart;
}

export async function updateCartLines(cartId: ShopifyID, lines: CartLineUpdateInput[]): Promise<ShopifyCart> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${CART_FRAGMENT}

    mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
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
  `;

  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart; userErrors: any[] } }>(query, {
    cartId,
    lines,
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Update cart lines failed: ${data.cartLinesUpdate.userErrors.map(e => e.message).join(', ')}`,
      'CART_LINES_UPDATE_ERROR',
      { userErrors: data.cartLinesUpdate.userErrors }
    );
  }

  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(cartId: ShopifyID, lineIds: ShopifyID[]): Promise<ShopifyCart> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${CART_LINE_FRAGMENT}
    ${CART_FRAGMENT}

    mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
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
  `;

  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart; userErrors: any[] } }>(query, {
    cartId,
    lineIds,
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new ShopifyAPIError(
      `Remove cart lines failed: ${data.cartLinesRemove.userErrors.map(e => e.message).join(', ')}`,
      'CART_LINES_REMOVE_ERROR',
      { userErrors: data.cartLinesRemove.userErrors }
    );
  }

  return data.cartLinesRemove.cart;
}

// Batch product fetching for performance optimization
export async function getProductsByIds(ids: ShopifyID[]): Promise<ShopifyProduct[]> {
  const query = `
    ${MONEY_FRAGMENT}
    ${IMAGE_FRAGMENT}
    ${PRODUCT_VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetProductsByIds($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          ...ProductFragment
        }
      }
    }
  `;

  const data = await shopifyFetch<{ nodes: (ShopifyProduct | null)[] }>(query, { ids });
  return data.nodes.filter((node): node is ShopifyProduct => node !== null);
}