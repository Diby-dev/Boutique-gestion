import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Store, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        nom: 'admin',
        mot_de_passe: 'admin123',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Connexion Administrateur" />

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    {/* Brand Icon */}
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-4">
                        <Store className="w-9 h-9" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Boutique<span className="text-blue-400">Pro</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Espace d'administration &bull; Gestion d'achats en local
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                    <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-white/20 sm:px-10">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Authentification Requise</span>
                        </div>

                        {errors.nom && (
                            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                                {errors.nom}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nom d'administrateur
                                </label>
                                <div className="relative rounded-lg shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                        placeholder="Ex: admin"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Mot de passe
                                </label>
                                <div className="relative rounded-lg shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={data.mot_de_passe}
                                        onChange={(e) => setData('mot_de_passe', e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Hint callout */}
                            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
                                <span className="font-semibold">Compte par défaut :</span> Nom: <code className="font-bold">admin</code> &bull; Mot de passe: <code className="font-bold">admin123</code>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (
                                    <span>Connexion en cours...</span>
                                ) : (
                                    <>
                                        <span>Se connecter</span>
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-slate-500 mt-6">
                        Base de données locale MySQL &bull; table <code>admins</code>
                    </p>
                </div>
            </div>
        </>
    );
}
