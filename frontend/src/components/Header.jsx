import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, Zap, Menu, ShieldCheck, Command } from 'lucide-react';
import { getUnreadCount } from '../services/api';
import NotificationDropdown from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ title, onProfileClick, toggleSidebar }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState({
        name: 'Admin User',
        avatar: null
    });

    const loadProfile = useCallback(() => {
        const saved = localStorage.getItem('adminProfile');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setAdminProfile({
                    name: data.name || 'Admin User',
                    avatar: data.avatar || null
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const fetchUnread = useCallback(async () => {
        try {
            const { data } = await getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        loadProfile();
        fetchUnread();
        const interval = setInterval(fetchUnread, 10000);
        window.addEventListener('adminProfileUpdated', loadProfile);
        return () => {
            clearInterval(interval);
            window.removeEventListener('adminProfileUpdated', loadProfile);
        };
    }, [fetchUnread, loadProfile]);

    const initials = (adminProfile.name || 'Admin').split(' ').map(n => n ? n[0] : '').join('') || '?';

    return (
        <header className="h-16 bg-white/70 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-[100] flex items-center justify-between px-8 pl-24 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Registry</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-10">
                {/* Tactical Search */}
                <div className="relative hidden xl:block group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH CORE INFRASTRUCTURE..."
                        className="pl-14 pr-8 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:bg-white text-[10px] font-bold w-[320px] outline-none transition-all placeholder:text-slate-400 text-slate-900 uppercase tracking-widest shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-4">


                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-4 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-[0_8px_15px_rgba(99,102,241,0.08)]"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-white shadow-lg"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <NotificationDropdown
                                    onClose={() => setIsNotifOpen(false)}
                                    onCountChange={(count) => setUnreadCount(count)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-10 w-px bg-slate-100 mx-2" />

                    {/* Admin Profile Node */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onProfileClick}
                        className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group"
                    >
                        <div className="relative">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-[10px] uppercase italic group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all overflow-hidden border-2 border-white">
                                {adminProfile.avatar ? (
                                    <img src={adminProfile.avatar} alt="Admin" className="h-full w-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-black text-slate-900 uppercase italic tracking-tighter text-[11px] leading-none">{adminProfile.name}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1 flex items-center gap-1">
                                <ShieldCheck size={8} className="text-indigo-600" /> Admin Node
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

export default Header;
