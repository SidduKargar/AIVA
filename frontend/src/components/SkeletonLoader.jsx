import React from 'react';

const SkeletonLoader = ({ darkMode }) => (
  <div className="py-6 animate-pulse">
    <div className="max-w-3xl mx-auto px-6">
      <div className="flex space-x-4">
        <div
          className={`w-8 h-8 rounded-full ${
            darkMode ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        />
        <div className="flex-1 space-y-3">
          <div
            className={`h-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-200'
            } rounded w-3/4`}
          />
          <div
            className={`h-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-200'
            } rounded w-1/2`}
          />
          <div
            className={`h-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-200'
            } rounded w-2/3`}
          />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
