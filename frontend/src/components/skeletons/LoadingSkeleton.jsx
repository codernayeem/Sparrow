const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Image Skeleton */}
        <div className="w-24 h-24 rounded-full bg-gray-300 animate-pulse"></div>

        {/* Profile Info Skeleton */}
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-300 rounded animate-pulse w-48"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse w-64"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
          
          {/* Stats Skeleton */}
          <div className="flex space-x-6 mt-4">
            <div className="text-center">
              <div className="h-6 w-8 bg-gray-300 rounded animate-pulse mx-auto mb-1"></div>
              <div className="h-3 w-12 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="text-center">
              <div className="h-6 w-8 bg-gray-300 rounded animate-pulse mx-auto mb-1"></div>
              <div className="h-3 w-12 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="text-center">
              <div className="h-6 w-8 bg-gray-300 rounded animate-pulse mx-auto mb-1"></div>
              <div className="h-3 w-12 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;