import { useContext, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

function Wishlist() {
  // useContext - reads and updates the shared wishlist state and translations from AppContext
  const { wishlist, toggleWishlist, addToCart, t } = useContext(AppContext)

  // useCallback - memoized remove-from-wishlist handler
  const handleRemove = useCallback((item) => {
    toggleWishlist(item)
  }, [toggleWishlist])

  // useCallback - memoized add-to-cart handler
  const handleAddToCart = useCallback((item) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })
  }, [addToCart])

  const moveAllToCart = () => {
    wishlist.forEach((item) => handleAddToCart(item))
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">{t('myWishlist')}</div>
      </div>

      {wishlist.length === 0 ? (
        <p className="empty-state">{t('wishlistEmpty')} <Link to="/plants">{t('browsePlants')}</Link></p>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t('thPlant')}</th><th>{t('price')}</th><th>{t('action')}</th></tr></thead>
              <tbody>
                {wishlist.map((item) => (
                  <tr key={item.id}>
                    <td className="flex-gap">{item.image} {item.name}</td>
                    <td>₹{item.price}</td>
                    <td className="flex-gap">
                      <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(item)}>{t('addToCart')}</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(item)}>{t('remove')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-outline mt-16" onClick={moveAllToCart}>{t('moveAllToCart')}</button>
        </div>
      )}
    </div>
  )
}

export default Wishlist
