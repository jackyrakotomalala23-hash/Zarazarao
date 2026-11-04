import React, { useEffect, useRef, useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  MapPin, 
  Package, 
  Gift, 
  MessageSquare, 
  Sparkles, 
  Sliders, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { InAppNotification } from '@/types';

interface NotificationBellDropdownProps {
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<InAppNotification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = notificationService.subscribeToUserNotifications(
      currentUser.uid,
      (list) => {
        setNotifications(list);
        const unreadList = list.filter(n => !n.isRead);

        // If a new unread notification arrived in real-time, show transient toast alert!
        if (unreadList.length > prevCountRef.current && list.length > 0) {
          const latest = list[0];
          if (!latest.isRead && (latest.type === 'donation_alert' || latest.type === 'reservation')) {
            setToastNotification(latest);
            setTimeout(() => {
              setToastNotification((curr) => (curr?.id === latest.id ? null : curr));
            }, 6000);
          }
        }
        prevCountRef.current = unreadList.length;
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
    }
    setIsOpen(false);

    if (notif.resourceType === 'donation' && notif.resourceId) {
      onNavigate('donation-detail', { id: notif.resourceId });
    } else if (notif.resourceType === 'conversation' && notif.resourceId) {
      onNavigate('messages', { conversationId: notif.resourceId });
    } else if (notif.type === 'loyalty' || notif.type === 'coupon') {
      onNavigate('dashboard', { tab: 'apples' });
    } else {
      onNavigate('dashboard', { tab: 'overview' });
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await notificationService.markAllAsRead(currentUser.uid);
  };

  const getIconForType = (type: InAppNotification['type']) => {
    switch (type) {
      case 'donation_alert':
        return <Package className="w-4 h-4 text-emerald-700" />;
      case 'reservation':
      case 'donation_recovered':
        return <CheckCheck className="w-4 h-4 text-amber-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'loyalty':
      case 'coupon':
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-700" />;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-600 hover:text-emerald-800 hover:bg-gray-100 transition-colors cursor-pointer"
        title="Notifications en temps réel"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Real-time Toast Banner for incoming alerts */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-500 animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              {getIconForType(toastNotification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Alerte Don en direct
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">
                {toastNotification.title}
              </h4>
              <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                {toastNotification.body}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => {
                    handleNotificationClick(toastNotification);
                    setToastNotification(null);
                  }}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>Voir le don</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Mobile backdrop for easy dismissal */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.22)] border border-gray-200 overflow-hidden z-50 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[82vh] flex flex-col">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
            <div>
              <div className="font-black text-sm">Notifications en direct</div>
              <div className="text-[10px] text-emerald-100">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-emerald-100 hover:text-white underline cursor-pointer"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="font-semibold text-xs">Aucune notification pour le moment.</p>
                <p className="text-[11px] text-gray-400">
                  Vous serez alerté dès qu'un don correspondant à votre ville ou à vos catégories préférées est publié !
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-emerald-50/70 hover:bg-emerald-100/60 font-medium'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-2xs shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h5 className="font-bold text-gray-900 truncate pr-2">
                        {notif.title}
                      </h5>
                      <span className="text-[9px] text-gray-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>
                    {!notif.isRead && (
                      <span className="inline-block mt-1 w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer link to manage alert categories */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('dashboard', { tab: 'alerts' });
              }}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-center gap-1.5 w-full"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Gérer mes alertes par ville & catégories</span>
            </button>
          </div>

        </div>
        </>
      )}
    </div>
  );
};
