const StakeholderCard = ({ stakeholder }) => {
  const activeStakes = stakeholder.stakes.filter((stake) => stake.status === "active")

  const latestStake =
    stakeholder.stakes.length > 0
      ? new Date(Math.max(...stakeholder.stakes.map((s) => s.createdAt?.toDate?.() || new Date(s.createdAt))))
      : null

  const highestReward =
    stakeholder.stakes.length > 0 ? Math.max(...stakeholder.stakes.map((s) => s.rewardPercentage)) : 0

  // Get initials from full name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-cards rounded-lg border border-borders2 backdrop-blur-sm hover:bg-cards2 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-cards3 rounded-full flex items-center justify-center border border-borders">
            <span className="text-xl font-bold text-accent">{getInitials(stakeholder.fullName)}</span>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate max-w-[200px] text-primary font-Cerebri">
                {stakeholder.fullName}
              </h3>
              {stakeholder.isTelegramUser && (
                <span className="text-xs px-2 py-0.5 bg-[#229ED9] text-white rounded-full font-Cerebri">Telegram</span>
              )}
            </div>
            <p className="text-sm text-dimtext font-Cerebri">ID: {stakeholder.userId.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-cards3 rounded-lg p-3 border border-borders">
            <div className="text-sm text-secondary font-Cerebri">Total Stakes</div>
            <div className="text-lg font-semibold text-accent font-Cerebri">{stakeholder.stakes.length}</div>
          </div>
          <div className="bg-cards3 rounded-lg p-3 border border-borders">
            <div className="text-sm text-secondary font-Cerebri">Active Stakes</div>
            <div className="text-lg font-semibold text-accent font-Cerebri">{activeStakes.length}</div>
          </div>
        </div>

        <div className="mt-4 bg-cards3 rounded-lg p-3 border border-borders">
          <div className="text-sm text-secondary font-Cerebri">Highest Reward</div>
          <div className="text-lg font-semibold text-accent font-Cerebri">{highestReward}%</div>
        </div>
      </div>
    </div>
  )
}

export default StakeholderCard
