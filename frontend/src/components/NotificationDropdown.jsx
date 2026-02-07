import React, { useEffect, useState, useRef } from 'react';
import { getNotifications, markAsRead, markAllRead } from '../services/api';
import { motion } from 'framer-motion';
import { Bell, Check, X, AlertCircle, Info, CheckCircle2, Clock, Zap, Activity } from 'lucide-react';
import { format } from 'date-fns';

const NotificationDropdown = ({ onClose, onCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Close on outside click
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const fetchNotifications = async () => {
        try {
            const { data } = await getNotifications();
            setNotifications(data);
            const unreadCount = data.filter(n => !n.is_read).length;
            if (onCountChange) onCountChange(unreadCount);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => {
                const updated = prev.map(n => n._id === id ? { ...n, is_read: true } : n);
                const unreadCount = updated.filter(n => !n.is_read).length;
                if (onCountChange) onCountChange(unreadCount);
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead();
            setNotifications(prev => {
                const updated = prev.map(n => ({ ...n, is_read: true }));
                if (onCountChange) onCountChange(0);
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={18} />;
            case 'error': return <X className="text-rose-500" size={18} />;
            default: return <Info className="text-indigo-500" size={18} />;
        }
    };

    return (
        <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 top-full mt-4 w-[420px] bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none rotate-12">
                    <Bell size={100} className="text-indigo-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={12} className="text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Stream</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
                        Notifications
                    </h3>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-white transition-colors bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 hover:bg-indigo-600"
                        >
                            Sync All
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
                            <Zap size={40} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No Data Intercepted</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`p-6 flex gap-5 transition-all group relative ${!notif.is_read ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                            >
                                {!notif.is_read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                )}

                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 ${notif.is_read ? 'bg-slate-50 text-slate-400' : 'bg-white shadow-xl shadow-indigo-100 text-indigo-600'}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1 space-y-2 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className={`text-sm font-black uppercase italic tracking-tighter ${notif.is_read ? 'text-slate-500' : 'text-slate-900'}`}>
                                            {notif.title}
                                        </p>
                                        {!notif.is_read && (
                                            <button
                                                onClick={() => handleMarkRead(notif._id)}
                                                className="p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"
                                            >
                                                <Check size={14} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Clock size={12} className="text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {format(new Date(notif.created_at), 'hh:mm a')} | <span className="text-slate-500 italic">{format(new Date(notif.created_at), 'MMM dd')}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-all bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm"
                >
                    Dismiss Console
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationDropdown;
