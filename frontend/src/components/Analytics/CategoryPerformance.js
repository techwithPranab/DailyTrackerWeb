'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function CategoryPerformance({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No category data available
      </div>
    );
  }

  const colors = {
    'Completed': '#10b981',
    'In Progress': '#f59e0b',
    'Not Started': '#ef4444'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Category Performance</h3>
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              formatter={(value) => Math.round(value * 10) / 10}
            />
            <Legend />
            <Bar dataKey="completed" fill={colors['Completed']} name="Completed" />
            <Bar dataKey="inProgress" fill={colors['In Progress']} name="In Progress" />
            <Bar dataKey="notStarted" fill={colors['Not Started']} name="Not Started" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Completed</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((category, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{category.category}</td>
                <td className="text-center py-3 px-4 text-gray-600">{category.total}</td>
                <td className="text-center py-3 px-4 text-gray-600">{category.completed}</td>
                <td className="text-center py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.completionRate >= 75 ? 'bg-green-100 text-green-800' :
                    category.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(category.completionRate)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
