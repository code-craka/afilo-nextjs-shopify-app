// Core Shopify GraphQL Types
export interface ShopifyImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney;
  image?: ShopifyImage;
  quantityAvailable?: number;
  sku?: string;
  weight?: number;
  weightUnit?: string;
}

export interface ShopifyProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  vendor: string;
  productType: string;
  tags: string[];
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  options: ShopifyProductOption[];
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  featuredImage?: ShopifyImage;
  seo: {
    title?: string;
    description?: string;
  };
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  updatedAt: string;
  image?: ShopifyImage;
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
  seo: {
    title?: string;
    description?: string;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: ShopifyProductVariant;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    compareAtAmountPerQuantity?: ShopifyMoney;
  };
  attributes: Array<{
    key: string;
    value: string;
  }>;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney;
    totalDutyAmount?: ShopifyMoney;
  };
  buyerIdentity: {
    email?: string;
    phone?: string;
    customer?: {
      id: string;
    };
    countryCode?: string;
  };
  attributes: Array<{
    key: string;
    value: string;
  }>;
  discountCodes: Array<{
    code: string;
    applicable: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ShopifyGraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
  extensions?: {
    cost?: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

export interface ShopifyProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  };
}

export interface ShopifyProductResponse {
  product: ShopifyProduct | null;
}

export interface ShopifyCollectionsResponse {
  collections: {
    edges: Array<{
      node: ShopifyCollection;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  };
}

export interface ShopifyCollectionResponse {
  collection: ShopifyCollection | null;
}

export interface ShopifyCartResponse {
  cart: ShopifyCart | null;
}

// Query Parameters
export interface ProductsQueryParams {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  query?: string;
  sortKey?: 'TITLE' | 'PRICE' | 'BEST_SELLING' | 'CREATED_AT' | 'UPDATED_AT' | 'PRODUCT_TYPE' | 'VENDOR' | 'RELEVANCE';
  reverse?: boolean;
}

export interface CollectionsQueryParams {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  query?: string;
  sortKey?: 'TITLE' | 'UPDATED_AT' | 'ID' | 'RELEVANCE';
  reverse?: boolean;
}

export interface CollectionProductsQueryParams extends ProductsQueryParams {
  collectionHandle: string;
}

// Cart Mutation Types
export interface CartCreateInput {
  lines?: Array<{
    merchandiseId: string;
    quantity: number;
    attributes?: Array<{
      key: string;
      value: string;
    }>;
  }>;
  buyerIdentity?: {
    email?: string;
    phone?: string;
    countryCode?: string;
  };
  attributes?: Array<{
    key: string;
    value: string;
  }>;
  discountCodes?: string[];
}

export interface CartLineUpdateInput {
  id: string;
  quantity?: number;
  merchandiseId?: string;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface CartLineAddInput {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

// Error Types
export interface ShopifyError extends Error {
  type: 'NETWORK_ERROR' | 'GRAPHQL_ERROR' | 'RATE_LIMIT_ERROR' | 'AUTHENTICATION_ERROR' | 'UNKNOWN_ERROR';
  originalError?: Error;
  graphqlErrors?: ShopifyGraphQLResponse['errors'];
  retryable: boolean;
}

// Configuration Types
export interface ShopifyConfig {
  domain: string;
  storefrontAccessToken: string;
  apiVersion?: string;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

// Subscription Types for Enterprise Features
export interface ShopifySubscriptionPlan {
  id: string;
  name: string;
  billingInterval: 'monthly' | 'annually';
  trialDays?: number;
  price: ShopifyMoney;
}

export interface ShopifySubscriptionContract {
  id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  customer: {
    id: string;
    email: string;
  };
  lines: Array<{
    productVariant: ShopifyProductVariant;
    quantity: number;
    currentPrice: ShopifyMoney;
  }>;
  billingPolicy: {
    interval: 'month' | 'year';
    intervalCount: number;
  };
  deliveryPolicy: {
    interval: 'month' | 'year';
    intervalCount: number;
  };
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced Product Types for Enterprise Software
export interface EnterpriseProductMetadata {
  softwareCategory: 'ai-tool' | 'template' | 'script' | 'plugin' | 'theme' | 'application' | 'api-service' | 'dataset';
  techStack: string[];
  licenseTypes: ('personal' | 'commercial' | 'extended' | 'enterprise' | 'developer')[];
  deploymentOptions: ('cloud' | 'on-premise' | 'hybrid' | 'saas')[];
  subscriptionSupported: boolean;
  trialPeriodDays?: number;
  minimumUsers?: number;
  maximumUsers?: number;
  complianceStandards: string[];
  integrationCapabilities: string[];
  supportLevel: 'community' | 'standard' | 'premium' | 'enterprise';
  documentation: {
    available: boolean;
    types: ('api-docs' | 'user-manual' | 'video-tutorials' | 'implementation-guide')[];
  };
  demoAvailable: boolean;
  customImplementationAvailable: boolean;
  version: string;
  releaseNotes?: string;
  systemRequirements: {
    os: string[];
    memory: string;
    storage: string;
    browser?: string[];
  };
}

// Pricing Tier Configuration
export interface PricingTierVariant extends ShopifyProductVariant {
  tierType: 'professional' | 'enterprise' | 'enterprise-plus';
  userLimits: {
    minimum: number;
    maximum: number;
  };
  features: string[];
  billingOptions: ('monthly' | 'annually' | 'one-time')[];
  volumeDiscounts: Array<{
    minimumQuantity: number;
    discountPercentage: number;
  }>;
}

// Utility Types
export type ShopifyHandle = string;
export type ShopifyID = string;
export type ShopifyCursor = string;