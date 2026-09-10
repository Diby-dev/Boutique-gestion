<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\DetailAchat;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AchatController extends Controller
{
    /**
     * Écran de vente / Point de Vente (POS)
     */
    public function create()
    {
        $clients = Client::orderBy('nom')->orderBy('prenom')->get();
        $categories = Categorie::orderBy('nom')->get();
        $produits = Produit::with('categorie')
            ->orderBy('nom')
            ->get();

        return Inertia::render('Achats/Create', [
            'clients' => $clients,
            'categories' => $categories,
            'produits' => $produits,
        ]);
    }

    /**
     * Enregistrement d'un nouvel achat / vente
     */
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'required|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
        ], [
            'client_id.required' => 'Veuillez sélectionner un client.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'items.required' => 'Le panier ne peut pas être vide.',
            'items.min' => 'Ajoutez au moins un produit au panier.',
            'items.*.quantite.min' => 'La quantité doit être supérieure ou égale à 1.',
        ]);

        $clientId = $request->input('client_id');
        $items = $request->input('items');
        $adminId = $request->session()->get('admin_id');

        try {
            $achat = DB::transaction(function () use ($clientId, $adminId, $items) {
                $montantTotal = 0;
                $detailsToInsert = [];

                // Vérifier les stocks avec verrouillage
                foreach ($items as $item) {
                    $produit = Produit::lockForUpdate()->find($item['produit_id']);

                    if (!$produit) {
                        throw ValidationException::withMessages([
                            'items' => "Produit introuvable (ID: {$item['produit_id']}).",
                        ]);
                    }

                    if ($produit->stock < $item['quantite']) {
                        throw ValidationException::withMessages([
                            'items' => "Stock insuffisant pour \"{$produit->nom}\". Stock disponible: {$produit->stock}, demandé: {$item['quantite']}.",
                        ]);
                    }

                    $sousTotal = $produit->prix * $item['quantite'];
                    $montantTotal += $sousTotal;

                    $detailsToInsert[] = [
                        'produit' => $produit,
                        'produit_id' => $produit->id,
                        'quantite' => $item['quantite'],
                        'prix_unitaire' => $produit->prix,
                    ];
                }

                // 1. Créer l'enregistrement dans la table `achats`
                $nouvelAchat = Achat::create([
                    'client_id' => $clientId,
                    'admin_id' => $adminId,
                    'date_achat' => now(),
                    'montant_total' => $montantTotal,
                    'statut' => 'termine',
                ]);

                // 2. Créer les détails et décrémenter le stock
                foreach ($detailsToInsert as $detail) {
                    DetailAchat::create([
                        'achat_id' => $nouvelAchat->id,
                        'produit_id' => $detail['produit_id'],
                        'quantite' => $detail['quantite'],
                        'prix_unitaire' => $detail['prix_unitaire'],
                    ]);

                    // Mise à jour immédiate du stock
                    $detail['produit']->decrement('stock', $detail['quantite']);
                }

                return $nouvelAchat;
            });

            return redirect()->route('achats.index')->with(
                'success',
                "Achat #{$achat->id} enregistré avec succès ! Montant : " . number_format($achat->montant_total, 0, ',', ' ') . " FCFA."
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return back()->with('error', "Une erreur est survenue lors de l'enregistrement : " . $e->getMessage());
        }
    }

    /**
     * Historique des achats
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $achats = Achat::query()
            ->with(['client', 'admin', 'details.produit'])
            ->when($search, function ($query, $search) {
                $query->whereHas('client', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('telephone', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Achats/Index', [
            'achats' => $achats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
