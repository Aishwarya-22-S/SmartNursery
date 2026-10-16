import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

function Cart() {
  // useContext - reads and updates the shared cart state from AppContext
  const { cart, updateCartQty, removeFromCart, t } = useContext(AppContext)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
      <div className="page-content">
        <div className="dash-title mb-24">{t('shoppingCartTitle')}</div>

        {cart.length === 0 ? (
          <p className="empty-state">{t('cartEmpty')} <Link to="/plants">{t('browsePlants')}</Link></p>
        ) : (
          <div className="grid grid-2">
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>{t('thPlant')}</th><th>{t('price')}</th><th>{t('thQuantity')}</th><th>{t('thTotal')}</th><th>{t('action')}</th></tr></thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="flex-gap">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 6 }} /> : item.image} <span>{item.name}<br /><small className="text-muted">{item.size ? `${item.size[0].toUpperCase()}${item.size.slice(1)} size` : ''}</small></span></td>
                        <td>₹{item.price}</td>
                        <td>
                          <div className="qty-control">
                            <button onClick={() => updateCartQty(item.id, item.qty - 1)}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateCartQty(item.id, item.qty + 1)}>+</button>
                          </div>
                        </td>
                        <td>₹{item.price * item.qty}</td>
                        <td><button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
              <div className="section-title">{t('orderSummary')}</div>
              <div className="flex-between mb-16"><span className="text-muted">{t('subtotal')}</span><span>₹{subtotal}</span></div>
              <div className="flex-between mb-16" style={{ borderTop: '1px solid var(--border)', paddingTop: 14, fontWeight: 700 }}>
                <span>{t('total')}</span><span>₹{subtotal}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-block">{t('proceedCheckout')}</Link>
            </div>
          </div>
        )}
    </div>
  )
}

export default Cart
