import React, { useEffect, useState } from 'react';
import { X, Calendar, Mail, IdCard, Phone, MapPin, Briefcase, Clock, Activity, ShieldCheck, Zap, Command, User, Shield, Target } from 'lucide-react';
import { getAttendanceHistory } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const EmployeeDetailPanel = ({ employee, isOpen, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && employee) {
            fetchHistory();
        }
    }, [isOpen, employee]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await getAttendanceHistory(employee.employee_id);
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!employee) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-indigo-950/20 backdrop-blur-md z-[110]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-xl bg-white border-l border-slate-100 shadow-[-30px_0_60px_rgba(0,0,0,0.05)] z-[120] flex flex-col overflow-hidden"
                    >
                        {/* Identity Header */}
                        <div className="p-10 bg-slate-50 relative overflow-hidden border-b border-slate-100">
                            <div className="absolute top-[-20%] right-[-10%] opacity-5 rotate-12 transition-transform duration-[5s]">
                                <Shield size={300} className="text-indigo-600" />
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex gap-8 items-center">
                                    <div className="h-28 w-28 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-4xl font-black text-white border-4 border-white shadow-2xl shadow-indigo-200 uppercase italic">
                                        {employee.full_name?.charAt(0)}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-2 shadow-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Active Protocol Node
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{employee.full_name}</h2>
                                        <div className="flex items-center gap-3">
                                            <p className="text-slate-500 font-black uppercase tracking-[0.1em] text-xs flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-indigo-600" /> {employee.department} SECTOR
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                                    <X size={28} />
                                </button>
                            </div>
                        </div>

                        {/* Intelligence Body */}
                        <div className="flex-1 overflow-y-auto p-12 space-y-16 no-scrollbar">
                            {/* Functional Attributes */}
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                    <Activity size={16} className="text-indigo-600" /> Nodal Parameters
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <IdCard size={12} className="text-indigo-600" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master ID</p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{employee.employee_id}</p>
                                    </div>
                                    <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Mail size={12} className="text-indigo-600" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural link</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 truncate">{employee.email}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Chrono Analytics (Attendance history) */}
                            <section>
                                <div className="flex justify-between items-end mb-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Clock size={16} className="text-indigo-600" /> Temporal Synchronization
                                    </h3>
                                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest italic">Last 30-Day Cycle</span>
                                </div>

                                <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50">
                                    <div className="grid grid-cols-10 gap-3">
                                        {loading ? (
                                            Array(30).fill(0).map((_, i) => (
                                                <div key={i} className="aspect-square rounded-md bg-slate-100 animate-pulse" />
                                            ))
                                        ) : (
                                            history.length === 0 ? (
                                                <div className="col-span-10 py-12 text-center opacity-20 italic uppercase tracking-[0.2em] text-[10px]">Registry stream is void.</div>
                                            ) : (
                                                history.slice(0, 30).map((record, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: i * 0.01 }}
                                                        title={`${record.date}: ${record.status}`}
                                                        className={`aspect-square rounded-lg transition-all cursor-crosshair border-2 ${record.status === 'Present'
                                                            ? 'bg-emerald-500 border-emerald-100 shadow-[0_5px_15px_rgba(16,185,129,0.2)]'
                                                            : record.status === 'Absent'
                                                                ? 'bg-rose-500 border-rose-100 shadow-[0_5px_15px_rgba(244,63,94,0.2)]'
                                                                : 'bg-slate-100 border-white'
                                                            } hover:scale-125 z-10`}
                                                    />
                                                ))
                                            )
                                        )}
                                    </div>
                                    <div className="mt-10 flex items-center gap-8 justify-center">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-md" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Node</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-rose-500 shadow-md" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dropped Node</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-slate-100" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Undetected</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="pt-10 border-t border-slate-50">
                                <button className="w-full py-6 rounded-[1.8rem] bg-white border border-slate-100 text-xs font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-4 group shadow-sm">
                                    <Target size={20} className="group-hover:rotate-12 transition-transform" /> Export Historical Intelligence
                                </button>
                            </div>
                        </div>

                        {/* Command Footer */}
                        <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-6">
                            <button className="flex-1 py-5 px-8 rounded-2xl bg-white border border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-[0.2em] shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95">
                                Recalibrate Node
                            </button>
                            <button className="flex-1 py-5 px-8 rounded-2xl bg-rose-600 text-white font-extrabold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95">
                                Sever Connection
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EmployeeDetailPanel;
