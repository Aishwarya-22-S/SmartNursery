import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const DAY = 24 * 60 * 60 * 1000

function getOrderStage(order) {
  const stages = {
    stagePlaced: 'Processing',
    stageConfirmed: 'Confirmed',
    stagePacked: 'Packed',
    stageTransit: 'In Transit',
    stageOutDelivery: 'Out for Delivery',
    stageDelivered: 'Delivered',
    stageCancelled: 'Cancelled',
  }
  return stages[order.orderStatus] || order.paymentStatus || 'Processing'
}

function SalesChart({ orders, t, language }) {
  const { days, values, labels, total, month } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const monthIndex = now.getMonth()
    const dayCount = new Date(year, monthIndex + 1, 0).getDate()
    const daily = Array(dayCount).fill(0)
    for (const order of orders) {
      if (order.paymentStatus !== 'Verified' || !order.createdAt) continue
      const date = new Date(order.createdAt)
      if (date.getFullYear() === year && date.getMonth() === monthIndex) daily[date.getDate() - 1] += Number(order.totalAmount || 0)
    }
    const plotWidth = 496
    const plotHeight = 142
    const maxValue = Math.max(...daily, 1)
    const points = daily.map((value, index) => ({
      x: 12 + (index / Math.max(dayCount - 1, 1)) * plotWidth,
      y: 154 - (value / maxValue) * plotHeight,
    }))
    const tickDays = [1, 8, 15, 22, 29].filter((day) => day <= dayCount)
    const tickLabels = tickDays.map((day) => ({
      day,
      x: 12 + ((day - 1) / Math.max(dayCount - 1, 1)) * plotWidth,
    }))
    const month = now.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { month: 'short' })
    return { days: points, values: daily, labels: tickLabels, total: daily.reduce((sum, value) => sum + value, 0), month }
  }, [orders, language])

  const polyline = days.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
  const area = days.length ? `12,154 ${polyline} ${days[days.length - 1].x.toFixed(1)},154` : ''

  return (
    <section className="admin-panel admin-sales-panel" aria-labelledby="admin-sales-title">
      <div className="admin-panel-heading">
        <h2 id="admin-sales-title">{t('adminSalesOverview')}</h2>
        <span className="admin-period-label">{t('adminThisMonth')} <span aria-hidden="true">⌄</span></span>
      </div>
      <div className="admin-sales-total">₹{money.format(total)} <span>{t('adminVerifiedSalesThisMonth')}</span></div>
      <div className="admin-chart-wrap">
        <svg className="admin-sales-chart" viewBox="0 0 520 190" role="img" aria-label={`${t('adminSalesOverview')}: ₹${money.format(total)}`}>
          <defs><linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".16" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
          <line x1="12" y1="154" x2="508" y2="154" className="admin-chart-axis" />
          <line x1="12" y1="83" x2="508" y2="83" className="admin-chart-gridline" />
          {total > 0 && <polygon points={area} fill="url(#sales-fill)" />}
          <polyline points={polyline} className="admin-chart-line" />
          {values.map((value, index) => value > 0 && <circle key={index} cx={days[index].x} cy={days[index].y} r="3.2" className="admin-chart-point"><title>Day {index + 1}: ₹{money.format(value)}</title></circle>)}
          {labels.map((label) => <text key={label.day} x={label.x} y="180" textAnchor={label.day === 1 ? 'start' : label.day === 29 ? 'end' : 'middle'} className="admin-chart-label">{label.day} {month}</text>)}
        </svg>
        {total === 0 && <div className="admin-chart-empty">{t('adminNoSalesThisMonth')}</div>}
      </div>
    </section>
  )
}

function AdminDashboard() {
  const { t, orders = [], language } = useContext(AppContext)
  const [counts, setCounts] = useState({ users: null, plants: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([api.get('/users'), api.get('/plants')]).then(([usersResult, plantsResult]) => {
      if (cancelled) return
      setCounts({
        users: usersResult.status === 'fulfilled' ? (usersResult.value.users || []).length : 0,
        plants: plantsResult.status === 'fulfilled' ? (plantsResult.value.plants || []).length : 0,
      })
      if (usersResult.status === 'rejected') console.error('Failed to load dashboard users:', usersResult.reason?.message)
      if (plantsResult.status === 'rejected') console.error('Failed to load dashboard plants:', plantsResult.reason?.message)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const sortedOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [orders])
  const revenue = useMemo(() => orders.filter((order) => order.paymentStatus === 'Verified').reduce((sum, order) => sum + Number(order.totalAmount || 0), 0), [orders])
  const metrics = [
    { icon: '♟', value: counts.users, label: t('adminTotalUsers'), tone: 'users' },
    { icon: '♧', value: counts.plants, label: t('adminTotalPlants'), tone: 'plants' },
    { icon: '▤', value: orders.length, label: t('adminTotalOrders'), tone: 'orders' },
    { icon: '₹', value: `₹${money.format(revenue)}`, label: t('adminRevenue'), tone: 'revenue' },
  ]

  return (
    <div className="page-content admin-dashboard-page">
      <div className="page-header admin-dashboard-header">
        <div className="dash-title">{t('adminDashboard')}</div>
        <div className="dash-subtitle">{t('adminOverviewSubtitle')}</div>
      </div>

      <div className="admin-kpi-grid" aria-label={t('adminBusinessSummary')}>
        {metrics.map((metric) => (
          <article className={`admin-kpi-card admin-kpi-${metric.tone}`} key={metric.tone}>
            <span className="admin-kpi-icon" aria-hidden="true">{metric.icon}</span>
            <span className="admin-kpi-copy"><strong>{loading && metric.value === null ? '—' : metric.value}</strong><span>{metric.label}</span></span>
          </article>
        ))}
      </div>

      <div className="admin-dashboard-panels">
        <SalesChart orders={orders} t={t} language={language} />
        <section className="admin-panel admin-recent-panel" aria-labelledby="admin-recent-title">
          <div className="admin-panel-heading">
            <h2 id="admin-recent-title">{t('adminRecentOrders')}</h2>
            <Link to="/payment-verification" className="admin-view-all">{t('viewAll')}</Link>
          </div>
          {sortedOrders.length === 0 ? (
            <div className="admin-orders-empty"><span aria-hidden="true">▤</span><p>{t('adminNoOrders')}</p></div>
          ) : (
            <div className="admin-recent-list">
              {sortedOrders.slice(0, 5).map((order) => {
                const items = order.items || []
                const summary = items.length ? `${items[0].name}${items.length > 1 ? ` +${items.length - 1}` : ''}` : t('adminPlantOrder')
                const status = getOrderStage(order)
                const tone = order.orderStatus === 'stageDelivered' ? 'success' : order.orderStatus === 'stageCancelled' ? 'muted' : 'pending'
                return (
                  <Link to="/payment-verification" className="admin-recent-order" key={order._id || order.id}>
                    <span className="admin-order-plant-icon" aria-hidden="true">♧</span>
                    <span className="admin-order-copy"><strong>{summary}</strong><small>{order.orderNumber || order.id}</small></span>
                    <span className={`admin-order-status admin-order-status-${tone}`}>{status}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
