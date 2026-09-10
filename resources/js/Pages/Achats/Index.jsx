import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    Search, 
    History, 
    ShoppingCart, 
    Calendar, 
    User, 
    CreditCard, 
    Eye, 
    X, 
    CheckCircle2, 
    Clock,
    FileText
} from 'lucide-react';

export default function AchatsIndex({ achats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [activeDetailAchat, setActiveDetailAchat] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/achats', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Historique des Achats" />

            <div className="space-y-6">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
                            <History className="w-5 h-5 text-blue-600 mr-2" />
                            Historique des Ventes & Achats
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Retrouvez tous les tickets et transactions enregistrés en boutique.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="N° achat, nom client..."
                                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition w-56 sm:w-64"
                            />
                        </form>

                        <Link
                            href="/ventes"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Nouvelle Vente
                        </Link>
                    </div>
                </div>

                {/* Table des Achats */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    {achats.data.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-base font-semibold text-slate-600">Aucun achat enregistré pour le moment.</p>
                            <p className="text-sm text-slate-400 mt-1">Commencez par enregistrer une vente via la caisse.</p>
                            <Link
                                href="/ventes"
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-xs"
                            >
                                Aller à la Caisse
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <th className="py-3.5 px-4">Réf.</th>
                                        <th className="py-3.5 px-4">Client</th>
                                        <th className="py-3.5 px-4">Articles</th>
                                        <th className="py-3.5 px-4">Montant Total</th>
                                        <th className="py-3.5 px-4">Date & Heure</th>
                                        <th className="py-3.5 px-4">Opérateur (Admin)</th>
                                        <th className="py-3.5 px-4">Statut</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {achats.data.map((item) => {
                                        const dateObj = new Date(item.date_achat);
                                        const dateStr = dateObj.toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });

                                        const totalArticles = item.details
                                            ? item.details.reduce((s, d) => s + d.quantite, 0)
                                            : 0;

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-3.5 px-4 font-bold text-blue-600">
                                                    #{item.id}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {item.client ? (
                                                        <div>
                                                            <div className="font-semibold text-slate-900">
                                                                {item.client.nom} {item.client.prenom}
                                                            </div>
                                                            {item.client.telephone && (
                                                                <div className="text-xs text-slate-400">
                                                                    {item.client.telephone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Client inconnu</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600">
                                                    <span className="font-medium text-slate-900">{totalArticles}</span> art.
                                                    <span className="text-xs text-slate-400 ml-1">({item.details?.length || 0} réf.)</span>
                                                </td>
                                                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                                    {Number(item.montant_total).toLocaleString('fr-FR')} FCFA
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 text-xs">
                                                    {dateStr}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                                                    {item.admin?.nom || 'Admin'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                                        {item.statut === 'termine' ? 'Payé' : item.statut}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => setActiveDetailAchat(item)}
                                                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                                        Voir détail
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {achats.links && achats.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Affichage de {achats.from || 0} à {achats.to || 0} sur {achats.total} achats
                            </div>
                            <div className="flex space-x-1">
                                {achats.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg ${
                                            link.active
                                                ? 'bg-blue-600 text-white font-bold'
                                                : link.url
                                                ? 'text-slate-600 hover:bg-slate-100'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Détails de l'Achat */}
            {activeDetailAchat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                                    Détail du Ticket #{activeDetailAchat.id}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Date : {new Date(activeDetailAchat.date_achat).toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveDetailAchat(null)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Info Client & Vendeur */}
                        <div className="py-3 grid grid-cols-2 gap-4 bg-slate-50 px-4 rounded-xl my-3 text-xs">
                            <div>
                                <span className="text-slate-400 block uppercase font-semibold">Client</span>
                                <span className="font-bold text-slate-800">
                                    {activeDetailAchat.client?.nom} {activeDetailAchat.client?.prenom}
                                </span>
                                {activeDetailAchat.client?.telephone && (
                                    <span className="block text-slate-500">{activeDetailAchat.client.telephone}</span>
                                )}
                            </div>
                            <div>
                                <span className="text-slate-400 block uppercase font-semibold">Caissier / Admin</span>
                                <span className="font-bold text-slate-800">{activeDetailAchat.admin?.nom || 'Admin'}</span>
                                <span className="block text-emerald-600 font-semibold uppercase">Statut : {activeDetailAchat.statut}</span>
                            </div>
                        </div>

                        {/* Modal Articles list */}
                        <div className="flex-1 overflow-y-auto space-y-2 py-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Articles achetés ({activeDetailAchat.details?.length || 0})
                            </h4>
                            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                                {activeDetailAchat.details?.map((detail) => {
                                    const st = detail.quantite * detail.prix_unitaire;
                                    return (
                                        <div key={detail.id} className="p-3 flex items-center justify-between text-sm hover:bg-slate-50">
                                            <div>
                                                <div className="font-bold text-slate-900">
                                                    {detail.produit ? detail.produit.nom : `Produit #${detail.produit_id}`}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {detail.quantite} x {Number(detail.prix_unitaire).toLocaleString('fr-FR')} FCFA
                                                </div>
                                            </div>
                                            <div className="font-bold text-slate-900">
                                                {Number(st).toLocaleString('fr-FR')} FCFA
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer / Total */}
                        <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between">
                            <span className="text-base font-bold text-slate-800">Total Réglé :</span>
                            <span className="text-2xl font-black text-blue-600">
                                {Number(activeDetailAchat.montant_total).toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
