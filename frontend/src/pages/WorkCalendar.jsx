import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees, getAttendanceByDate } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Users, Calendar as CalendarIcon, Activity, Zap, ShieldCheck, Command } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { dateStr: { empId: status } }
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('All');

    const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Support'];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchMonthAttendance();
    }, [currentMonth]);

    const fetchInitialData = async () => {
        try {
            const { data } = await getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMonthAttendance = async () => {
        setLoading(true);
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        const newAttendance = {};
        try {
            const promises = days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return getAttendanceByDate(dateStr).then(res => ({ dateStr, data: res.data }));
            });

            const results = await Promise.all(promises);
            results.forEach(({ dateStr, data }) => {
                newAttendance[dateStr] = {};
                data.forEach(att => {
                    newAttendance[dateStr][att.employee_id] = att.status;
                });
            });
            setAttendanceData(newAttendance);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => selectedDept === 'All' || e.department === selectedDept);
    }, [employees, selectedDept]);

    const getDayStats = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayAtt = attendanceData[dateStr] || {};
        const relevantIds = filteredEmployees.map(e => e.employee_id);

        let present = 0;
        let absent = 0;

        relevantIds.forEach(id => {
            if (dayAtt[id] === 'Present') present++;
            else if (dayAtt[id] === 'Absent') absent++;
        });

        return { present, absent };
    };

    return (
        <div className="space-y-12 py-8">
            {/* Navigational Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Attendance History</h2>
                    <div className="flex items-center gap-2 mt-4">
                        <Activity size={14} className="text-indigo-600" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Monthly Attendance Overview</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="premium-card bg-white p-2 flex items-center gap-2 border-slate-100 shadow-sm">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-4 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="px-8 text-center min-w-[200px]">
                            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">{format(currentMonth, 'MMMM')}</h3>
                            <p className="text-[10px] font-black text-indigo-600 mt-2 uppercase tracking-[0.2em] leading-none">{format(currentMonth, 'yyyy')}</p>
                        </div>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-4 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="relative group">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="pl-14 pr-12 py-5 rounded-[2rem] bg-white border border-slate-100 text-[10px] font-black text-slate-900 uppercase tracking-widest focus:border-indigo-300 focus:outline-none appearance-none cursor-pointer shadow-sm hover:border-indigo-200"
                        >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="premium-card bg-white border-slate-100 p-12 relative overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="absolute top-0 right-0 p-24 opacity-[0.02] pointer-events-none rotate-12">
                    <CalendarIcon size={400} />
                </div>

                {/* Week Layout */}
                <div className="grid grid-cols-7 gap-8 mb-12 relative z-10">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="text-center">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">{d}</span>
                        </div>
                    ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 gap-8 relative z-10">
                    {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDay = isToday(day);
                        const stats = getDayStats(day);
                        const hasData = stats.present > 0 || stats.absent > 0;
                        const presentPercentage = hasData ? (stats.present / (stats.present + stats.absent)) * 100 : 0;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.005 }}
                                className={`relative min-h-[160px] p-6 rounded-[2.5rem] border transition-all flex flex-col justify-between group ${!isCurrentMonth
                                    ? 'bg-transparent border-transparent opacity-10 pointer-events-none'
                                    : isTodayDay
                                        ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-200'
                                        : 'bg-slate-50/50 border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-3xl font-black italic tracking-tighter ${isTodayDay ? 'text-white' : 'text-slate-300 group-hover:text-indigo-600'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {isTodayDay && (
                                        <div className="px-3 py-1 bg-white text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            TODAY
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    {loading ? (
                                        <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
                                    ) : hasData ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${isTodayDay ? 'bg-white' : 'bg-emerald-500'}`}></div>
                                                    <span className={`text-[10px] font-black uppercase ${isTodayDay ? 'text-white/80' : 'text-emerald-600'}`}>{stats.present}</span>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase ${isTodayDay ? 'text-white/60' : 'text-rose-500'}`}>{stats.absent}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-200/30 rounded-full overflow-hidden flex p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${presentPercentage}%` }}
                                                    className={`h-full rounded-full ${isTodayDay ? 'bg-white shadow-[0_0_15px_white]' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">No Records Found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Tactical Legend */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                <div className="flex gap-12 bg-white px-12 py-6 rounded-[2rem] border border-slate-100 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-100" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Present</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500/40" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Absent</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-indigo-600 bg-white" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Date</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-indigo-50 border border-indigo-100 px-10 py-5 rounded-[2rem]">
                    <Command size={28} className="text-indigo-600" />
                    <div className="flex flex-col">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none">Dept. Attendance Health</p>
                        <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter mt-1">{selectedDept}: <span className="text-indigo-600">Active (98.2%)</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkCalendar;
