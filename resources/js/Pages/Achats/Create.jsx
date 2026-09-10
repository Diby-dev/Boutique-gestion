import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    Search, 
    ShoppingCart, 
    Plus, 
    Minus, 
    Trash2, 
    User, 
    UserPlus, 
    Check, 
    AlertTriangle, 
    Package, 
    Layers, 
    Receipt, 
    X,
    CheckCircle
} from 'lucide-react';

export default function CreateAchat({ clients, categories, produits }) {
    const [selectedClientId, setSelectedClientId] = useState(clients.length > 0 ? clients[0].id : '');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState([]); // [{ produit_id, nom, prix, quantite, stock_max }]
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Modal pour création rapide d'un client au comptoir
    const [showQuickClientModal, setShowQuickClientModal] = useState(false);
    const [quickClientData, setQuickClientData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        adresse: '',
    });
    const [quickClientSubmitting, setQuickClientSubmitting] = useState(false);
    const [quickClientErrors, setQuickClientErrors] = useState({});

    // Filtrage des produits par recherche et catégorie
    const filteredProduits = useMemo(() => {
        return produits.filter((item) => {
            const matchesCategory = selectedCategory === 'all' || item.categorie_id === Number(selectedCategory);
            const matchesSearch = item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [produits, selectedCategory, searchTerm]);

    // Ajouter un produit au panier
    const addToCart = (produit) => {
        if (produit.stock <= 0) return;

        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => item.produit_id === produit.id);
            if (existingIndex > -1) {
                const currentQty = prevCart[existingIndex].quantite;
                if (currentQty >= produit.stock) return prevCart; // Limite de stock atteinte
                
                const updated = [...prevCart];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantite: currentQty + 1,
                };
                return updated;
            } else {
                return [
                    ...prevCart,
                    {
                        produit_id: produit.id,
                        nom: produit.nom,
                        prix: parseFloat(produit.prix),
                        quantite: 1,
                        stock_max: produit.stock,
                    },
                ];
            }
        });
    };

    // Diminuer la quantité
    const decreaseQuantity = (produitId) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.produit_id === produitId);
            if (!existing) return prevCart;
            if (existing.quantite === 1) {
                return prevCart.filter((item) => item.produit_id !== produitId);
            }
            return prevCart.map((item) =>
                item.produit_id === produitId ? { ...item, quantite: item.quantite - 1 } : item
            );
        });
    };

    // Augmenter la quantité
    const increaseQuantity = (produitId) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.produit_id === produitId) {
                    if (item.quantite < item.stock_max) {
                        return { ...item, quantite: item.quantite + 1 };
                    }
                }
                return item;
            })
        );
    };

    // Supprimer une ligne
    const removeFromCart = (produitId) => {
        setCart((prevCart) => prevCart.filter((item) => item.produit_id !== produitId));
    };

    // Vider le panier
    const clearCart = () => {
        setCart([]);
    };

    // Calcul du total
    const totalPanier = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.prix * item.quantite, 0);
    }, [cart]);

    const totalArticles = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantite, 0);
    }, [cart]);

    // Validation et envoi de l'achat
    const handleCheckout = (e) => {
        e.preventDefault();
        setErrors({});

        if (!selectedClientId) {
            setErrors({ client_id: 'Veuillez sélectionner un client pour cette vente.' });
            return;
        }

        if (cart.length === 0) {
            setErrors({ items: 'Le panier est vide. Veuillez ajouter au moins un produit.' });
            return;
        }

        setIsSubmitting(true);

        const payload = {
            client_id: selectedClientId,
            items: cart.map((item) => ({
                produit_id: item.produit_id,
                quantite: item.quantite,
            })),
        };

        router.post('/achats', payload, {
            onError: (err) => {
                setErrors(err);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Création rapide d'un client au comptoir
    const handleQuickClientSubmit = (e) => {
        e.preventDefault();
        setQuickClientSubmitting(true);
        setQuickClientErrors({});

        router.post('/clients', quickClientData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setQuickClientSubmitting(false);
                setShowQuickClientModal(false);
                setQuickClientData({ nom: '', prenom: '', telephone: '', email: '', adresse: '' });
                // Sélectionner automatiquement le nouveau client
                const freshClients = page.props.clients || clients;
                if (freshClients.length > 0) {
                    setSelectedClientId(freshClients[0].id);
                }
            },
            onError: (err) => {
                setQuickClientSubmitting(false);
                setQuickClientErrors(err);
            },
        });
    };

    // Quantité actuellement dans le panier pour chaque produit
    const getCartQtyForProduct = (produitId) => {
        const item = cart.find((i) => i.produit_id === produitId);
        return item ? item.quantite : 0;
    };

    return (
        <AppLayout>
            <Head title="Caisse & Enregistrement Vente" />

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Colonne Gauche : Catalogue Produits & Recherche (65%) */}
                <div className="w-full lg:w-8/12 space-y-4">
                    {/* Barre de recherche et filtres de catégorie */}
                    <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            {/* Recherche textuelle */}
                            <div className="relative w-full sm:w-80">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Rechercher un produit..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filtres par catégories */}
                            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                        selectedCategory === 'all'
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Tous ({produits.length})
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                            selectedCategory === cat.id.toString()
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {cat.nom}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Grille des produits */}
                    {filteredProduits.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">Aucun produit ne correspond à votre recherche.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                            {filteredProduits.map((produit) => {
                                const qtyInCart = getCartQtyForProduct(produit.id);
                                const isOutOfStock = produit.stock <= 0;
                                const isMaxInCart = qtyInCart >= produit.stock;

                                return (
                                    <div
                                        key={produit.id}
                                        onClick={() => !isOutOfStock && !isMaxInCart && addToCart(produit)}
                                        className={`relative group flex flex-col justify-between p-3.5 rounded-2xl bg-white border transition-all duration-150 select-none ${
                                            isOutOfStock
                                                ? 'opacity-60 border-slate-200 cursor-not-allowed bg-slate-50'
                                                : isMaxInCart
                                                ? 'border-amber-300 bg-amber-50/30'
                                                : 'border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {/* Badge quantité dans le panier */}
                                        {qtyInCart > 0 && (
                                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                                                {qtyInCart}
                                            </span>
                                        )}

                                        <div>
                                            {/* Catégorie */}
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate max-w-[120px]">
                                                    {produit.categorie ? produit.categorie.nom : 'Général'}
                                                </span>
                                                {/* Statut du stock */}
                                                {isOutOfStock ? (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                                        Rupture
                                                    </span>
                                                ) : produit.stock <= 5 ? (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                                        Reste {produit.stock}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        Stock: {produit.stock}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Nom du produit */}
                                            <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                                                {produit.nom}
                                            </h4>

                                            {/* Description brève */}
                                            {produit.description && (
                                                <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                                                    {produit.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Prix & Bouton Ajout */}
                                        <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-base font-extrabold text-slate-900">
                                                {Number(produit.prix).toLocaleString('fr-FR')} FCFA
                                            </span>
                                            <button
                                                type="button"
                                                disabled={isOutOfStock || isMaxInCart}
                                                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
                                                    isOutOfStock
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : isMaxInCart
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                                                }`}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Colonne Droite : Panier & Validation de Vente (35%) */}
                <div className="w-full lg:w-4/12 sticky top-20">
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-6rem)]">
                        {/* Header Panier */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold text-base tracking-tight">Panier de Vente</h3>
                            </div>
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    title="Vider le panier"
                                    className="text-xs text-slate-400 hover:text-red-400 transition flex items-center"
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Vider
                                </button>
                            )}
                        </div>

                        {/* Sélection du client */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                                    <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                    Client Acheteur
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowQuickClientModal(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center"
                                >
                                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                                    Nouveau
                                </button>
                            </div>

                            <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- Sélectionner un client --</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom} {c.prenom} {c.telephone ? `(${c.telephone})` : ''}
                                    </option>
                                ))}
                            </select>

                            {errors.client_id && (
                                <p className="text-xs text-red-600 font-semibold mt-1">{errors.client_id}</p>
                            )}
                        </div>

                        {/* Liste des articles dans le panier */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
                            {cart.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">
                                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                                    <p className="text-sm font-medium">Le panier est vide.</p>
                                    <p className="text-xs text-slate-400 mt-1">Cliquez sur un produit à gauche pour l'ajouter.</p>
                                </div>
                            ) : (
                                cart.map((item) => {
                                    const sousTotal = item.prix * item.quantite;
                                    const isMaxReached = item.quantite >= item.stock_max;

                                    return (
                                        <div key={item.produit_id} className="pt-3 first:pt-0 flex items-center justify-between">
                                            <div className="flex-1 pr-2">
                                                <h5 className="text-sm font-bold text-slate-800 line-clamp-1 leading-snug">
                                                    {item.nom}
                                                </h5>
                                                <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                                                    <span>{Number(item.prix).toLocaleString('fr-FR')} FCFA / u</span>
                                                    <span>&bull;</span>
                                                    <span className="font-semibold text-slate-700">{Number(sousTotal).toLocaleString('fr-FR')} FCFA</span>
                                                </div>
                                            </div>

                                            {/* Contrôles Quantité */}
                                            <div className="flex items-center space-x-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => decreaseQuantity(item.produit_id)}
                                                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-7 text-center font-bold text-sm text-slate-900">
                                                    {item.quantite}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={isMaxReached}
                                                    onClick={() => increaseQuantity(item.produit_id)}
                                                    title={isMaxReached ? 'Stock maximum disponible atteint' : 'Ajouter un'}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                                                        isMaxReached
                                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.produit_id)}
                                                    className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition ml-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Erreurs de validation globales */}
                        {errors.items && (
                            <div className="px-4 py-2 bg-red-50 text-red-700 text-xs font-medium border-t border-red-200">
                                {errors.items}
                            </div>
                        )}

                        {/* Récapitulatif Total & Validation */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Nombre d'articles</span>
                                <span className="font-semibold text-slate-800">{totalArticles}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/80">
                                <span className="text-base font-bold text-slate-900">Montant Total</span>
                                <span className="text-2xl font-black text-blue-600">
                                    {Number(totalPanier).toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || !selectedClientId || isSubmitting}
                                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md hover:shadow-lg disabled:shadow-none transition flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed text-sm"
                            >
                                {isSubmitting ? (
                                    <span>Traitement en cours...</span>
                                ) : (
                                    <>
                                        <Receipt className="w-4 h-4" />
                                        <span>Valider l'Achat ({Number(totalPanier).toLocaleString('fr-FR')} FCFA)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de création rapide d'un client */}
            {showQuickClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="font-bold text-slate-900 text-base flex items-center">
                                <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
                                Enregistrer un Nouveau Client
                            </h3>
                            <button
                                onClick={() => setShowQuickClientModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleQuickClientSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={quickClientData.nom}
                                        onChange={(e) => setQuickClientData({ ...quickClientData, nom: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {quickClientErrors.nom && (
                                        <p className="text-xs text-red-600 mt-0.5">{quickClientErrors.nom}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={quickClientData.prenom}
                                        onChange={(e) => setQuickClientData({ ...quickClientData, prenom: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {quickClientErrors.prenom && (
                                        <p className="text-xs text-red-600 mt-0.5">{quickClientErrors.prenom}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                                <input
                                    type="text"
                                    value={quickClientData.telephone}
                                    onChange={(e) => setQuickClientData({ ...quickClientData, telephone: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {quickClientErrors.telephone && (
                                    <p className="text-xs text-red-600 mt-0.5">{quickClientErrors.telephone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={quickClientData.email}
                                    onChange={(e) => setQuickClientData({ ...quickClientData, email: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {quickClientErrors.email && (
                                    <p className="text-xs text-red-600 mt-0.5">{quickClientErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse</label>
                                <textarea
                                    rows={2}
                                    value={quickClientData.adresse}
                                    onChange={(e) => setQuickClientData({ ...quickClientData, adresse: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickClientModal(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={quickClientSubmitting}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                                >
                                    {quickClientSubmitting ? 'Enregistrement...' : 'Créer et Sélectionner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
