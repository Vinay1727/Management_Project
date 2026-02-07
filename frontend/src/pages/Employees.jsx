import React, { useEffect, useState, useMemo } from 'react';
import { getEmployees, addEmployee, deleteEmployee } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import { Search, Plus, Trash2, Filter, Download, UserPlus, Users, X, ChevronLeft, ChevronRight, Eye, Mail, IdCard, MapPin, Phone, Zap, Command, Activity, Shield } from 'lucide-react';
import EmployeeDetailPanel from '../components/EmployeeDetailPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EmployeeCard = ({ emp, onClick, onDelete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -8, shadow: "0 30px 60px rgba(0,0,0,0.12)" }}
            onClick={onClick}
            className="premium-card p-7 flex flex-col gap-5 cursor-pointer group relative overflow-hidden bg-white border-slate-100"
        >
            <div className="flex justify-between items-start">
                <div className="relative">
                    <div className="h-20 w-20 rounded-[1.8rem] bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center font-black text-3xl text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                        {emp.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white shadow-lg"></div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(emp.employee_id); }}
                        className="p-3 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                    >
                        <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors">
                    {emp.full_name}
                </h3>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-indigo-400"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {emp.department}
                    </p>
                </div>
            </div>

            <div className="space-y-3 mt-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <IdCard size={14} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-black text-slate-500 tracking-widest">{emp.employee_id}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Mail size={14} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 truncate">{emp.email}</span>
                </div>
            </div>

            <div className="absolute -bottom-6 -right-4 text-8xl font-black text-slate-50/[0.8] pointer-events-none select-none italic uppercase tracking-tighter">
                {emp.department?.substring(0, 2)}
            </div>
        </motion.div>
    );
};

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOnboard, setShowOnboard] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [form, setForm] = useState({
        employee_id: '',
        full_name: '',
        email: '',
        department: 'Engineering'
    });

    const { addToast } = useToast();
    const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Support'];

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error(err);
            addToast("Communication Fail: Failed to sync database", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addEmployee(form);
            addToast("Employee Added: Success", "success");
            setShowOnboard(false);
            setForm({ employee_id: '', full_name: '', email: '', department: 'Engineering' });
            fetchEmployees();
        } catch (err) {
            addToast(err.response?.data?.detail || "Initial Failure", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Remove Employee: Proceed with deletion?")) {
            try {
                await deleteEmployee(id);
                addToast("Employee Removed", "info");
                fetchEmployees();
            } catch (err) {
                addToast("Sever Interrupted", "error");
            }
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(99, 102, 241);
        doc.text("COMPANY EMPLOYEE RECORDS", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`System Report: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["ID", "EMPLOYEE NAME", "EMAIL", "DEPARTMENT"];
        const tableRows = filteredEmployees.map(emp => [
            emp.employee_id,
            emp.full_name.toUpperCase(),
            emp.email,
            emp.department.toUpperCase()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
            styles: { fontSize: 8, cellPadding: 4, fontStyle: 'bold' }
        });

        doc.save(`registry_audit_${format(new Date(), 'yyyyMMdd')}.pdf`);
        addToast("Downloading Report...", "success");
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = (emp.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
            return matchesSearch && matchesDept;
        });
    }, [employees, searchQuery, selectedDept]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-8 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Employee Directory</h2>
                    <div className="flex items-center gap-2 mt-4">
                        <Activity size={14} className="text-indigo-600" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Corporate Directory Overview</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none min-w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME OR ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-[1.5rem] bg-white border border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all text-[11px] font-black text-slate-900 uppercase tracking-widest shadow-sm placeholder:text-slate-300"
                        />
                    </div>

                    <button
                        onClick={() => setShowOnboard(true)}
                        className="flex-1 lg:flex-none px-6 py-4 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} /> Add New Employee
                    </button>

                    <button
                        onClick={exportToPDF}
                        className="p-4 rounded-[1.5rem] bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                        title="Download Attendance Report"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                {departments.map(dept => (
                    <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all border
                            ${selectedDept === dept
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 shadow-offset-y-4'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'}`}
                    >
                        {dept}
                    </button>
                ))}
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-[3rem] bg-slate-50" />)
                    ) : paginatedEmployees.length === 0 ? (
                        <div className="col-span-full py-48 flex flex-col items-center gap-8 opacity-20">
                            <Command size={100} strokeWidth={1} />
                            <p className="text-2xl font-black uppercase tracking-[0.4em] italic">No Employees Found</p>
                        </div>
                    ) : (
                        paginatedEmployees.map((emp) => (
                            <EmployeeCard
                                key={emp.employee_id}
                                emp={emp}
                                onClick={() => { setSelectedEmployee(emp); setIsPanelOpen(true); }}
                                onDelete={handleDelete}
                            />
                        ))
                    )
                    }
                </AnimatePresence>
            </div>

            {/* Control Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-8 pt-10">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-200 text-slate-400 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-20"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">View Page</span>
                        <span className="text-xl font-black text-slate-900 uppercase tracking-tighter mt-1">{currentPage} / {totalPages}</span>
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-200 text-slate-400 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-20"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* Neural Dossier */}
            <EmployeeDetailPanel
                employee={selectedEmployee}
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />

            {/* Onboarding Portal */}
            <AnimatePresence>
                {showOnboard && (
                    <div className="fixed inset-0 bg-indigo-900/10 backdrop-blur-xl z-[1000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="w-full max-w-xl premium-card p-10 bg-white border-white overflow-hidden relative shadow-[0_50px_100px_rgba(31,38,135,0.15)]"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Shield size={200} className="text-indigo-600" />
                            </div>

                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">New Registration</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Enter employee details below</p>
                                </div>
                                <button onClick={() => setShowOnboard(false)} className="p-4 rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</label>
                                        <input
                                            required
                                            placeholder="EMP-XXXX"
                                            className="w-full px-8 py-8 rounded-3xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:bg-white focus:outline-none transition-all text-slate-900 font-black uppercase tracking-wider text-sm shadow-sm"
                                            value={form.employee_id}
                                            onChange={e => setForm({ ...form, employee_id: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Department</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-8 py-8 rounded-3xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:bg-white focus:outline-none transition-all text-slate-900 font-black uppercase tracking-wider text-sm appearance-none cursor-pointer shadow-sm"
                                                value={form.department}
                                                onChange={e => setForm({ ...form, department: e.target.value })}
                                            >
                                                {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <Filter size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                                    <input
                                        required
                                        placeholder="ENTER NAME..."
                                        className="w-full px-8 py-8 rounded-3xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:bg-white focus:outline-none transition-all text-slate-900 font-black uppercase tracking-wider text-sm shadow-sm"
                                        value={form.full_name}
                                        onChange={e => setForm({ ...form, full_name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="node@protocol.com"
                                        className="w-full px-8 py-8 rounded-3xl bg-slate-50 border border-slate-100 focus:border-indigo-300 focus:bg-white focus:outline-none transition-all text-slate-900 font-black tracking-wider text-sm shadow-sm"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowOnboard(false)}
                                        className="flex-1 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        Save Employee
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Employees;
