<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $clients = Client::query()
            ->when($search, function ($query, $search) {
                $query->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('telephone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->withCount('achats')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20|unique:clients,telephone',
            'email' => 'nullable|email|max:150|unique:clients,email',
            'adresse' => 'nullable|string',
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
        ]);

        Client::create($validated);

        return back()->with('success', 'Client créé avec succès.');
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20|unique:clients,telephone,' . $client->id,
            'email' => 'nullable|email|max:150|unique:clients,email,' . $client->id,
            'adresse' => 'nullable|string',
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé par un autre client.',
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre client.',
        ]);

        $client->update($validated);

        return back()->with('success', 'Client mis à jour avec succès.');
    }

    public function destroy(Client $client)
    {
        $nom = "{$client->prenom} {$client->nom}";
        $client->delete();

        return back()->with('success', "Le client {$nom} a été supprimé.");
    }
}
