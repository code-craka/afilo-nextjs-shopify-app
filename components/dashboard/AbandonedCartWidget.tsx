'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShoppingCart, RefreshCw, Trash2 } from 'lucide-react';
import Image from 'next/image';

/**
 * Abandoned Cart Widget
 *
 * Displays user's abandoned cart items with:
 * - Time since abandoned
 * - Product details
 * - Restore to cart action
 * - Delete action
 */

interface AbandonedCartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
  licenseType: 'personal' | 'commercial';
  imageUrl?: string;
  abandonedAt: string;
}

export default function AbandonedCartWidget() {
  const [items, setItems] = useState<AbandonedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart/abandoned');
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch abandoned carts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (itemId: string) => {
    try {
      setProcessingId(itemId);
      const response = await fetch('/api/cart/abandoned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        // Remove from abandoned list
        setItems(items.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to restore item:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      setProcessingId(itemId);
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeAgo = (abandonedAt: string) => {
    const now = new Date();
    const abandoned = new Date(abandonedAt);
    const diffMs = now.getTime() - abandoned.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return `${diffMins}m ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Abandoned Carts
        </h2>
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No abandoned items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Abandoned Carts
        </h2>
        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
          >
            {/* Product Image */}
            {item.imageUrl && (
              <div className="relative w-12 h-12 flex-shrink-0 rounded bg-gray-200 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                  loading="lazy"
                />
              </div>
            )}

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                <span>{item.licenseType}</span>
                <span>•</span>
                <span>Qty: {item.quantity}</span>
                <span>•</span>
                <span className="text-orange-600 font-medium">
                  {getTimeAgo(item.abandonedAt)}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-sm font-semibold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleRestore(item.id)}
                disabled={processingId === item.id}
                className="p-2 rounded-md hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50"
                title="Restore to cart"
              >
                <RefreshCw className={`h-4 w-4 ${processingId === item.id ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={processingId === item.id}
                className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-orange-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Value:</span>
          <span className="font-semibold text-gray-900">
            ${items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
