const StatsCard = ({ title, value, suffix = "" }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 backdrop-blur-sm">
      <div className="text-gray-400 text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold mt-2 text-yellow-400">
        {value}
        {suffix}
      </div>
    </div>
  )
}

export default StatsCard
