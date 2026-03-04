'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WeeklyActivityTrend({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No weekly data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Weekly Activity Trend</h3>
      
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Legend />
            <Bar dataKey="created" fill="#3b82f6" name="Created" />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Total Created</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {data.reduce((sum, d) => sum + d.created, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Total Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {data.reduce((sum, d) => sum + d.completed, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Avg Daily Created</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {Math.round(data.reduce((sum, d) => sum + d.created, 0) / data.length)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {Math.round((data.reduce((sum, d) => sum + d.completed, 0) / Math.max(data.reduce((sum, d) => sum + d.created, 0), 1)) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
