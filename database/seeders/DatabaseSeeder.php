<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\Produit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin par défaut
        if (Admin::count() === 0) {
            Admin::create([
                'nom' => 'admin',
                'mot_de_passe' => Hash::make('admin123'),
            ]);
        }

        // 2. Catégories
        $categories = [
            ['nom' => 'Alimentation & Épicerie', 'description' => 'Produits alimentaires, riz, huiles, épices et conserves'],
            ['nom' => 'Boissons & Jus', 'description' => 'Eaux minérales, sodas, jus de fruits locaux et naturels'],
            ['nom' => 'Hygiène & Beauté', 'description' => 'Savons, dentifrices, soins corporels et cosmétiques'],
            ['nom' => 'Maison & Entretien', 'description' => 'Produits d\'entretien, détergents et insecticides'],
        ];

        $catMap = [];
        foreach ($categories as $cat) {
            $c = Categorie::firstOrCreate(['nom' => $cat['nom']], ['description' => $cat['description']]);
            $catMap[$cat['nom']] = $c->id;
        }

        // 3. Clients (Exemples de Côte d'Ivoire avec numéros 10 chiffres et adresses à Abidjan)
        $clients = [
            [
                'nom' => 'Kouamé',
                'prenom' => 'Jean-Yves',
                'telephone' => '0701234567',
                'email' => 'jy.kouame@email.ci',
                'adresse' => 'Cocody Angré 8ème Tranche, Abidjan',
            ],
            [
                'nom' => 'Touré',
                'prenom' => 'Aminata',
                'telephone' => '0598765432',
                'email' => 'aminata.toure@email.ci',
                'adresse' => 'Yopougon Selmer, Abidjan',
            ],
            [
                'nom' => 'Konan',
                'prenom' => 'Lucas',
                'telephone' => '0155443322',
                'email' => 'lucas.konan@email.ci',
                'adresse' => 'Marcory Zone 4, Abidjan',
            ],
            [
                'nom' => 'Bamba',
                'prenom' => 'Fatou',
                'telephone' => '0778899001',
                'email' => 'fatou.bamba@email.ci',
                'adresse' => 'Treichville Avenue 16, Abidjan',
            ],
            [
                'nom' => 'Client',
                'prenom' => 'Passager',
                'telephone' => '0000000000',
                'email' => 'passager@boutique.local',
                'adresse' => 'Comptoir boutique',
            ],
        ];

        foreach ($clients as $clientData) {
            Client::firstOrCreate(['telephone' => $clientData['telephone']], $clientData);
        }

        // 4. Produits (Prix en Francs CFA - FCFA)
        $produits = [
            [
                'nom' => 'Riz Parfumé Mémé Cassé 5kg',
                'description' => 'Sac de riz parfumé grain de luxe',
                'prix' => 4500,
                'stock' => 25,
                'categorie_id' => $catMap['Alimentation & Épicerie'] ?? null,
            ],
            [
                'nom' => 'Huile Végétale Dinor 1L',
                'description' => 'Bouteille d\'huile raffinée de palme',
                'prix' => 1400,
                'stock' => 30,
                'categorie_id' => $catMap['Alimentation & Épicerie'] ?? null,
            ],
            [
                'nom' => 'Pack Eau Minérale Awa 6x1.5L',
                'description' => 'Pack de 6 bouteilles d\'eau minérale naturelle',
                'prix' => 2500,
                'stock' => 40,
                'categorie_id' => $catMap['Boissons & Jus'] ?? null,
            ],
            [
                'nom' => 'Jus d\'Ananas Pur Jus 1L',
                'description' => 'Jus naturel local sans sucre ajouté',
                'prix' => 1200,
                'stock' => 20,
                'categorie_id' => $catMap['Boissons & Jus'] ?? null,
            ],
            [
                'nom' => 'Savon BF Morceau 400g',
                'description' => 'Savon de ménage traditionnel ivoirien',
                'prix' => 600,
                'stock' => 50,
                'categorie_id' => $catMap['Hygiène & Beauté'] ?? null,
            ],
            [
                'nom' => 'Dentifrice Signal Protection 75ml',
                'description' => 'Formule protection complète blancheur',
                'prix' => 1000,
                'stock' => 35,
                'categorie_id' => $catMap['Hygiène & Beauté'] ?? null,
            ],
            [
                'nom' => 'Poudre à Laver Omo Extra 1kg',
                'description' => 'Lessive en poudre parfum fraîcheur',
                'prix' => 1800,
                'stock' => 15,
                'categorie_id' => $catMap['Maison & Entretien'] ?? null,
            ],
            [
                'nom' => 'Spaghetti Maman 500g',
                'description' => 'Pâtes alimentaires qualité supérieure',
                'prix' => 500,
                'stock' => 60,
                'categorie_id' => $catMap['Alimentation & Épicerie'] ?? null,
            ],
        ];

        foreach ($produits as $prod) {
            Produit::firstOrCreate(['nom' => $prod['nom']], $prod);
        }
    }
}
