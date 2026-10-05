import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw, BellOff } from 'lucide-react';
import { notificationApi } from '../services/api';
import { Spinner, Card, AlertBanner, SectionHeader, PrimaryButton, GhostButton, Badge, EmptyState } from '../components/UI';

const TYPE_COLORS = {
  warning: 'amber',
  alert: 'rose',
  info: 'blue',
  success: 'emerald',
};

const TYPE_BG = {
  warning: 'bg-amber-50 border-amber-100',
  alert: 'bg-rose-50 border-rose-100',
  info: 'bg-blue-50 border-blue-100',
  success: 'bg-emerald-50 border-emerald-100',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationApi.list(0, 100);
      setNotifications(res.data || []);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      setError('Failed to mark as read.');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      setError('Failed to mark all as read.');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      setError('Failed to delete notification.');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={loadNotifications}><RefreshCw className="w-4 h-4" /></GhostButton>
            {unreadCount > 0 && (
              <PrimaryButton onClick={markAllRead} size="sm">
                <CheckCheck className="w-4 h-4" /> Mark All Read
              </PrimaryButton>
            )}
          </div>
        }
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-fit">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: 'Read' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === tab.key ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications"
          description={filter === 'unread' ? "You're all caught up!" : "No notifications here."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const type = notif.notification_type || notif.type || 'info';
            const bgClass = TYPE_BG[type] || 'bg-slate-50 border-slate-100';
            const badgeColor = TYPE_COLORS[type] || 'slate';
            return (
              <div key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${bgClass} ${!notif.is_read ? 'shadow-sm' : 'opacity-70'}`}>
                {/* Unread dot */}
                <div className="mt-1 shrink-0">
                  {!notif.is_read
                    ? <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                    : <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
                      {notif.message}
                    </p>
                    <Badge label={type} color={badgeColor} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {new Date(notif.created_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.is_read && (
                    <button onClick={() => markRead(notif.id)} title="Mark as read"
                      className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notif.id)} title="Delete"
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
