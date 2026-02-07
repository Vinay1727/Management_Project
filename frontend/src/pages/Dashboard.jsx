import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, TrendingUp, Plus, CalendarCheck, FileBarChart, Calendar, ChevronRight, Zap, Target, ArrowUpRight, Activity, Command, Sparkles, Clock } from 'lucide-react';
import { getStats, getWeeklyStats, getRecentActivity, markAttendance } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ProgressRing = ({ value, total, color, label }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const radius = 50;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = (c) => {
        if (c === 'indigo') return '#6366f1';
        if (c === 'cyan') return '#06b6d4';
        return '#f43f5e';
    };

    return (
        <div className="flex flex-col items-center gap-6 p-10 premium-card relative group overflow-hidden">
            <div className={`absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full`}></div>
            <div className="relative">
                <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                    <circle
                        stroke="rgba(0,0,0,0.03)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <motion.circle
                        stroke={getColor(color)}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 2, ease: "circOut" }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">{percentage}%</span>
                </div>
            </div>
            <div className="text-center z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1.5 leading-none">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">
                    {value} <span className="text-[10px] font-medium text-slate-400 not-italic">/ {total}</span>
                </h3>
            </div>
        </div>
    );
};


const Dashboard = () => {
    const [stats, setStats] = useState({ total_employees: 0, present_today: 0, absent_today: 0 });
    const [weeklyData, setWeeklyData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [markingStatus, setMarkingStatus] = useState(null); // 'Present' | 'Absent'
    const [isMarking, setIsMarking] = useState(false);

    useEffect(() => {
        // Check local storage for today's attendance to persist state
        const today = new Date().toISOString().split('T')[0];
        const savedStatus = localStorage.getItem(`attendance_${today}`);
        if (savedStatus) {
            setAttendanceMarked(true);
            setMarkingStatus(savedStatus);
        }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [statsRes, weeklyRes, recentRes] = await Promise.all([
                getStats(),
                getWeeklyStats(),
                getRecentActivity()
            ]);
            setStats(statsRes.data || { total_employees: 0, present_today: 0, absent_today: 0 });
            setWeeklyData(weeklyRes.data || []);
            setRecentActivity(recentRes.data || []);
        } catch (err) {
            console.error("Failed to load stats", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (status) => {
        setIsMarking(true);
        try {
            // UX Simulation: Artificial delay for premium feel
            await new Promise(resolve => setTimeout(resolve, 800));

            // Attempt actual API call (fail-safe)
            try {
                await markAttendance({ status, date: new Date().toISOString() });
            } catch (e) {
                console.warn("API mark failed, using local fallback", e);
            }

            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`attendance_${today}`, status);
            setMarkingStatus(status);
            setAttendanceMarked(true);
        } catch (error) {
            console.error("Attendance marking failed", error);
        } finally {
            setIsMarking(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 18) return 'Afternoon';
        return 'Evening';
    };

    return (
        <div className="space-y-8 py-6 max-w-7xl mx-auto">
            {/* Quick Attendance Panel - High Priority UX */}
            <div className={`transition-all duration-700 ease-out ${attendanceMarked ? 'mb-8' : 'min-h-[60vh] flex flex-col justify-center'}`}>
                {!attendanceMarked ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-3xl mx-auto"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9] mb-4">
                                Good {getGreeting()}
                            </h2>
                            <p className="text-slate-500 text-lg font-medium">Please mark your attendance to unlock the dashboard.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <button
                                onClick={() => setMarkingStatus('Present')}
                                className={`group p-8 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-4 ${markingStatus === 'Present' ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200 scale-105' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl'}`}
                            >
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${markingStatus === 'Present' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                    <UserCheck size={32} strokeWidth={2.5} />
                                </div>
                                <span className={`text-xl font-black uppercase tracking-widest ${markingStatus === 'Present' ? 'text-white' : 'text-slate-900'}`}>Present</span>
                                {markingStatus === 'Present' && <motion.div layoutId="check" className="absolute top-6 right-6 text-white"><UserCheck size={20} /></motion.div>}
                            </button>

                            <button
                                onClick={() => setMarkingStatus('Absent')}
                                className={`group p-8 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden flex flex-col items-center gap-4 ${markingStatus === 'Absent' ? 'bg-rose-500 border-rose-500 shadow-2xl shadow-rose-200 scale-105' : 'bg-white border-slate-100 hover:border-rose-200 hover:shadow-xl'}`}
                            >
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${markingStatus === 'Absent' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'}`}>
                                    <UserX size={32} strokeWidth={2.5} />
                                </div>
                                <span className={`text-xl font-black uppercase tracking-widest ${markingStatus === 'Absent' ? 'text-white' : 'text-slate-900'}`}>Absent</span>
                                {markingStatus === 'Absent' && <motion.div layoutId="check" className="absolute top-6 right-6 text-white"><UserCheck size={20} /></motion.div>}
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                disabled={!markingStatus || isMarking}
                                onClick={() => handleMarkAttendance(markingStatus)}
                                className={`w-full max-w-sm py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 shadow-xl transition-all ${!markingStatus ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-slate-200'}`}
                            >
                                {isMarking ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Status <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-50/50 mb-8"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${markingStatus === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    Status: {markingStatus}
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
                                Good {getGreeting()}
                            </h2>
                            <p className="text-slate-500 text-base font-medium mt-2">Dashboard Unlocked. Managing <span className="text-indigo-600 italic font-black">{(stats?.total_employees || 0)} EMPLOYEES</span>.</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/employees')}
                                className="px-6 py-4 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                            >
                                <Plus size={16} strokeWidth={3} /> Add Employee
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Dashboard Content (Locked/Unlocked State) */}
            <AnimatePresence mode="wait">
                {attendanceMarked && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="space-y-8"
                    >
                        {/* Tactical Intelligence Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[3rem] bg-slate-100" />)
                            ) : (
                                <>
                                    <ProgressRing
                                        value={stats?.present_today || 0}
                                        total={stats?.total_employees || 0}
                                        color="indigo"
                                        label="Attendance Rate"
                                    />

                                    <div className="premium-card p-6 bg-indigo-600 flex flex-col justify-between group relative overflow-hidden">
                                        <div className="absolute top-[-10%] right-[-10%] opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                                            <Sparkles size={160} color="white" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                                <Zap size={14} className="fill-indigo-300 border-none" /> Quick Summary
                                            </p>
                                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Weekly<br />Report</h3>
                                        </div>
                                        <button className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.2em] group/btn mt-8 relative z-10">
                                            Global Summary <ArrowUpRight size={16} className="group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="premium-card p-6 flex flex-col justify-between border-slate-100 bg-white shadow-xl shadow-slate-100/50">
                                        <div>
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                                <Target size={14} /> Critical Tasks
                                            </p>
                                            <h3 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Pending<br />Approvals</h3>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">3 items require action</p>
                                        </div>
                                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors mt-8 flex items-center gap-2">
                                            <Activity size={12} /> View Sector Logs
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Analytical Visualization */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Rolling Trend Chart */}
                            <div className="premium-card p-8 bg-white border-slate-100 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
                                    <TrendingUp size={150} />
                                </div>
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Attendance Trend</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">Weekly Performance Report</p>
                                    </div>
                                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 italic">
                                        %
                                    </div>
                                </div>

                                <div className="h-56 flex items-end justify-between gap-6 relative z-10">
                                    {loading ? (
                                        Array(7).fill(0).map((_, i) => <Skeleton key={i} className="flex-1 rounded-2xl bg-slate-100" style={{ height: `${20 + Math.random() * 80}%` }} />)
                                    ) : (
                                        weeklyData.map((day, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar h-full justify-end">
                                                <div className={`w-full relative h-48 rounded-2xl overflow-hidden flex flex-col justify-end border transition-all ${day.is_holiday ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100 group-hover/bar:border-indigo-300'}`}>
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${day.present}%` }}
                                                        transition={{ delay: i * 0.1, duration: 1.5, ease: "circOut" }}
                                                        className={`w-full transition-all cursor-none ${day.is_holiday ? 'bg-gradient-to-t from-rose-600 to-rose-400' : 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover/bar:from-indigo-500 group-hover/bar:to-cyan-400'}`}
                                                    />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-all bg-slate-900/10 backdrop-blur-[2px]">
                                                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-2xl flex flex-col items-center gap-1 scale-90 group-hover/bar:scale-100 transition-transform">
                                                            <span className="text-[14px] font-black leading-none">{day.present}%</span>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{day.present_count} Present</span>
                                                            {day.is_holiday && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter mt-1">Holiday</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${day.is_holiday ? 'text-rose-500' : 'text-slate-400'}`}>{day.day}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="premium-card p-8 bg-white border-slate-100 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Recent Activity</h3>
                                    <button className="px-4 py-2 rounded-xl bg-slate-50 text-[9px] font-black text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest leading-none">View All</button>
                                </div>

                                <div className="space-y-8 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loading ? (
                                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-3xl bg-slate-50" />)
                                    ) : (
                                        recentActivity.map((activity, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-6 group/item"
                                            >
                                                <div className="h-14 w-14 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-500 uppercase italic text-lg shadow-sm">
                                                    {activity.initial || 'N'}
                                                </div>
                                                <div className="flex-1 border-b border-slate-50 pb-6 group-last/item:border-0">
                                                    <p className="text-base font-medium text-slate-500 leading-none">
                                                        <span className="text-slate-900 font-extrabold uppercase tracking-tight">{activity.user}</span> {activity.action}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Clock size={10} className="text-slate-300" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activity.time}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
