import { useState, useContext, useMemo, useEffect } from 'react'
import DashboardCard from '../components/DashboardCard.jsx'
import { AppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'

const initialTasks = [
  { id: 1, time: '08:00 AM', taskKey: 'taskWatering', done: true },
  { id: 2, time: '10:00 AM', taskKey: 'taskFertilizer', done: true },
  { id: 3, time: '01:00 PM', taskKey: 'taskHealthCheck', done: false },
  { id: 4, time: '02:00 PM', taskKey: 'taskUpdateInventory', done: false },
]

const stageKeys = ['stagePlaced', 'stageConfirmed', 'stagePacked', 'stageTransit', 'stageOutDelivery', 'stageDelivered']
const PENDING_STAGES = ['stagePlaced', 'stageConfirmed']
const PROCESSING_STAGES = ['stagePacked', 'stageTransit', 'stageOutDelivery']

// StaffDashboard - doubles as "Admin > Staff Dashboard" (section A of the
// spec): whoever is viewing it (Admin or Staff) sees a clear breakdown of
// order status (Pending -> Processing -> Shipped/Ready -> Completed,
// Cancelled) and staff task progress, all built from real order data
// instead of vague/confusing text.
function StaffDashboard() {
  const { t, orders, updateOrderStatus, cancelOrder: cancelOrderApi, user } = useContext(AppContext)

  const [tasks, setTasks] = useState(initialTasks)
  const [inventory, setInventory] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })

  useEffect(() => { api.get('/inventory').then((res) => setInventory(res.summary || inventory)).catch(() => {}) }, [])

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
  }

  const completed = tasks.filter((task) => task.done).length

  const orderStats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => PENDING_STAGES.includes(o.orderStatus)).length
    const processing = orders.filter((o) => PROCESSING_STAGES.includes(o.orderStatus)).length
    const completedOrders = orders.filter((o) => o.orderStatus === 'stageDelivered').length
    const cancelled = orders.filter((o) => o.orderStatus === 'stageCancelled').length
    return { total, pending, processing, completed: completedOrders, cancelled }
  }, [orders])

  const advanceOrder = (order) => {
    const currentIndex = stageKeys.indexOf(order.orderStatus)
    if (currentIndex >= 0 && currentIndex < stageKeys.length - 1) {
      updateOrderStatus(order.id, stageKeys[currentIndex + 1])
    }
  }

  const cancelOrder = (order) => {
    const ok = window.confirm(`Cancel order ${order.id}? Items will be restocked.`)
    if (ok) cancelOrderApi(order.id)
  }

  const recentActivity = [...orders]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 6)

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">{user?.role === 'admin' ? t('staffDashboard') : t('staffHello')} 🌿</div>
        <div className="dash-subtitle">{t('staffSubtitle')}</div>
      </div>

      <div className="grid grid-4 mb-16">
        <DashboardCard icon="🧾" label="Total Orders" value={orderStats.total} />
        <DashboardCard icon="⏳" label="Pending Orders" value={orderStats.pending} />
        <DashboardCard icon="🔄" label="Processing Orders" value={orderStats.processing} />
        <DashboardCard icon="✅" label="Completed Orders" value={orderStats.completed} />
      </div>
      <div className="grid grid-4 mb-24">
        <DashboardCard icon="❌" label="Cancelled Orders" value={orderStats.cancelled} />
        <DashboardCard icon="📋" label={t('statMyTasks')} value={`${completed}/${tasks.length}`} />
        <DashboardCard icon="✔️" label="Completed Tasks" value={completed} />
        <DashboardCard icon="⏳" label={t('statPendingTasks')} value={tasks.length - completed} />
      </div>

      <div className="card mb-24">
        <div className="section-title">Plant Stock Snapshot</div>
        <div className="grid grid-4"><DashboardCard icon="🌿" label="Total Plants" value={inventory.total} /><DashboardCard icon="📦" label="In Stock" value={inventory.inStock} /><DashboardCard icon="⚠️" label="Low Stock" value={inventory.lowStock} /><DashboardCard icon="❌" label="Out of Stock" value={inventory.outOfStock} /></div>
      </div>

      <div className="card mb-24">
        <div className="section-title">{t('todaysSchedule')}</div>
        {tasks.map((task) => (
          <div key={task.id} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="flex-gap">
              <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 'calc(13.5px * var(--font-scale, 1))', textDecoration: task.done ? 'line-through' : 'none' }}>{t(task.taskKey)}</div>
                <div className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>{task.time}</div>
              </div>
            </div>
            <span className={`badge ${task.done ? 'badge-success' : 'badge-warning'}`}>{task.done ? t('statusDone') : t('statusPending')}</span>
          </div>
        ))}
      </div>

      <div className="card mb-24">
        <div className="section-title">Orders to Process</div>
        {orders.length === 0 && <p className="empty-state">No orders yet.</p>}
        {orders.map((order) => (
          <div key={order.id} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'calc(13.5px * var(--font-scale, 1))' }}>{order.id} · {order.customerName}</div>
              <div className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>₹{order.totalAmount} · {order.paymentStatus}</div>
            </div>
            <div className="flex-gap">
              <span className="badge badge-info">{t(order.orderStatus)}</span>
              {order.orderStatus !== 'stageDelivered' && order.orderStatus !== 'stageCancelled' && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => advanceOrder(order)}>Advance</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => cancelOrder(order)}>Cancel</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">Recent Staff Activity</div>
        {recentActivity.length === 0 && <p className="empty-state">No recent activity yet.</p>}
        {recentActivity.map((order) => (
          <div key={order.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span>{order.id} for {order.customerName} is now <strong>{t(order.orderStatus)}</strong></span>
            <span className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>{new Date(order.updatedAt || order.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StaffDashboard
