'use client';

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ProgressChart({ data }) {
  if (!data) return null;

  // Prepare data for charts
  const categoryData = Object.entries(data.byCategory || {}).map(([name, values]) => ({
    name,
    total: values.total,
    completed: values.completed,
    completionRate: values.total > 0 ? ((values.completed / values.total) * 100).toFixed(1) : 0
  }));

  const priorityData = Object.entries(data.byPriority || {}).map(([name, values]) => ({
    name,
    total: values.total,
    completed: values.completed
  }));

  const statusData = [
    { name: 'Completed', value: data.activities.completed },
    { name: 'In Progress', value: data.activities.inProgress },
    { name: 'Not Started', value: data.activities.notStarted }
  ];

  return (
    <div className="space-y-8">
      {/* Daily Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Daily Completion Trend (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#0ea5e9" 
              name="Total Activities"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10b981" 
              name="Completed"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category and Priority Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Activities by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#0ea5e9" name="Total" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No data available</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🥧 Activity Status Distribution
          </h3>
          {statusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No data available</p>
          )}
        </div>
      </div>

      {/* Priority Breakdown */}
      {priorityData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Activities by Priority
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#f59e0b" name="Total" />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Summary Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {data.activities.completionRate}%
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Completed Tasks</p>
            <p className="text-2xl font-bold text-green-600">
              {data.activities.completed}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Milestones Achieved</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.milestones.achieved}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-orange-600">
              {data.activities.inProgress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
