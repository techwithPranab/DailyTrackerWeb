'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WeeklyActivityTrend({ data, activityWeeklyData = [] }) {
  const [selectedActivity, setSelectedActivity] = useState('all');

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        <p>No weekly data available</p>
      </div>
    );
  }

  // Determine which data to display
  let chartData = data;
  let chartTitle = 'Total Completed Tasks';
  let dataKey = 'completed';
  let metricLabel = 'Tasks';
  
  if (selectedActivity !== 'all') {
    const selectedActivityData = activityWeeklyData.find(a => a.id === selectedActivity);
    if (selectedActivityData) {
      chartData = selectedActivityData.data;
      chartTitle = `${selectedActivityData.name}`;
      dataKey = 'value';
      metricLabel = selectedActivityData.metric === 'Min' ? 'Minutes' :
                    selectedActivityData.metric === 'Hr' ? 'Hours' :
                    selectedActivityData.metric === 'Km' ? 'Kilometers' :
                    selectedActivityData.metric === 'Mi' ? 'Miles' :
                    selectedActivityData.metric === 'L' ? 'Liters' :
                    selectedActivityData.metric === 'ml' ? 'Milliliters' :
                    selectedActivityData.metric === 'lb' ? 'Pounds' :
                    selectedActivityData.metric === 'kg' ? 'Kilograms' :
                    selectedActivityData.metric === 'reps' ? 'Reps' :
                    selectedActivityData.metric === 'steps' ? 'Steps' :
                    selectedActivityData.metric === 'pages' ? 'Pages' :
                    selectedActivityData.metric === 'sessions' ? 'Sessions' :
                    selectedActivityData.metric;
    }
  }

  const totalValue = chartData.reduce((sum, d) => sum + (d[dataKey] || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Weekly Activity Trend (Last 7 Days - Daily Tasks)
        </h3>
        
        {/* Activity Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">View:</label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Tasks (Completed Count)</option>
            {activityWeeklyData.map(activity => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Title */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing: <span className="font-semibold text-gray-900">{chartTitle}</span>
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              formatter={(value) => [`${value} ${metricLabel}`, chartTitle]}
            />
            <Legend />
            <Bar 
              dataKey={dataKey} 
              fill="#10b981" 
              name={selectedActivity === 'all' ? 'Completed Tasks' : metricLabel}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">
            Total {selectedActivity === 'all' ? 'Completed' : metricLabel}
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {totalValue}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">
            Daily Average
          </p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {Math.round(totalValue / chartData.length)}
          </p>
        </div>
        {selectedActivity === 'all' && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Total Created</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {data.reduce((sum, d) => sum + d.created, 0)}
            </p>
          </div>
        )}
        {selectedActivity !== 'all' && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Days Active</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {chartData.filter(d => d[dataKey] > 0).length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
