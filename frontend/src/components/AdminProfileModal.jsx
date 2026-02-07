import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Mail, Shield, Smartphone, MapPin, LogOut, Save, Edit2, ShieldCheck, Zap, Activity, Command, Phone, UserCheck } from 'lucide-react';

const AdminProfileModal = ({ isOpen, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [adminData, setAdminData] = useState({
        name: 'Vinay Badnoriya',
        role: 'Lead Architect',
        email: 'vvinaybadnoriya@gmail.com',
        phone: '+91-9630370764',
        location: 'Breeze Global, India',
        avatar: null
    });

    useEffect(() => {
        const savedData = localStorage.getItem('adminProfile');
        if (savedData) {
            try {
                setAdminData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse saved profile", e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('adminProfile', JSON.stringify(adminData));
        setIsEditing(false);
        window.dispatchEvent(new Event('adminProfileUpdated'));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newData = { ...adminData, avatar: reader.result };
                setAdminData(newData);
                localStorage.setItem('adminProfile', JSON.stringify(newData));
                window.dispatchEvent(new Event('adminProfileUpdated'));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (field, value) => {
        setAdminData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex justify-center items-center p-4 bg-indigo-950/15 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isEditing && onClose()}
                        className="absolute inset-0 cursor-crosshair"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.12)] border border-white overflow-hidden z-10"
                    >
                        {/* Vibrant Header Compact */}
                        <div className="h-44 bg-indigo-600 relative overflow-hidden flex items-start p-10 pt-12">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 opacity-95"></div>
                            <div className="absolute top-6 right-6 z-20">
                                {!isEditing && (
                                    <button
                                        onClick={onClose}
                                        className="p-3 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all backdrop-blur-xl border border-white/20"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                            <div className="absolute -bottom-10 left-6 p-16 opacity-[0.05] pointer-events-none rotate-12">
                                <Command size={180} className="text-white" />
                            </div>

                            <div className="relative z-10 w-full">
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Identity Dossier</h3>
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_white]"></div>
                                    <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.25em]">Authenticated Node</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Identity Node Compact */}
                            <div className="relative -mt-20 mb-8 flex justify-center">
                                <div className="relative group">
                                    <div className="h-28 w-28 rounded-[2.2rem] bg-white p-1.5 shadow-xl relative">
                                        <div className="h-full w-full rounded-[1.8rem] bg-slate-50 overflow-hidden flex items-center justify-center border-4 border-indigo-600/5">
                                            {adminData.avatar ? (
                                                <img src={adminData.avatar} alt="Admin" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-4xl font-black text-indigo-600 italic">
                                                    {(adminData.name || 'Admin').split(' ').map(n => n ? n[0] : '').join('') || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-1 -right-1 p-3 bg-indigo-600 text-white rounded-[1.2rem] shadow-lg cursor-pointer hover:scale-110 hover:bg-indigo-700 active:scale-95 transition-all border-4 border-white">
                                            <Camera size={18} />
                                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="text-center">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={adminData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="text-2xl font-black text-center text-slate-900 bg-slate-50 border-2 border-indigo-100 rounded-2xl px-6 py-4 w-full outline-none focus:border-indigo-600 italic tracking-tighter uppercase shadow-sm"
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none truncate px-4">{adminData.name}</h4>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100 mt-1">
                                                <ShieldCheck size={14} /> {adminData.role}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <ProfileTacticalItem
                                        icon={Mail}
                                        label="Neural link"
                                        value={adminData.email}
                                        isEditing={isEditing}
                                        onChange={(val) => handleChange('email', val)}
                                    />
                                    <ProfileTacticalItem
                                        icon={Smartphone}
                                        label="Secure Comms"
                                        value={adminData.phone}
                                        isEditing={isEditing}
                                        onChange={(val) => handleChange('phone', val)}
                                    />
                                    <ProfileTacticalItem
                                        icon={MapPin}
                                        label="Relay node"
                                        value={adminData.location}
                                        isEditing={isEditing}
                                        onChange={(val) => handleChange('location', val)}
                                    />
                                    <div className="p-5 rounded-[1.8rem] bg-slate-50 border border-slate-100 space-y-3 shadow-sm hover:border-indigo-200 transition-all">
                                        <div className="flex items-center gap-2">
                                            <Activity size={15} className="text-indigo-600" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Health</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-base font-black text-slate-900 uppercase italic tracking-tighter leading-none">98.2%</span>
                                            <div className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 italic">Opt</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-50 flex gap-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 py-4 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Save size={16} /> Sync Updates
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 rounded-[1.5rem] bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100"
                                        >
                                            Abort
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 py-4 rounded-[1.5rem] bg-white text-indigo-600 font-black uppercase tracking-widest text-[10px] border-2 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                                    >
                                        <Edit2 size={16} /> Modify Profile
                                    </button>
                                )}
                                <button className="p-4 rounded-[1.5rem] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                                    <LogOut size={22} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const ProfileTacticalItem = ({ icon: Icon, label, value, isEditing, onChange, forceUppercase = true }) => (
    <div className={`p-5 rounded-[1.8rem] transition-all relative overflow-hidden group shadow-sm ${isEditing ? 'bg-white border-2 border-indigo-600 shadow-indigo-50' : 'bg-slate-50 border border-slate-100 hover:border-indigo-200'}`}>
        <div className="flex items-center gap-2 mb-2 relative z-10 font-black text-slate-400 uppercase tracking-widest">
            <Icon size={14} className={`${isEditing ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
            <span className="text-[9px] leading-none">{label}</span>
        </div>
        {isEditing ? (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-slate-200 relative z-10 tracking-tighter italic ${forceUppercase ? 'uppercase' : ''}`}
                placeholder="..."
            />
        ) : (
            <p className="text-xs font-bold text-slate-700 truncate relative z-10">{value}</p>
        )}
    </div>
);

export default AdminProfileModal;
