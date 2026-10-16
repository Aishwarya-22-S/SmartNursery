import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const stageKeys = ['stagePlaced', 'stageConfirmed', 'stagePacked', 'stageTransit', 'stageOutDelivery', 'stageDelivered']

// OrderTracking - customer picks WHICH order to track (section 3.D of the
// spec: "Customer should be able to open an order and see..."), not just
// their single most recent one, and sees the full picture: order id,
// products, total, payment status, current status and a status timeline.
// Status changes Admin/Staff make elsewhere show up here automatically
// because everyone reads from the same `orders` list in AppContext.
function OrderTracking() {
  const { t, orders, user } = useContext(AppContext)

  const myOrders = orders.filter((o) => o.customerEmail === user.email)
  const [selectedId, setSelectedId] = useState(myOrders[0]?.id || '')

  useEffect(() => {
    if (!selectedId && myOrders.length > 0) setSelectedId(myOrders[0].id)
  }, [myOrders, selectedId])

  if (myOrders.length === 0) {
    return (
      <div className="page-content">
        <p className="empty-state">No orders yet. <Link to="/plants">Browse plants</Link></p>
      </div>
    )
  }

  const order = myOrders.find((o) => o.id === selectedId) || myOrders[0]
  const cancelled = order.orderStatus === 'stageCancelled'
  const statusIndex = stageKeys.indexOf(order.orderStatus)

  return (
    <div className="page-content">
      <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="dash-title">{t('orderHash')} {order.id}</div>
          <div className="dash-subtitle">{new Date(order.createdAt).toLocaleDateString()}</div>
        </div>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ maxWidth: 220 }}>
          {myOrders.map((o) => <option key={o.id} value={o.id}>{o.id}</option>)}
        </select>
      </div>

      <div className="grid grid-2 mb-24">
        <div className="card">
          <div className="section-title">Order Details</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t('thPlant')}</th><th>{t('thQuantity')}</th><th>{t('price')}</th></tr></thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex-between mt-16" style={{ fontWeight: 700 }}>
            <span>{t('total')}</span><span>₹{order.totalAmount}</span>
          </div>
          <div className="flex-between mt-16">
            <span className="text-muted">Payment Status</span>
            <span className={`badge ${order.paymentStatus === 'Verified' ? 'badge-success' : order.paymentStatus === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{order.paymentStatus}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'calc(100px * var(--font-scale, 1))' }}>{cancelled ? '🚫' : '🚚'}</div>
            <p className="text-muted mt-16">{cancelled ? 'This order was cancelled.' : t('orderOnWay')}</p>
            <span className="badge badge-info mt-8">{t(order.orderStatus)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">{t('statusTimeline')}</div>
        {cancelled ? (
          <p className="empty-state">This order's status history stopped when it was cancelled.</p>
        ) : (
          <div className="timeline">
            {stageKeys.map((stageKey, i) => (
              <div key={stageKey} className="timeline-item">
                <div style={{ fontWeight: i <= statusIndex ? 700 : 400, color: i <= statusIndex ? 'var(--text)' : 'var(--text-lighter)' }}>
                  {t(stageKey)}
                </div>
                <div className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>
                  {i <= statusIndex ? t('statusDone') : t('statusPending')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTracking
