<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProduitController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $categorieId = $request->query('categorie_id');

        $produits = Produit::query()
            ->with('categorie')
            ->when($search, function ($query, $search) {
                $query->where('nom', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($categorieId, function ($query, $categorieId) {
                $query->where('categorie_id', $categorieId);
            })
            ->orderBy('id', 'desc')
            ->get();

        $categories = Categorie::orderBy('nom')->get();

        return Inertia::render('Produits/Index', [
            'produits' => $produits,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'categorie_id' => $categorieId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:150',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'categorie_id' => 'nullable|exists:categories,id',
            'nouvelle_categorie' => 'nullable|string|max:100',
        ], [
            'nom.required' => 'Le nom du produit est obligatoire.',
            'prix.required' => 'Le prix est obligatoire.',
            'prix.numeric' => 'Le prix doit être un nombre valide.',
            'stock.required' => 'Le stock est obligatoire.',
            'stock.integer' => 'Le stock doit être un entier.',
        ]);

        if (!empty($validated['nouvelle_categorie'])) {
            $cat = Categorie::firstOrCreate(['nom' => trim($validated['nouvelle_categorie'])]);
            $validated['categorie_id'] = $cat->id;
        }

        unset($validated['nouvelle_categorie']);

        Produit::create($validated);

        return back()->with('success', 'Produit ajouté avec succès.');
    }

    public function update(Request $request, Produit $produit)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:150',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'categorie_id' => 'nullable|exists:categories,id',
            'nouvelle_categorie' => 'nullable|string|max:100',
        ], [
            'nom.required' => 'Le nom du produit est obligatoire.',
            'prix.required' => 'Le prix est obligatoire.',
            'stock.required' => 'Le stock est obligatoire.',
        ]);

        if (!empty($validated['nouvelle_categorie'])) {
            $cat = Categorie::firstOrCreate(['nom' => trim($validated['nouvelle_categorie'])]);
            $validated['categorie_id'] = $cat->id;
        }

        unset($validated['nouvelle_categorie']);

        $produit->update($validated);

        return back()->with('success', 'Produit mis à jour avec succès.');
    }

    public function destroy(Produit $produit)
    {
        // Vérifier si le produit est lié à des détails d'achats (contrainte ON DELETE RESTRICT)
        if ($produit->detailsAchats()->exists()) {
            return back()->with('error', 'Impossible de supprimer ce produit car il est présent dans l\'historique des ventes.');
        }

        $nom = $produit->nom;
        $produit->delete();

        return back()->with('success', "Le produit \"{$nom}\" a été supprimé.");
    }
}
