import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Calendar, LogOut, ChevronLeft, ChevronRight, Zap, Bell, Settings, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isCollapsed, toggleSidebar, onProfileClick }) => {
    const [adminProfile, setAdminProfile] = useState({
        name: 'Admin User',
        email: 'hr@company.com',
        avatar: null
    });

    // Hover-trigger state
    const [isHovered, setIsHovered] = useState(false);
    const hoverTimeoutRef = useRef(null);

    const loadProfile = useCallback(() => {
        const saved = localStorage.getItem('adminProfile');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setAdminProfile({
                    name: data.name || 'Admin User',
                    email: data.email || 'hr@company.com',
                    avatar: data.avatar || null
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        loadProfile();
        window.addEventListener('adminProfileUpdated', loadProfile);
        return () => window.removeEventListener('adminProfileUpdated', loadProfile);
    }, [loadProfile]);

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 150); // 150ms delay to prevent accidental triggers
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 200); // Slight grace period for exit
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/employees', icon: Users, label: 'Employees' },
        { path: '/attendance', icon: Clock, label: 'Attendance' },
        { path: '/calendar', icon: Calendar, label: 'Work Calendar' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
    ];

    const initials = (adminProfile.name || 'Admin').split(' ').map(n => n ? n[0] : '').join('') || '?';

    return (
        <>
            {/* Logo + Activation Zone - Always fixed top-left */}
            <div
                className="fixed top-0 left-0 z-[100] flex items-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Visual Logo Container */}
                <div className="p-6 bg-white/80 backdrop-blur-xl border-r border-b border-slate-100 rounded-br-3xl shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 group">
                    <div className="h-10 w-10 bg-indigo-600 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                        <Command size={22} strokeWidth={2.5} />
                    </div>
                </div>

                {/* Invisible Hover Activation Zone (Triggers opening when moving RIGHT of logo) */}
                <div className="h-24 w-40 cursor-pointer hidden lg:block" title="Hover to access Hub" />
            </div>

            {/* Main Navigation Sidebar */}
            <AnimatePresence>
                {isHovered && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-3xl z-[90] flex flex-col shadow-[40px_0_80px_rgba(0,0,0,0.08)] border-r border-white overflow-hidden"
                    >
                        {/* Branding Header in Sidebar */}
                        <div className="p-6 pt-24 flex items-center gap-4">
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <h1 className="text-xl font-black text-slate-900 tracking-tighter">ADMIN<span className="text-indigo-600">HUB</span></h1>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Management System</p>
                            </div>
                        </div>

                        {/* Navigation Layer */}
                        <nav className="flex-1 px-4 space-y-2 mt-8">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative
                                        ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={20} className={`transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`} />
                                            <span className={`font-black text-[11px] uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-900'}`}>
                                                {item.label}
                                            </span>
                                            {isActive && (
                                                <div className="absolute left-[-4px] w-1.5 h-6 bg-indigo-600 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Footer Section */}
                        <div className="p-5 mt-auto space-y-4 bg-slate-50/50 border-t border-slate-100">
                            <div
                                onClick={onProfileClick}
                                className="flex items-center p-3 gap-3 bg-white rounded-2xl border border-slate-200/50 shadow-sm transition-all cursor-pointer hover:border-indigo-300 group"
                            >
                                <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs overflow-hidden border border-indigo-200 shadow-sm">
                                    {adminProfile.avatar ? (
                                        <img src={adminProfile.avatar} alt="Admin" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-[10px]">{initials}</span>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{adminProfile.name}</p>
                                    <p className="text-[8px] font-bold text-slate-400 truncate tracking-tight">{adminProfile.email}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 font-black transition-all group">
                                    <LogOut size={16} />
                                    <span className="text-[11px] uppercase tracking-widest">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
