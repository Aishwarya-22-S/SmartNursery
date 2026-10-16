import { memo } from 'react'

// React.memo - avoids re-rendering notification rows that haven't changed
const NotificationItem = memo(function NotificationItem({ notification, onToggleRead }) {
  const { icon, title, message, time, read } = notification
  return (
    <div className={`notif-item ${read ? '' : 'unread'}`} onClick={() => onToggleRead(notification.id)}>
      <div className="stat-icon" style={{ width: 40, height: 40, fontSize: 'calc(17px * var(--font-scale, 1))' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="flex-between">
          <span style={{ fontWeight: 700, fontSize: 'calc(13.5px * var(--font-scale, 1))' }}>{title}</span>
          <span className="text-muted" style={{ fontSize: 'calc(12px * var(--font-scale, 1))' }}>{time}</span>
        </div>
        <div className="text-muted" style={{ fontSize: 'calc(13px * var(--font-scale, 1))', marginTop: 3 }}>{message}</div>
      </div>
      {!read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6 }} />}
    </div>
  )
})

export default NotificationItem
