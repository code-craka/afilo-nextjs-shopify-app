'use client';

import { useState, useEffect } from 'react';
// No longer importing from shopify lib directly on client
import type { ShopifyProduct, ShopifyCollection } from '@/types/shopify';
import type { DebugProductResponse } from '@/lib/shopify'; // Type is still needed

export default function TestShopifyPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugProductResponse | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test connection via API proxy
      console.log('Testing Shopify connection via API proxy...');
      const connRes = await fetch('/api/test-connection');
      const connection = await connRes.json();
      setConnectionStatus(connection);

      if (!connection.success) {
        throw new Error(`Connection failed: ${connection.message}`);
      }

      // Debug product query via API proxy
      console.log('Testing minimal product query via API proxy...');
      const debugRes = await fetch('/api/debug-query');
      const debug = await debugRes.json();
      setDebugInfo(debug);
      console.log('Debug result:', debug);

      if (debug.success) {
        // Fetch products via API proxy
        console.log('Fetching products via API proxy...');
        const productsRes = await fetch('/api/products?first=10');
        const { products: productsData } = await productsRes.json();
        setProducts(productsData);
        console.log(`Fetched ${productsData.length} products`);

        // Fetch collections via API proxy
        console.log('Fetching collections via API proxy...');
        const collectionsRes = await fetch('/api/collections?first=5');
        const { collections: collectionsData } = await collectionsRes.json();
        setCollections(collectionsData);
        console.log(`Fetched ${collectionsData.length} collections`);
      } else {
        throw new Error(`Product query failed: ${debug.message}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Test failed:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Shopify Integration Test</h1>

      {/* Connection Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        {connectionStatus ? (
          <div className={`p-4 rounded-lg border ${
            connectionStatus.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="font-medium">
              {connectionStatus.success ? '✅' : '❌'} {connectionStatus.message}
            </p>
            {connectionStatus.details && (
              <div className="mt-2 text-sm">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(connectionStatus.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
            Testing connection...
          </div>
        ) : null}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
          <h3 className="font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading Shopify data...</p>
        </div>
      )}

      {/* Products */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="mb-3">
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="font-medium text-lg mb-2">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">
                  {product.priceRange.minVariantPrice.currencyCode} {product.priceRange.minVariantPrice.amount}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${
                  product.availableForSale
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.availableForSale ? 'Available' : 'Sold Out'}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Handle: {product.handle} | Variants: {product.variants.edges.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Collections ({collections.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((collection) => (
            <div key={collection.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start space-x-4">
                {collection.image ? (
                  <img
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">{collection.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {collection.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    Handle: {collection.handle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Actions */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <button
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running Tests...' : 'Re-run Tests'}
        </button>
      </div>

      {/* Debug Info */}
      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg space-y-4">
          <div>
            <p><strong>Store Domain:</strong> {process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}</p>
            <p><strong>API Version:</strong> 2024-10</p>
            <p><strong>Products Loaded:</strong> {products.length}</p>
            <p><strong>Collections Loaded:</strong> {collections.length}</p>
          </div>

          {debugInfo && (
            <div>
              <h3 className="font-semibold mb-2">Product Query Debug:</h3>
              <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}