import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

// OrderHistory - customer-only. Shows only the current customer's own
// orders (filtered by email) - one customer can never see another
// customer's orders here, since the filter runs on the logged-in user's
// own email, not on anything the URL/UI lets them edit.
function OrderHistory() {
  const { orders, user, t } = useContext(AppContext)

  const myOrders = orders.filter((o) => o.customerEmail === user.email)

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">Previous Orders</div>
        <div className="dash-subtitle">Your order history</div>
      </div>

      {myOrders.length === 0 ? (
        <p className="empty-state">You haven't placed any orders yet. <Link to="/plants">{t('browsePlants')}</Link></p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myOrders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex-between mb-16">
                <div>
                  <div style={{ fontWeight: 700 }}>{order.id}</div>
                  <div className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex-gap">
                  <span className={`badge ${order.paymentStatus === 'Verified' ? 'badge-success' : 'badge-warning'}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="badge badge-info">{t(order.orderStatus)}</span>
                </div>
              </div>
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
                <span>{t('total')}</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistory
