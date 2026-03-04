'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StatCard from '@/components/Analytics/StatCard';
import CategoryPerformance from '@/components/Analytics/CategoryPerformance';
import WeeklyActivityTrend from '@/components/Analytics/WeeklyActivityTrend';
import MilestoneInsights from '@/components/Analytics/MilestoneInsights';
import CategoryInsights from '@/components/Analytics/CategoryInsights';
import { PieChart, BarChart, LineChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Bar } from 'recharts';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Activity data
  const [activityStats, setActivityStats] = useState(null);
  const [activityByStatus, setActivityByStatus] = useState([]);
  const [activityByCategory, setActivityByCategory] = useState([]);
  const [activityTrend, setActivityTrend] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [topCategory, setTopCategory] = useState(null);
  const [leastCompletedCategory, setLeastCompletedCategory] = useState(null);

  // Milestone data
  const [milestoneStats, setMilestoneStats] = useState(null);
  const [milestoneByStatus, setMilestoneByStatus] = useState([]);
  const [milestoneProgress, setMilestoneProgress] = useState([]);
  const [mostActiveMilestone, setMostActiveMilestone] = useState(null);
  const [fastestCompletedMilestone, setFastestCompletedMilestone] = useState(null);
  const [milestoneTimeline, setMilestoneTimeline] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // Colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Check if user is Pro member
  useEffect(() => {
    if (!authLoading && (!user || user.subscription?.plan !== 'pro')) {
      router.push('/dashboard');
      toast.error('Analytics is only available for Pro members');
    }
  }, [user, authLoading, router]);

  // Fetch analytics data
  useEffect(() => {
    if (!user || user.subscription?.plan !== 'pro') return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [activitiesRes, milestonesRes] = await Promise.all([
          api.get('/activities/analytics'),
          api.get('/milestones/analytics'),
        ]);

        const activitiesData = activitiesRes.data.data;
        const milestonesData = milestonesRes.data.data;

        // Process activity data - Phase 2 enhanced
        setActivityStats({
          total: activitiesData.total,
          completed: activitiesData.completed,
          inProgress: activitiesData.inProgress,
          notStarted: activitiesData.notStarted,
          completionRate: activitiesData.completionRate,
          averageCompletionTime: activitiesData.averageCompletionTime,
        });

        setActivityByStatus([
          { name: 'Completed', value: activitiesData.completed, color: '#10b981' },
          { name: 'In Progress', value: activitiesData.inProgress, color: '#f59e0b' },
          { name: 'Not Started', value: activitiesData.notStarted, color: '#ef4444' },
        ].filter(item => item.value > 0));

        setActivityByCategory(activitiesData.byCategory || []);
        setActivityTrend(activitiesData.trend || []);
        setCategoryPerformance(activitiesData.categoryPerformance || []);
        setWeeklyStats(activitiesData.weeklyStats || []);
        setTopCategory(activitiesData.topCategory);
        setLeastCompletedCategory(activitiesData.leastCompletedCategory);

        // Process milestone data - Phase 2 enhanced
        setMilestoneStats({
          total: milestonesData.total,
          completed: milestonesData.completed,
          active: milestonesData.active,
          abandoned: milestonesData.abandoned,
          completionRate: milestonesData.completionRate,
          averageCompletionTime: milestonesData.averageCompletionTime,
          overallProgress: milestonesData.overallProgress,
        });

        setMilestoneByStatus([
          { name: 'Completed', value: milestonesData.completed, color: '#10b981' },
          { name: 'Active', value: milestonesData.active, color: '#3b82f6' },
          { name: 'Abandoned', value: milestonesData.abandoned, color: '#ef4444' },
        ].filter(item => item.value > 0));

        setMilestoneProgress(milestonesData.progress || []);
        setMostActiveMilestone(milestonesData.mostActiveMilestone);
        setFastestCompletedMilestone(milestonesData.fastestCompletedMilestone);
        setMilestoneTimeline(milestonesData.milestoneTimeline || []);
        setOverallProgress(milestonesData.overallProgress || 0);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">Comprehensive view of your activities and milestones to help you stay productive</p>
        </div>

        {/* Activity Analytics Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">📝 Activity Analytics</h2>

          {/* Activity Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon="📊"
              label="Total Activities"
              value={activityStats?.total || 0}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon="✅"
              label="Completed"
              value={activityStats?.completed || 0}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              icon="⏳"
              label="In Progress"
              value={activityStats?.inProgress || 0}
              color="bg-yellow-50 text-yellow-600"
            />
            <StatCard
              icon="📌"
              label="Not Started"
              value={activityStats?.notStarted || 0}
              color="bg-red-50 text-red-600"
            />
            <StatCard
              icon="📈"
              label="Completion Rate"
              value={`${Math.round(activityStats?.completionRate || 0)}%`}
              color="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon="⏱️"
              label="Avg. Completion"
              value={`${activityStats?.averageCompletionTime || 0} days`}
              color="bg-indigo-50 text-indigo-600"
            />
          </div>

          {/* Category Insights */}
          {(topCategory || leastCompletedCategory) && (
            <div className="mb-8">
              <CategoryInsights 
                topCategory={topCategory} 
                leastCompletedCategory={leastCompletedCategory}
              />
            </div>
          )}

          {/* Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Activities by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities by Status</h3>
              {activityByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  <p>No activities yet. Start creating activities to see charts!</p>
                </div>
              )}
            </div>

            {/* Activities by Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities by Category</h3>
              {activityByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  <p>No category data available yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Performance Table */}
          {categoryPerformance.length > 0 && (
            <div className="mb-8">
              <CategoryPerformance data={categoryPerformance} />
            </div>
          )}

          {/* Weekly Trend */}
          {weeklyStats.length > 0 && (
            <div className="mb-8">
              <WeeklyActivityTrend data={weeklyStats} />
            </div>
          )}

          {/* Activity Trend (Last 30 Days) */}
          {activityTrend.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" fill="#3b82f6" name="Created" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Milestone Analytics Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">🏆 Milestone Analytics</h2>

          {/* Milestone Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon="🎯"
              label="Total Milestones"
              value={milestoneStats?.total || 0}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon="🏅"
              label="Completed"
              value={milestoneStats?.completed || 0}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              icon="🔄"
              label="Active"
              value={milestoneStats?.active || 0}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon="❌"
              label="Abandoned"
              value={milestoneStats?.abandoned || 0}
              color="bg-red-50 text-red-600"
            />
            <StatCard
              icon="🎊"
              label="Completion Rate"
              value={`${Math.round(milestoneStats?.completionRate || 0)}%`}
              color="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon="📈"
              label="Overall Progress"
              value={`${Math.round(overallProgress)}%`}
              color="bg-orange-50 text-orange-600"
            />
          </div>

          {/* Milestone Insights */}
          {(mostActiveMilestone || fastestCompletedMilestone || milestoneStats) && (
            <div className="mb-8">
              <MilestoneInsights 
                mostActiveMilestone={mostActiveMilestone}
                fastestCompletedMilestone={fastestCompletedMilestone}
                averageCompletionTime={milestoneStats?.averageCompletionTime || 0}
                overallProgress={overallProgress}
              />
            </div>
          )}

          {/* Milestone Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Milestones by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones by Status</h3>
              {milestoneByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={milestoneByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {milestoneByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  <p>No milestones yet. Create milestones to see charts!</p>
                </div>
              )}
            </div>

            {/* Milestone Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Progress</h3>
              {milestoneProgress.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {milestoneProgress.slice(0, 5).map((milestone) => (
                    <div key={milestone._id}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700 truncate">{milestone.title}</p>
                        <p className="text-sm font-semibold text-gray-900 ml-2">{Math.round(milestone.progress)}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {milestoneProgress.length > 5 && (
                    <p className="text-xs text-gray-500 text-center mt-2">+{milestoneProgress.length - 5} more</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-gray-400">
                  <p>No milestone progress data available yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Milestone Timeline */}
          {milestoneTimeline.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={milestoneTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" fill="#3b82f6" name="Created" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
