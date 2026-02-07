import React from 'react';
import { Bell, Zap, Activity, ShieldAlert, Command } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
    const alerts = [
        { id: 1, title: 'Node Synchronization Delay', detail: 'Sector Marketing reporting 200ms latency.', type: 'critical', time: '2m' },
        { id: 2, title: 'Registry Update Successful', detail: '34 nodes successfully committed to mainnet.', type: 'info', time: '15m' },
        { id: 3, title: 'Protocol Integrity Check', detail: 'All systems operational. Zero drifts detected.', type: 'success', time: '1h' },
        { id: 4, title: 'Unauthorized Nodal Access', detail: 'Blocked attempt from external IP 192.168.1.5.', type: 'warning', time: '3h' },
    ];

    return (
        <div className="space-y-12 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Activity Stream</h2>
                    <div className="flex items-center gap-2 mt-4">
                        <Activity size={14} className="text-indigo-600" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Live Updates & Notifications</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {alerts.map((alert, i) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="premium-card p-8 bg-white border-slate-100 flex flex-col gap-6 relative overflow-hidden group"
                    >
                        <div className={`h-1.5 w-full absolute top-0 left-0 ${alert.type === 'critical' ? 'bg-rose-500' :
                            alert.type === 'warning' ? 'bg-amber-500' :
                                alert.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`} />

                        <div className="flex justify-between items-start">
                            <div className={`p-4 rounded-2xl ${alert.type === 'critical' ? 'bg-rose-50 text-rose-600' :
                                alert.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    alert.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                <ShieldAlert size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{alert.time} AGO</span>
                        </div>

                        <div>
                            <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none">{alert.title}</h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed">{alert.detail}</p>
                        </div>

                        <button className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors mt-2">
                            View Log <Activity size={12} />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="fixed bottom-10 right-10 opacity-10 pointer-events-none rotate-12">
                <Command size={300} strokeWidth={1} />
            </div>
        </div>
    );
};

export default Notifications;
