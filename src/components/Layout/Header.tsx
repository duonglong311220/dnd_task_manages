import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiBell, FiSettings, FiPlus, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        setShowDropdown(false);
        navigate('/login');
    };

    // Get initials from user name
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 backdrop-blur-xl">
            {/* Left - Logo */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <span className="text-white font-bold text-sm">TM</span>
                </div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    TaskMaster
                </h1>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-xl mx-8">
                <div className="relative group">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-violet-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tasks, projects..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
                    <FiPlus className="w-4 h-4" />
                    <span>New Task</span>
                </button>

                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors relative">
                    <FiBell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                    <FiSettings className="w-5 h-5" />
                </button>

                {/* User Avatar + Dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(prev => !prev)}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-700/50 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center ring-2 ring-transparent group-hover:ring-violet-500/50 transition-all">
                            <span className="text-white text-sm font-semibold">
                                {getInitials(user?.name)}
                            </span>
                        </div>
                        <div className="hidden sm:flex flex-col items-start">
                            <span className="text-xs font-medium text-slate-200 leading-tight">{user?.name || 'User'}</span>
                            <span className="text-xs text-slate-500 leading-tight truncate max-w-[120px]">{user?.email}</span>
                        </div>
                        <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-semibold">{getInitials(user?.name)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <FiUser className="w-4 h-4 text-slate-400" />
                                    <span>Profile</span>
                                </button>
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <FiSettings className="w-4 h-4 text-slate-400" />
                                    <span>Settings</span>
                                </button>
                            </div>

                            {/* Logout */}
                            <div className="py-1 border-t border-slate-700">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                >
                                    <FiLogOut className="w-4 h-4" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
