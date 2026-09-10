import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    Users, 
    UserPlus, 
    Search, 
    Edit2, 
    Trash2, 
    Phone, 
    Mail, 
    MapPin, 
    ShoppingBag, 
    X, 
    Check, 
    AlertCircle 
} from 'lucide-react';

export default function ClientsIndex({ clients, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        adresse: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Recherche dynamique
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/clients', { search }, { preserveState: true, replace: true });
    };

    // Ouvrir la modal en mode création
    const handleOpenCreate = () => {
        setEditingClient(null);
        setFormData({ nom: '', prenom: '', telephone: '', email: '', adresse: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    // Ouvrir la modal en mode modification
    const handleOpenEdit = (client) => {
        setEditingClient(client);
        setFormData({
            nom: client.nom || '',
            prenom: client.prenom || '',
            telephone: client.telephone || '',
            email: client.email || '',
            adresse: client.adresse || '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    // Soumission du formulaire (création ou mise à jour)
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        if (editingClient) {
            router.put(`/clients/${editingClient.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/clients', formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setIsSubmitting(false);
                },
            });
        }
    };

    // Suppression d'un client
    const handleDelete = (client) => {
        if (confirm(`Confirmez-vous la suppression du client "${client.prenom} ${client.nom}" ?`)) {
            router.delete(`/clients/${client.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Gestion des Clients" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
                            <Users className="w-5 h-5 text-blue-600 mr-2" />
                            Répertoire des Clients ({clients.length})
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Gérez les fiches clients pour les affecter lors des ventes en boutique.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nom, téléphone, email..."
                                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition w-56 sm:w-64"
                            />
                        </form>

                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Nouveau Client
                        </button>
                    </div>
                </div>

                {/* Table Clients */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    {clients.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-base font-semibold text-slate-600">Aucun client trouvé.</p>
                            <button
                                onClick={handleOpenCreate}
                                className="mt-3 text-sm text-blue-600 font-semibold hover:underline"
                            >
                                Créer un premier client
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <th className="py-3.5 px-4">Client</th>
                                        <th className="py-3.5 px-4">Coordonnées</th>
                                        <th className="py-3.5 px-4">Adresse</th>
                                        <th className="py-3.5 px-4">Historique</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200/50">
                                                        {client.nom.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">
                                                            {client.prenom} {client.nom}
                                                        </span>
                                                        <span className="text-xs text-slate-400">ID #{client.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5 text-xs text-slate-600">
                                                    {client.telephone && (
                                                        <div className="flex items-center">
                                                            <Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                                                            <span>{client.telephone}</span>
                                                        </div>
                                                    )}
                                                    {client.email && (
                                                        <div className="flex items-center">
                                                            <Mail className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                                                            <span>{client.email}</span>
                                                        </div>
                                                    )}
                                                    {!client.telephone && !client.email && (
                                                        <span className="text-slate-400 italic">Non renseigné</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                                                {client.adresse ? (
                                                    <div className="flex items-center">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                                                        <span className="truncate">{client.adresse}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                                    <ShoppingBag className="w-3 h-3 mr-1 text-slate-500" />
                                                    {client.achats_count || 0} achat{(client.achats_count || 0) > 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(client)}
                                                        title="Modifier"
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(client)}
                                                        title="Supprimer"
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Formulaire Client */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="font-bold text-slate-900 text-base flex items-center">
                                <Users className="w-5 h-5 text-blue-600 mr-2" />
                                {editingClient ? 'Modifier le Client' : 'Ajouter un Nouveau Client'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.nom && <p className="text-xs text-red-600 mt-0.5">{errors.nom}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.prenom && <p className="text-xs text-red-600 mt-0.5">{errors.prenom}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                                <input
                                    type="text"
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.telephone && <p className="text-xs text-red-600 mt-0.5">{errors.telephone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse</label>
                                <textarea
                                    rows={2}
                                    value={formData.adresse}
                                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                                >
                                    {isSubmitting ? 'Enregistrement...' : editingClient ? 'Enregistrer les modifications' : 'Créer le client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
