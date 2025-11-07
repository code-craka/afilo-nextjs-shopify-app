export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
      </div>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product images skeleton */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />

          {/* Thumbnail images */}
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-6">
          {/* Badge */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24 animate-pulse" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          </div>

          {/* Description */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* License selection */}
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1 animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        {/* Tab headers */}
        <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse mb-4" />
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mt-16">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}