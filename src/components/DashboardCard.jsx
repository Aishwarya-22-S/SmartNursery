import { memo } from 'react'

// React.memo - prevents unnecessary re-rendering of stat cards
const DashboardCard = memo(function DashboardCard({ icon, label, value }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
})

export default DashboardCard
