import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    ShoppingCart, 
    Package, 
    Users, 
    History, 
    LogOut, 
    Store, 
    CheckCircle2, 
    AlertCircle, 
    X,
    UserCheck
} from 'lucide-react';

export default function AppLayout({ children, title }) {
    const page = usePage();
    const { auth, flash } = page.props || {};
    const url = page.url || page.props?.url || (typeof window !== 'undefined' ? window.location.pathname : '') || '';
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setNotification({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setNotification({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setNotification(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const navLinks = [
        { label: 'Caisse / Vente', href: '/ventes', icon: ShoppingCart, active: Boolean(url?.startsWith('/ventes')) },
        { label: 'Produits & Stocks', href: '/produits', icon: Package, active: Boolean(url?.startsWith('/produits')) },
        { label: 'Clients', href: '/clients', icon: Users, active: Boolean(url?.startsWith('/clients')) },
        { label: 'Historique Achats', href: '/achats', icon: History, active: Boolean(url?.startsWith('/achats')) },
    ];

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Arrière-plan boutique.jpg */}
            <div 
                className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20 pointer-events-none"
                style={{ backgroundImage: "url('/boutique.jpg')" }}
            />
            {/* Voile semi-transparent pour assurer la lisibilité */}
            <div 
                className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px] -z-10 pointer-events-none"
            />

            {/* Header / Navbar */}
            <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo & Brand */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                                    Boutique<span className="text-blue-600">Pro</span>
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Gestion locale</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex space-x-1 items-center">
                            {navLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                                            item.active
                                                ? 'bg-blue-50 text-blue-700 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 mr-2 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile & Logout */}
                        <div className="flex items-center space-x-3">
                            {auth?.admin ? (
                                <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                                    <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                            {auth.admin.nom?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {auth.admin.nom}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        title="Déconnexion"
                                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="ml-1 text-xs font-medium hidden sm:inline">Quitter</span>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation bar */}
                <div className="md:hidden border-t border-slate-200 px-2 py-1.5 flex justify-around bg-slate-50">
                    {navLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center py-1 px-2 rounded-md text-xs font-medium ${
                                    item.active ? 'text-blue-600 font-bold' : 'text-slate-600'
                                }`}
                            >
                                <Icon className="w-4 h-4 mb-0.5" />
                                <span>{item.label.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                </div>
            </header>

            {/* Flash Notifications */}
            {notification && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
                    <div
                        className={`flex items-center justify-between p-4 rounded-xl shadow-xs border ${
                            notification.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            {notification.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                            )}
                            <p className="text-sm font-medium">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 text-center text-xs text-slate-500">
                Application Boutique Locale &bull; Base de données MySQL (XAMPP : boutique_db) &bull; Mode Enregistré
            </footer>
        </div>
    );
}
