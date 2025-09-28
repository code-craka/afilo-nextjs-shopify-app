// Server-side Shopify API client with proper authentication
// CRITICAL: This runs server-side ONLY - never expose to client

import { 
  ShopifyGraphQLResponse, 
  ShopifyError, 
  ShopifyCart, 
  CartCreateInput, 
  CartLineAddInput, 
  CartLineUpdateInput 
} from '../types/shopify';

// Server-side configuration (environment variables)
const SHOPIFY_SERVER_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN, // Optional for admin API
  apiVersion: '2024-10',
  retries: 3,
  retryDelay: 1000,
  timeout: 15000 // Longer timeout for server-side operations
};

// Validate required environment variables
if (!SHOPIFY_SERVER_CONFIG.domain || !SHOPIFY_SERVER_CONFIG.storefrontAccessToken) {
  throw new Error(
    'Missing required Shopify environment variables. Check NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN'
  );
}

// Enhanced error class for server-side operations
class ShopifyServerError extends Error implements ShopifyError {
  type: ShopifyError['type'];
  originalError?: Error;
  graphqlErrors?: ShopifyGraphQLResponse['errors'];
  retryable: boolean;
  statusCode?: number;

  constructor(
    message: string,
    type: ShopifyError['type'],
    originalError?: Error,
    graphqlErrors?: ShopifyGraphQLResponse['errors'],
    statusCode?: number
  ) {
    super(message);
    this.name = 'ShopifyServerError';
    this.type = type;
    this.originalError = originalError;
    this.graphqlErrors = graphqlErrors;
    this.retryable = type === 'NETWORK_ERROR' || type === 'RATE_LIMIT_ERROR';
    this.statusCode = statusCode;
  }
}

// Sleep utility
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// Server-side HTTP client with enhanced error handling
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  retryCount = 0,
  useAdminAPI = false
): Promise<T> {
  const isStorefront = !useAdminAPI;
  const baseUrl = `https://${SHOPIFY_SERVER_CONFIG.domain}`;

  const url = isStorefront
    ? `${baseUrl}/api/${SHOPIFY_SERVER_CONFIG.apiVersion}/graphql.json`
    : `${baseUrl}/admin/api/${SHOPIFY_SERVER_CONFIG.apiVersion}/graphql.json`;

  const accessToken = isStorefront
    ? SHOPIFY_SERVER_CONFIG.storefrontAccessToken
    : SHOPIFY_SERVER_CONFIG.adminAccessToken;

  if (!accessToken) {
    throw new ShopifyServerError(
      `Missing access token for ${isStorefront ? 'Storefront' : 'Admin'} API`,
      'AUTHENTICATION_ERROR'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SHOPIFY_SERVER_CONFIG.timeout);

  try {
    console.log(`🔄 Shopify ${isStorefront ? 'Storefront' : 'Admin'} API Request`, {
      url,
      hasVariables: !!variables,
      retryCount
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (isStorefront) {
      headers['X-Shopify-Storefront-Access-Token'] = accessToken;
    } else {
      headers['X-Shopify-Access-Token'] = accessToken;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`📡 Shopify API Response Status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - extract retry-after header
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : SHOPIFY_SERVER_CONFIG.retryDelay! * Math.pow(2, retryCount);

        if (retryCount < SHOPIFY_SERVER_CONFIG.retries!) {
          console.log(`⏱️ Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1})`);
          await sleep(delay);
          return shopifyFetch<T>(query, variables, retryCount + 1, useAdminAPI);
        }

        throw new ShopifyServerError(
          'Shopify API rate limit exceeded',
          'RATE_LIMIT_ERROR',
          undefined,
          undefined,
          response.status
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new ShopifyServerError(
          `Shopify API authentication failed (${response.status})`,
          'AUTHENTICATION_ERROR',
          undefined,
          undefined,
          response.status
        );
      }

      // Try to get error details from response
      let errorDetails = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorDetails += ` - ${errorBody}`;
        }
      } catch {
        // Ignore error body parsing failures
      }

      throw new ShopifyServerError(
        errorDetails,
        'NETWORK_ERROR',
        undefined,
        undefined,
        response.status
      );
    }

    const result: ShopifyGraphQLResponse<T> = await response.json();

    console.log(`✅ Shopify API Response parsed successfully`);

    if (result.errors?.length) {
      // Log GraphQL errors for debugging
      console.error('🚫 Shopify GraphQL Errors:', result.errors);

      // Create detailed error message
      const errorDetails = result.errors.map(err => {
        const pathInfo = err.path ? ` (Path: ${err.path.join('.')})` : '';
        const locationInfo = err.locations
          ? ` (Line: ${err.locations[0]?.line}, Column: ${err.locations[0]?.column})`
          : '';
        return `${err.message}${pathInfo}${locationInfo}`;
      }).join('; ');

      throw new ShopifyServerError(
        `GraphQL errors: ${errorDetails}`,
        'GRAPHQL_ERROR',
        undefined,
        result.errors
      );
    }

    if (!result.data) {
      throw new ShopifyServerError(
        'No data returned from Shopify API',
        'UNKNOWN_ERROR'
      );
    }

    console.log(`🎉 Shopify API operation completed successfully`);
    return result.data;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ShopifyServerError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ShopifyServerError(
          'Shopify API request timeout',
          'NETWORK_ERROR',
          error
        );
      }

      // Network errors that might be retryable
      if (retryCount < SHOPIFY_SERVER_CONFIG.retries! &&
          (error.message.includes('fetch') ||
           error.message.includes('network') ||
           error.message.includes('timeout'))) {

        const delay = SHOPIFY_SERVER_CONFIG.retryDelay! * Math.pow(2, retryCount);
        console.log(`🔄 Network error, retrying in ${delay}ms (attempt ${retryCount + 1}):`, error.message);

        await sleep(delay);
        return shopifyFetch<T>(query, variables, retryCount + 1, useAdminAPI);
      }

      throw new ShopifyServerError(
        `Network error: ${error.message}`,
        'NETWORK_ERROR',
        error
      );
    }

    throw new ShopifyServerError(
      'Unknown error occurred during Shopify API request',
      'UNKNOWN_ERROR'
    );
  }
}

// Server-side cart operations using official Shopify mutations

export async function serverCreateCart(input: CartCreateInput) {
  const CART_CREATE_MUTATION = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
          createdAt
          updatedAt
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                    }
                  }
                }
                cost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                attributes {
                  key
                  value
                }
              }
            }
          }
          attributes {
            key
            value
          }
          buyerIdentity {
            email
            phone
            customer {
              id
            }
            countryCode
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<{
    cartCreate: {
      cart: ShopifyCart;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>(CART_CREATE_MUTATION, { input });
}

export async function serverAddCartLines(cartId: string, lines: CartLineAddInput[]) {
  const CART_LINES_ADD_MUTATION = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
                cost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<{
    cartLinesAdd: {
      cart: ShopifyCart;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>(CART_LINES_ADD_MUTATION, { cartId, lines });
}

export async function serverUpdateCartLines(cartId: string, lines: CartLineUpdateInput[]) {
  const CART_LINES_UPDATE_MUTATION = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<{
    cartLinesUpdate: {
      cart: ShopifyCart;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>(CART_LINES_UPDATE_MUTATION, { cartId, lines });
}

export async function serverRemoveCartLines(cartId: string, lineIds: string[]) {
  const CART_LINES_REMOVE_MUTATION = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 250) {
            edges {
              node {
                id
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<{
    cartLinesRemove: {
      cart: ShopifyCart;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
}

// Server-side cart retrieval (for secure operations)
export async function serverGetCart(cartId: string) {
  const CART_QUERY = `
    query cart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        createdAt
        updatedAt
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
        lines(first: 250) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                  }
                }
              }
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              attributes {
                key
                value
              }
            }
          }
        }
        attributes {
          key
          value
        }
        buyerIdentity {
          email
          phone
          customer {
            id
          }
          countryCode
        }
      }
    }
  `;

  return shopifyFetch<{ cart: ShopifyCart }>(CART_QUERY, { cartId });
}

// Export configuration for debugging (server-side only)
export { SHOPIFY_SERVER_CONFIG };