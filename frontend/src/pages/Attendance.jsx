import React, { useEffect, useState, useCallback } from 'react';
import { getEmployees, markAttendance, getAttendanceByDate } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { format } from 'date-fns';
import { Calendar, CheckCircle, XCircle, Users, Search, Save, Clock, Check, Zap, Target, Activity, ShieldCheck, RefreshCcw, Command, ZapOff } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // Stores { status, marked_at, isDirty }
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { addToast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [empRes, attRes] = await Promise.all([
                getEmployees(),
                getAttendanceByDate(date)
            ]);

            setEmployees(empRes.data);

            const mapping = {};
            attRes.data.forEach(att => {
                mapping[att.employee_id] = {
                    status: att.status,
                    marked_at: att.marked_at,
                    isDirty: false
                };
            });
            setAttendanceData(mapping);

        } catch (error) {
            console.error(error);
            addToast("Communication Fail: Employee database sync lost", "error");
        } finally {
            setLoading(false);
        }
    }, [date, addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleStatusChange = (empId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                status,
                isDirty: true
            }
        }));
    };

    const handleBulkMark = (status) => {
        const newMapping = { ...attendanceData };
        employees.forEach(emp => {
            newMapping[emp.employee_id] = {
                ...newMapping[emp.employee_id],
                status,
                isDirty: true
            };
        });
        setAttendanceData(newMapping);
        addToast(`Global Protocol: All units set to ${status}`, "info");
    };

    const handleSaveAll = async () => {
        const dirtyEntries = Object.entries(attendanceData).filter(([_, data]) => data.isDirty);

        if (dirtyEntries.length === 0) {
            addToast("No Delta: Stream already synchronized", "info");
            return;
        }

        setSaving(true);
        try {
            const promises = dirtyEntries.map(([empId, data]) =>
                markAttendance({
                    employee_id: empId,
                    date,
                    status: data.status
                })
            );

            await Promise.all(promises);
            addToast(`Successfully committed ${dirtyEntries.length} node updates!`, "success");
            loadData();
        } catch (error) {
            console.error(error);
            addToast("Sync Protocol Interrupted", "error");
        } finally {
            setSaving(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (isoString) => {
        if (!isoString) return null;
        try {
            return format(new Date(isoString), 'hh:mm a');
        } catch (e) {
            return null;
        }
    };

    return (
        <div className="space-y-12 py-8">
            {/* Operational Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Attendance Management</h2>
                    <div className="flex items-center gap-2 mt-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Daily Records System</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white border border-slate-100 p-3 rounded-[1.8rem] shadow-sm group hover:border-indigo-300 transition-all">
                    <div className="h-10 w-10 bg-indigo-50 flex items-center justify-center rounded-xl text-indigo-600">
                        <Calendar size={20} />
                    </div>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-transparent border-none focus:outline-none font-black text-indigo-600 text-sm cursor-pointer uppercase tracking-widest pr-4"
                    />
                </div>
            </div>

            {/* Tactical Command Control */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 premium-card p-8 bg-white border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-10">
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 leading-none">Quick Attendance Actions</p>
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Mark Department</h3>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => handleBulkMark('Present')}
                            className="flex-1 px-8 py-5 rounded-[1.5rem] bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                        >
                            All Present
                        </button>
                        <button
                            onClick={() => handleBulkMark('Absent')}
                            className="flex-1 px-8 py-5 rounded-[1.5rem] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                        >
                            All Offline
                        </button>
                    </div>
                </div>

                <div className="premium-card p-8 bg-indigo-600 flex flex-col justify-between group overflow-hidden relative shadow-xl shadow-indigo-100">
                    <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:rotate-45 transition-transform duration-[2s]">
                        <RefreshCcw size={180} strokeWidth={3} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 relative z-10 leading-none">Save Records</p>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || loading}
                        className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 disabled:opacity-50 relative z-10 transition-all active:scale-95"
                    >
                        {saving ? (
                            <><RefreshCcw className="animate-spin" /> Synchronizing</>
                        ) : (
                            <><Zap fill="white" size={32} /> Commit</>
                        )}
                    </button>
                </div>
            </div>

            {/* Node Synchronization Hub (Table) */}
            <div className="premium-card bg-white border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-8 bg-slate-50/20">
                    <div className="relative w-full max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="SEARCH EMPLOYEES BY NAME OR ID..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-5 rounded-[2rem] bg-white border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all text-xs font-black text-slate-900 uppercase tracking-widest shadow-sm placeholder:text-slate-300"
                        />
                    </div>
                    <div className="hidden lg:flex items-center gap-4 bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-2xl">
                        <Activity size={18} className="text-indigo-600" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Telemetry</span>
                            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-tight mt-1 animate-pulse italic">Active Stream</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="p-6 px-10 font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Employee Details</th>
                                <th className="p-6 px-10 font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Department</th>
                                <th className="p-6 px-10 font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] text-center">Status</th>
                                <th className="p-6 px-10 font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] text-right">Commit Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-10 flex items-center gap-6">
                                            <Skeleton className="h-16 w-16 rounded-[1.5rem] bg-slate-100" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-48 bg-slate-100" />
                                                <Skeleton className="h-3 w-24 bg-slate-100" />
                                            </div>
                                        </td>
                                        <td className="p-10"><Skeleton className="h-8 w-32 rounded-full bg-slate-100" /></td>
                                        <td className="p-10"><div className="flex justify-center"><Skeleton className="h-14 w-64 rounded-[1.2rem] bg-slate-100" /></div></td>
                                        <td className="p-10"><Skeleton className="h-8 w-24 rounded-xl bg-slate-100 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-48 text-center opacity-10 italic">
                                        <ZapOff size={100} className="mx-auto mb-8" />
                                        <p className="text-3xl font-black uppercase tracking-[0.2em]">End of Stream.</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredEmployees.map((emp, idx) => {
                                        const state = attendanceData[emp.employee_id] || {};
                                        return (
                                            <motion.tr
                                                key={emp.employee_id || idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="p-6 px-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className="h-16 w-16 min-w-[4rem] rounded-[1.5rem] bg-indigo-50 text-indigo-600 border-2 border-indigo-100 flex items-center justify-center font-black text-xl uppercase italic group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                            {emp.full_name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 uppercase italic tracking-tighter text-xl leading-none group-hover:text-indigo-600 transition-colors">{emp.full_name || 'Generic Node'}</p>
                                                            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-3 bg-slate-100 w-fit px-3 py-1 rounded-md">{emp.employee_id || 'PENDING'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 px-10">
                                                    <span className="bg-white border text-slate-600 border-slate-200 px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3 w-fit shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                                                        <ShieldCheck size={14} className="text-indigo-600" /> {emp.department || 'Department Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="p-6 px-10">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button
                                                            onClick={() => handleStatusChange(emp.employee_id, 'Present')}
                                                            className={`flex-1 max-w-[160px] py-3.5 rounded-[1.5rem] border-2 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 ${state.status === 'Present'
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100'
                                                                : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-600'
                                                                }`}
                                                        >
                                                            <CheckCircle size={18} strokeWidth={3} /> Active
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(emp.employee_id, 'Absent')}
                                                            className={`flex-1 max-w-[160px] py-3.5 rounded-[1.5rem] border-2 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 ${state.status === 'Absent'
                                                                ? 'bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-100'
                                                                : 'bg-white text-slate-400 border-slate-100 hover:border-rose-200 hover:text-rose-600'
                                                                }`}
                                                        >
                                                            <XCircle size={18} strokeWidth={3} /> Offline
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-6 px-10 text-right">
                                                    {state.isDirty ? (
                                                        <span className="inline-flex items-center gap-3 text-[10px] font-black text-amber-600 bg-amber-50 px-5 py-2.5 rounded-[1rem] animate-pulse uppercase tracking-[0.2em] border border-amber-100 italic">
                                                            <RefreshCcw size={14} className="animate-spin" /> Unsaved
                                                        </span>
                                                    ) : state.marked_at ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="inline-flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border border-emerald-100 px-5 py-2.5 rounded-[1rem] bg-emerald-50 italic">
                                                                <Check size={16} strokeWidth={3} /> Marked
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-3 text-slate-400">
                                                                <Clock size={10} />
                                                                <span className="text-[10px] font-black tracking-[0.1em]">{formatTime(state.marked_at)}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-end opacity-20 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Awaiting Sync</span>
                                                            <div className="h-1 w-12 bg-slate-200 rounded-full mt-2" />
                                                        </div>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
