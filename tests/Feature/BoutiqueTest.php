<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Categorie;
use App\Models\Client;
use App\Models\Produit;
use App\Models\Achat;
use App\Models\DetailAchat;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BoutiqueTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();

        // S'assurer qu'un admin existe
        if (!Admin::where('nom', 'admin')->exists()) {
            Admin::create([
                'nom' => 'admin',
                'mot_de_passe' => Hash::make('admin123'),
            ]);
        }
    }

    public function test_login_page_is_accessible(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_unauthenticated_access_is_redirected(): void
    {
        $response = $this->get('/ventes');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_authenticate_successfully(): void
    {
        $response = $this->post('/login', [
            'nom' => 'admin',
            'mot_de_passe' => 'admin123',
        ]);

        $response->assertRedirect('/ventes');
        $this->assertTrue(session()->has('admin_id'));
    }

    public function test_authenticated_admin_can_access_all_pages(): void
    {
        $admin = Admin::where('nom', 'admin')->first();

        // 1. POS Caisse
        $response = $this->withSession(['admin_id' => $admin->id])->get('/ventes');
        $response->assertStatus(200);

        // 2. Historique Achats
        $response = $this->withSession(['admin_id' => $admin->id])->get('/achats');
        $response->assertStatus(200);

        // 3. Clients
        $response = $this->withSession(['admin_id' => $admin->id])->get('/clients');
        $response->assertStatus(200);

        // 4. Produits
        $response = $this->withSession(['admin_id' => $admin->id])->get('/produits');
        $response->assertStatus(200);
    }

    public function test_client_crud_operations(): void
    {
        $admin = Admin::where('nom', 'admin')->first();

        // 1. Créer client
        $uniqueTel = '06' . rand(10000000, 99999999);
        $response = $this->withSession(['admin_id' => $admin->id])->post('/clients', [
            'nom' => 'Testeur',
            'prenom' => 'Pierre',
            'telephone' => $uniqueTel,
            'email' => 'pierre.' . uniqid() . '@test.com',
            'adresse' => '10 Rue du Test',
        ]);

        $response->assertSessionHas('success');
        $client = Client::where('telephone', $uniqueTel)->first();
        $this->assertNotNull($client);

        // 2. Modifier client
        $response = $this->withSession(['admin_id' => $admin->id])->put("/clients/{$client->id}", [
            'nom' => 'Testeur Modifié',
            'prenom' => 'Pierre',
            'telephone' => $uniqueTel,
            'email' => $client->email,
            'adresse' => '20 Rue Modifiée',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('Testeur Modifié', $client->fresh()->nom);
    }

    public function test_produit_creation_and_stock_management(): void
    {
        $admin = Admin::where('nom', 'admin')->first();

        $response = $this->withSession(['admin_id' => $admin->id])->post('/produits', [
            'nom' => 'Produit Test ' . uniqid(),
            'description' => 'Description test',
            'prix' => 15.50,
            'stock' => 50,
            'nouvelle_categorie' => 'Catégorie Test ' . uniqid(),
        ]);

        $response->assertSessionHas('success');
    }

    public function test_complete_sale_transaction_decrements_product_stock(): void
    {
        $admin = Admin::where('nom', 'admin')->first();

        // Créer un client
        $client = Client::firstOrCreate(
            ['telephone' => '0700000099'],
            ['nom' => 'ClientVente', 'prenom' => 'Test', 'email' => 'testvente@email.com']
        );

        // Créer un produit avec un stock connu
        $initialStock = 20;
        $prixUnitaire = 5.00;
        $produit = Produit::create([
            'nom' => 'Article Transaction ' . uniqid(),
            'description' => 'Test stock',
            'prix' => $prixUnitaire,
            'stock' => $initialStock,
        ]);

        $quantiteAchetee = 4;

        // Effectuer la vente via POST /achats
        $response = $this->withSession(['admin_id' => $admin->id])->post('/achats', [
            'client_id' => $client->id,
            'items' => [
                [
                    'produit_id' => $produit->id,
                    'quantite' => $quantiteAchetee,
                ],
            ],
        ]);

        $response->assertRedirect('/achats');
        $response->assertSessionHas('success');

        // Vérifier que le stock a été diminué avec exactitude
        $produitApresVente = $produit->fresh();
        $this->assertEquals($initialStock - $quantiteAchetee, $produitApresVente->stock);

        // Vérifier l'enregistrement de l'achat
        $achat = Achat::where('client_id', $client->id)->latest('id')->first();
        $this->assertNotNull($achat);
        $this->assertEquals($prixUnitaire * $quantiteAchetee, (float)$achat->montant_total);
        $this->assertEquals('termine', $achat->statut);

        // Vérifier les détails d'achat
        $detail = DetailAchat::where('achat_id', $achat->id)->first();
        $this->assertNotNull($detail);
        $this->assertEquals($produit->id, $detail->produit_id);
        $this->assertEquals($quantiteAchetee, $detail->quantite);
        $this->assertEquals($prixUnitaire, (float)$detail->prix_unitaire);
    }
}
