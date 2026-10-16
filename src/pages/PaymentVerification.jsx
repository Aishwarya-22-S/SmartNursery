import { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'

// PaymentVerification - Admin/Staff can see every order's payment details
// and mark it Verified or Rejected (section 1.D / 2.A of the spec). Both
// actions update MongoDB and are reflected everywhere the order shows.
function PaymentVerification() {
  const { orders, verifyPayment, rejectPayment, t } = useContext(AppContext)

  const statusBadgeClass = (status) => {
    if (status === 'Verified') return 'badge-success'
    if (status === 'Rejected') return 'badge-danger'
    return 'badge-warning'
  }

  const orderStatusBadgeClass = (status) => {
    if (status === 'stagePlaced') return 'badge-info'
    if (status === 'stageCancelled') return 'badge-danger'
    if (status === 'stageDelivered') return 'badge-success'
    return 'badge-warning'
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">Payment Verification</div>
        <div className="dash-subtitle">Review and verify customer payments</div>
      </div>

      <div className="grid grid-1" style={{ gap: '16px' }}>
        {orders.map((order) => (
          <div key={order.id} className="card" style={{ padding: '16px' }}>
            <div className="flex-between mb-12" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Order {order.id}</h3>
                <div className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>{order.customerName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${statusBadgeClass(order.paymentStatus)}`} style={{ marginRight: '8px' }}>
                  {order.paymentStatus}
                </span>
                <span className={`badge ${orderStatusBadgeClass(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px', paddingTop: '12px', paddingBottom: '12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>CUSTOMER EMAIL</div>
                <div style={{ fontWeight: 500, fontSize: 'calc(13px * var(--font-scale, 1))' }}>{order.customerEmail}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>AMOUNT</div>
                <div style={{ fontWeight: 600, fontSize: 'calc(14px * var(--font-scale, 1))' }}>₹{order.totalAmount}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>PAYMENT METHOD</div>
                <div style={{ fontWeight: 500, fontSize: 'calc(13px * var(--font-scale, 1))' }}>{order.paymentMethod}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>ORDER DATE</div>
                <div style={{ fontWeight: 500, fontSize: 'calc(13px * var(--font-scale, 1))' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div className="text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>PRODUCTS</div>
              <div style={{ fontSize: 'calc(13px * var(--font-scale, 1))' }}>
                {(order.items || []).map((it, idx) => (
                  <div key={idx} style={{ margin: '4px 0' }}>
                    • {it.name} × {it.qty} @ ₹{it.price}
                  </div>
                ))}
              </div>
            </div>

            {order.paymentStatus === 'Pending' && (
              <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => verifyPayment(order.id)}>✅ Verify Payment</button>
                <button className="btn btn-ghost btn-sm" onClick={() => rejectPayment(order.id)}>❌ Reject Payment</button>
              </div>
            )}
            {order.paymentStatus === 'Verified' && (
              <div className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>✓ Payment verified</div>
            )}
            {order.paymentStatus === 'Rejected' && (
              <div className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>✕ Payment rejected</div>
            )}
          </div>
        ))}
      </div>
      {orders.length === 0 && <p className="empty-state">No orders yet.</p>}
    </div>
  )
}

export default PaymentVerification
