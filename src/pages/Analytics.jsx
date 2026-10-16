import { useState, useEffect, useContext, useMemo } from 'react'
import DashboardCard from '../components/DashboardCard.jsx'
import { AppContext } from '../context/AppContext.jsx'

const periodKeys = ['periodThisMonth', 'periodLastMonth', 'periodThisYear']

// startOfPeriod - the cutoff date for each period filter, computed from
// "now" so "This Month" etc. always reflect real orders.
function startOfPeriod(period) {
  const now = new Date()
  if (period === 'periodThisYear') return new Date(now.getFullYear(), 0, 1)
  if (period === 'periodLastMonth') return new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function Analytics() {
  // useContext - reads the translation helper AND the real, MongoDB-backed
  // orders list from AppContext (admin/staff already receive every order)
  const { t, orders } = useContext(AppContext)

  // useState - tracks the selected reporting time period
  const [period, setPeriod] = useState('periodThisMonth')

  // data / topPlants - derived from real orders instead of a hard-coded
  // demo payload, filtered to the selected period.
  const { data, topPlants, stockMetrics } = useMemo(() => {
    const from = startOfPeriod(period)
    const to = period === 'periodLastMonth' ? new Date(from.getFullYear(), from.getMonth() + 1, 1) : new Date()
    const inRange = orders.filter((o) => {
      const created = new Date(o.createdAt)
      return created >= from && created < to
    })

    const totalSales = inRange.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    const customers = new Set(inRange.map((o) => o.customerEmail))
    const verifiedPayments = inRange.filter((o) => o.paymentStatus === 'Verified').length
    const pendingPayments = inRange.filter((o) => o.paymentStatus === 'Pending').length

    const salesByPlant = {}
    inRange.forEach((o) => {
      o.items?.forEach((item) => {
        salesByPlant[item.name] = (salesByPlant[item.name] || 0) + item.qty
      })
    })
    const ranked = Object.entries(salesByPlant)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, sales], i) => ({ rank: i + 1, name, sales }))

    return {
      data: {
        totalSales: totalSales.toLocaleString('en-IN'),
        totalOrders: inRange.length,
        newCustomers: customers.size,
        bestSelling: ranked[0]?.name || '—',
        verifiedPayments,
        pendingPayments,
        avgOrderValue: inRange.length > 0 ? Math.round(totalSales / inRange.length) : 0,
      },
      topPlants: ranked,
      stockMetrics: {
        inStock: 'Calculated from inventory',
        lowStock: 'Calculated from inventory',
        outOfStock: 'Calculated from inventory',
      }
    }
  }, [orders, period])

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">{t('analyticsTitle')}</div>
        <div className="dash-subtitle">{t('analyticsSubtitle')}</div>
      </div>

      <div className="chip-row mb-24">
        {periodKeys.map((pk) => (
          <button key={pk} className={`chip ${period === pk ? 'active' : ''}`} onClick={() => setPeriod(pk)}>{t(pk)}</button>
        ))}
      </div>

      {!data ? (
        <p className="text-muted">{t('loadingAnalytics')}</p>
      ) : (
        <>
          <div className="grid grid-4 mb-24">
            <DashboardCard icon="💰" label={t('statTotalSales')} value={`₹${data.totalSales}`} />
            <DashboardCard icon="🧾" label={t('statTotalOrders')} value={data.totalOrders} />
            <DashboardCard icon="🧑‍🤝‍🧑" label={t('statNewCustomers')} value={data.newCustomers} />
            <DashboardCard icon="🏆" label={t('statBestSelling')} value={data.bestSelling} />
          </div>
          <div className="grid grid-4 mb-24">
            <DashboardCard icon="✅" label="Verified Payments" value={data.verifiedPayments} />
            <DashboardCard icon="⏳" label="Pending Payments" value={data.pendingPayments} />
            <DashboardCard icon="📊" label="Avg Order Value" value={`₹${data.avgOrderValue}`} />
            <DashboardCard icon="📈" label="Total Transactions" value={data.totalOrders} />
          </div>
        </>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">{t('salesTrend')}<span className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>{t(period)} ▾</span></div>
          <svg viewBox="0 0 300 120" style={{ width: '100%', height: 160 }}>
            {[60, 90, 75, 100, 65, 85, 70].map((h, i) => (
              <rect key={i} x={i * 42 + 10} y={120 - h} width="24" height={h} fill="var(--primary)" rx="4" />
            ))}
          </svg>
          <div className="flex-between text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>
            <span>1 May</span><span>8 May</span><span>15 May</span><span>29 May</span>
          </div>
        </div>

        <div className="card">
          <div className="section-title">{t('topSellingPlants')}<span className="view-all">{t('viewFullReport')}</span></div>
          {topPlants.length === 0 && <p className="text-muted">{t('noPlantsMatch')}</p>}
          {topPlants.map((p) => (
            <div key={p.rank} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{p.rank}. {p.name}</span>
              <span style={{ fontWeight: 700 }}>{p.sales}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics
