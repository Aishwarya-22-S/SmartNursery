import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import NotificationItem from '../components/NotificationItem.jsx'

const tabKeys = [
  { key: 'All', labelKey: 'tabAll' },
  { key: 'Reminders', labelKey: 'tabReminders' },
  { key: 'Orders', labelKey: 'tabOrders' },
  { key: 'Alerts', labelKey: 'tabAlerts' },
  { key: 'Offers', labelKey: 'tabOffers' },
]

function Notifications() {
  // useContext - reads notifications list, update functions, current user and translations from AppContext
  const { notifications, toggleNotificationRead, markAllNotificationsRead, user, t } = useContext(AppContext)

  // useState - tracks which category tab is currently selected
  const [tab, setTab] = useState('All')

  // Only show notifications meant for this role (undefined roles = everyone)
  const visible = notifications.filter((n) => !n.roles || n.roles.includes(user?.role))
  const filtered = tab === 'All' ? visible : visible.filter((n) => n.group === tab)

  return (
    <div className="page-content" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div className="dash-title">{t('notificationsCenter')}</div>
      </div>
      <div className="chip-row mb-16">
        {tabKeys.map((tabItem) => (
          <button key={tabItem.key} className={`chip ${tab === tabItem.key ? 'active' : ''}`} onClick={() => setTab(tabItem.key)}>
            {t(tabItem.labelKey)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((n) => (
          <NotificationItem
            key={n.id}
            notification={{
              ...n,
              title: n.titleKey ? t(n.titleKey) : n.title,
              message: n.msgKey ? t(n.msgKey) : n.message,
              time: n.time === 'Yesterday' ? t('yesterday') : n.time,
            }}
            onToggleRead={toggleNotificationRead}
          />
        ))}
      </div>
      <button className="btn btn-ghost mt-16" onClick={markAllNotificationsRead}>{t('markAllRead')}</button>
    </div>
  )
}

export default Notifications
