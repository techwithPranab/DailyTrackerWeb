export default function StatCard({ icon, label, value, color }) {
  return (
    <div className={`${color} rounded-lg p-6 shadow-sm border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
