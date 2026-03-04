'use client';

export default function MilestoneInsights({ 
  mostActiveMilestone, 
  fastestCompletedMilestone,
  averageCompletionTime,
  overallProgress 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Most Active Milestone */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Most Active Milestone</p>
            {mostActiveMilestone ? (
              <>
                <h3 className="text-lg font-bold text-blue-900 mt-2 line-clamp-2">
                  {mostActiveMilestone.title}
                </h3>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${mostActiveMilestone.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-900">
                    {Math.round(mostActiveMilestone.progress)}%
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {mostActiveMilestone.currentValue} of {mostActiveMilestone.targetValue} completed
                </p>
              </>
            ) : (
              <p className="text-gray-500 mt-2">No milestones yet</p>
            )}
          </div>
          <div className="text-3xl">🎯</div>
        </div>
      </div>

      {/* Fastest Completed */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Fastest Completed</p>
            {fastestCompletedMilestone ? (
              <>
                <h3 className="text-lg font-bold text-green-900 mt-2 line-clamp-2">
                  {fastestCompletedMilestone.title}
                </h3>
                <div className="mt-3 bg-green-200 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-700">
                    {fastestCompletedMilestone.daysToComplete}
                  </p>
                  <p className="text-xs text-green-600">days to complete</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 mt-2">No completed milestones yet</p>
            )}
          </div>
          <div className="text-3xl">⚡</div>
        </div>
      </div>

      {/* Average Completion Time */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600">Avg. Completion Time</p>
            <div className="mt-3 bg-purple-200 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-700">
                {averageCompletionTime}
              </p>
              <p className="text-xs text-purple-600">days on average</p>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              Based on your completed milestones
            </p>
          </div>
          <div className="text-3xl">⏱️</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Overall Progress</p>
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex-1 bg-orange-200 rounded-full h-3">
                    <div 
                      className="bg-orange-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-700 min-w-12 text-right">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <p className="text-xs text-orange-700 mt-2">
                Average progress across all milestones
              </p>
            </div>
          </div>
          <div className="text-3xl">📈</div>
        </div>
      </div>
    </div>
  );
}
