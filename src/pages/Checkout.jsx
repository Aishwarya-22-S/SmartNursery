import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

function Checkout() {
  const { cart, placeOrder, t } = useContext(AppContext)
  const navigate = useNavigate()

  // useState - manages delivery address form fields
  const [address, setAddress] = useState({
    name: 'Aishwarya S.', street: '123, Green Street, Coimbatore', state: 'Tamil Nadu - 641001', phone: '9876543210',
  })
  const [payment, setPayment] = useState('UPI')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = 40
  const total = subtotal + delivery

  const handleChange = (e) => setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  // placeOrder calls the backend, which reads the customer's persisted
  // cart, validates stock, computes the total itself, creates the order +
  // payment record, decrements inventory, and notifies Admin/Staff - see
  // server/controllers/orderController.js#placeOrder.
  const handlePlaceOrder = async () => {
    if (cart.length === 0 || placing) return
    setError('')
    setPlacing(true)
    try {
      await placeOrder({ paymentMethod: payment, address })
      navigate('/order-tracking')
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
      <div className="page-content">
        <div className="dash-title mb-24">{t('checkoutTitle')}</div>
        <div className="grid grid-2">
          <div>
            <div className="card mb-24">
              <div className="flex-between mb-16">
                <div className="section-title" style={{ marginBottom: 0 }}>{t('deliveryAddress')}</div>
                <button className="btn btn-ghost btn-sm">{t('change')}</button>
              </div>
              <div className="field"><label>{t('fullNameLabel')}</label><input name="name" value={address.name} onChange={handleChange} /></div>
              <div className="field"><label>{t('streetAddressLabel')}</label><input name="street" value={address.street} onChange={handleChange} /></div>
              <div className="field"><label>{t('statePinLabel')}</label><input name="state" value={address.state} onChange={handleChange} /></div>
              <div className="field"><label>{t('phoneLabel')}</label><input name="phone" value={address.phone} onChange={handleChange} /></div>
            </div>

            <div className="card">
              <div className="section-title">{t('paymentMethod')}</div>
              {['UPI', 'Credit / Debit Card', 'COD'].map((method) => (
                <label key={method} className="flex-gap" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <input type="radio" name="payment" checked={payment === method} onChange={() => setPayment(method)} />
                  {method}
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ height: 'fit-content' }}>
            <div className="section-title">{t('orderSummary')}</div>
            <div className="flex-between mb-16"><span className="text-muted">{t('subtotal')}</span><span>₹{subtotal}</span></div>
            <div className="flex-between mb-16"><span className="text-muted">{t('deliveryCharges')}</span><span>₹{delivery}</span></div>
            <div className="flex-between mb-24" style={{ borderTop: '1px solid var(--border)', paddingTop: 14, fontWeight: 700 }}>
              <span>{t('totalAmount')}</span><span>₹{total}</span>
            </div>
            {error && <div className="badge badge-danger mb-16" style={{ display: 'block', padding: '10px 14px' }}>{error}</div>}
            <button className="btn btn-primary btn-block" onClick={handlePlaceOrder} disabled={cart.length === 0 || placing}>
              {placing ? '…' : t('placeOrder')}
            </button>
          </div>
        </div>
    </div>
  )
}

export default Checkout
