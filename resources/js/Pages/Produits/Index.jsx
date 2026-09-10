import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    Package, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Layers, 
    AlertTriangle, 
    CheckCircle, 
    X, 
    Tag, 
    Boxes 
} from 'lucide-react';

export default function ProduitsIndex({ produits, categories, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.categorie_id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        prix: '',
        stock: '',
        categorie_id: '',
        nouvelle_categorie: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Recherche et filtre
    const handleFilter = (catId, searchVal) => {
        router.get('/produits', {
            search: searchVal !== undefined ? searchVal : search,
            categorie_id: catId !== undefined ? catId : selectedCategory,
        }, { preserveState: true, replace: true });
    };

    // Ouvrir modal en création
    const handleOpenCreate = () => {
        setEditingProduct(null);
        setFormData({
            nom: '',
            description: '',
            prix: '',
            stock: '10',
            categorie_id: categories.length > 0 ? categories[0].id : '',
            nouvelle_categorie: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    // Ouvrir modal en édition
    const handleOpenEdit = (produit) => {
        setEditingProduct(produit);
        setFormData({
            nom: produit.nom || '',
            description: produit.description || '',
            prix: produit.prix !== undefined ? produit.prix : '',
            stock: produit.stock !== undefined ? produit.stock : 0,
            categorie_id: produit.categorie_id || '',
            nouvelle_categorie: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    // Envoi du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        if (editingProduct) {
            router.put(`/produits/${editingProduct.id}`, formData, {
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
            router.post('/produits', formData, {
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

    // Suppression
    const handleDelete = (produit) => {
        if (confirm(`Confirmez-vous la suppression du produit "${produit.nom}" ?`)) {
            router.delete(`/produits/${produit.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Gestion des Produits & Stocks" />

            <div className="space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
                            <Package className="w-5 h-5 text-blue-600 mr-2" />
                            Catalogue & Stocks ({produits.length} produits)
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Gérez vos articles, prix de vente et quantités d'inventaire.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Barre de recherche */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilter(undefined, e.target.value);
                                }}
                                placeholder="Rechercher un produit..."
                                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition w-52 sm:w-60"
                            />
                        </div>

                        {/* Sélecteur de catégorie */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                handleFilter(e.target.value, undefined);
                            }}
                            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes catégories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nom}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter Produit
                        </button>
                    </div>
                </div>

                {/* Table Produits */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                    {produits.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Boxes className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-base font-semibold text-slate-600">Aucun produit ne correspond aux critères.</p>
                            <button
                                onClick={handleOpenCreate}
                                className="mt-3 text-sm text-blue-600 font-semibold hover:underline"
                            >
                                Ajouter un nouveau produit
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <th className="py-3.5 px-4">Article</th>
                                        <th className="py-3.5 px-4">Catégorie</th>
                                        <th className="py-3.5 px-4">Prix Unitaire</th>
                                        <th className="py-3.5 px-4">État du Stock</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {produits.map((produit) => {
                                        const isOutOfStock = produit.stock <= 0;
                                        const isLowStock = produit.stock > 0 && produit.stock <= 5;

                                        return (
                                            <tr key={produit.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 block">
                                                                {produit.nom}
                                                            </span>
                                                            {produit.description && (
                                                                <span className="text-xs text-slate-400 line-clamp-1 max-w-sm">
                                                                    {produit.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {produit.categorie ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                            <Tag className="w-3 h-3 mr-1 text-slate-400" />
                                                            {produit.categorie.nom}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Sans catégorie</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 font-black text-slate-900">
                                                    {Number(produit.prix).toLocaleString('fr-FR')} FCFA
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {isOutOfStock ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                            <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
                                                            Rupture (0)
                                                        </span>
                                                    ) : isLowStock ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                                            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                                                            Stock faible ({produit.stock})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                                                            En stock ({produit.stock})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <button
                                                            onClick={() => handleOpenEdit(produit)}
                                                            title="Modifier"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(produit)}
                                                            title="Supprimer"
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Formulaire Produit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="font-bold text-slate-900 text-base flex items-center">
                                <Package className="w-5 h-5 text-blue-600 mr-2" />
                                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du produit *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="Ex: Riz Parfumé Dinor 5kg"
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.nom && <p className="text-xs text-red-600 mt-0.5">{errors.nom}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Courte description ou format du produit..."
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.description && <p className="text-xs text-red-600 mt-0.5">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prix unitaire (FCFA) *</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        required
                                        value={formData.prix}
                                        onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                                        placeholder="Ex: 1500"
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.prix && <p className="text-xs text-red-600 mt-0.5">{errors.prix}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Stock disponible *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.stock && <p className="text-xs text-red-600 mt-0.5">{errors.stock}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
                                <select
                                    value={formData.categorie_id}
                                    onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Sans catégorie --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nom}
                                        </option>
                                    ))}
                                </select>

                                {/* Optionnel : créer une nouvelle catégorie au vol */}
                                <div>
                                    <input
                                        type="text"
                                        value={formData.nouvelle_categorie}
                                        onChange={(e) => setFormData({ ...formData, nouvelle_categorie: e.target.value })}
                                        placeholder="Ou saisir une nouvelle catégorie..."
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                                    />
                                </div>
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
                                    {isSubmitting ? 'Enregistrement...' : editingProduct ? 'Enregistrer les modifications' : 'Ajouter le produit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
