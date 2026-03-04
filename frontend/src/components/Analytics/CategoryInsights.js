'use client';

export default function CategoryInsights({ topCategory, leastCompletedCategory }) {
  if (!topCategory && !leastCompletedCategory) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No category data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Category */}
      {topCategory && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600">Best Performing Category</p>
              <h3 className="text-2xl font-bold text-green-900 mt-2">
                {topCategory.category}
              </h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Completion Rate</span>
                  <span className="text-lg font-bold text-green-700">
                    {Math.round(topCategory.completionRate)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${topCategory.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-green-600">Total</p>
                  <p className="text-lg font-bold text-green-900">{topCategory.total}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-green-600">Done</p>
                  <p className="text-lg font-bold text-green-900">{topCategory.completed}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-green-600">Pending</p>
                  <p className="text-lg font-bold text-green-900">
                    {topCategory.total - topCategory.completed}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-4xl ml-4">🏆</div>
          </div>
        </div>
      )}

      {/* Least Completed Category */}
      {leastCompletedCategory && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-600">Needs Improvement</p>
              <h3 className="text-2xl font-bold text-orange-900 mt-2">
                {leastCompletedCategory.category}
              </h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700">Completion Rate</span>
                  <span className="text-lg font-bold text-orange-700">
                    {Math.round(leastCompletedCategory.completionRate)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${leastCompletedCategory.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-orange-600">Total</p>
                  <p className="text-lg font-bold text-orange-900">{leastCompletedCategory.total}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-orange-600">Done</p>
                  <p className="text-lg font-bold text-orange-900">{leastCompletedCategory.completed}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-orange-600">Pending</p>
                  <p className="text-lg font-bold text-orange-900">
                    {leastCompletedCategory.total - leastCompletedCategory.completed}
                  </p>
                </div>
              </div>

              <p className="text-xs text-orange-700 mt-3">
                💡 Focus on this category to improve your overall productivity
              </p>
            </div>
            <div className="text-4xl ml-4">⚠️</div>
          </div>
        </div>
      )}
    </div>
  );
}
