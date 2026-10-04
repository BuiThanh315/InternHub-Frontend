import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Radio } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationDropdown.module.css';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = async (id: number, actionUrl?: string) => {
    await markAsRead(id);
    if (actionUrl) {
      setIsOpen(false);
      navigate(actionUrl);
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={styles.bellBtn}
        title="Thông báo hệ thống"
        aria-label="Thông báo hệ thống"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitleBox}>
              <h3 className={styles.headerTitle}>Thông Báo</h3>
              <span
                className={`${styles.statusPill} ${
                  isConnected ? styles.statusLive : styles.statusSyncing
                }`}
              >
                <Radio size={11} className={isConnected ? 'animate-pulse' : ''} />
                <span>{isConnected ? 'Real-time' : 'Đang đồng bộ'}</span>
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className={styles.readAllBtn}
              >
                <Check size={13} />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={36} className={styles.emptyIcon} />
                <p className={styles.emptyText}>Hiện chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id, item.actionUrl)}
                  className={`${styles.item} ${item.isRead ? styles.itemRead : styles.itemUnread}`}
                >
                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <h4 className={`${styles.itemTitle} ${!item.isRead ? styles.itemTitleUnread : ''}`}>
                        {item.title}
                      </h4>
                      {!item.isRead && <span className={styles.unreadDot} />}
                    </div>
                    <p className={styles.itemBody}>
                      {item.content}
                    </p>
                    <div className={styles.itemFooter}>
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {item.actionUrl && (
                        <div className={styles.linkBox}>
                          <span>Chi tiết</span>
                          <ExternalLink size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
