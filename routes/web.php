<?php

use App\Http\Controllers\AchatController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProduitController;
use Illuminate\Support\Facades\Route;

// Authentification
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Routes protégées réservées aux administrateurs
Route::middleware('admin.auth')->group(function () {
    Route::get('/', function () {
        return redirect()->route('achats.create');
    });

    // Écran de vente (POS) & Achats
    Route::get('/ventes', [AchatController::class, 'create'])->name('achats.create');
    Route::post('/achats', [AchatController::class, 'store'])->name('achats.store');
    Route::get('/achats', [AchatController::class, 'index'])->name('achats.index');

    // Gestion des Clients (CRUD)
    Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');

    // Gestion des Produits (CRUD)
    Route::get('/produits', [ProduitController::class, 'index'])->name('produits.index');
    Route::post('/produits', [ProduitController::class, 'store'])->name('produits.store');
    Route::put('/produits/{produit}', [ProduitController::class, 'update'])->name('produits.update');
    Route::delete('/produits/{produit}', [ProduitController::class, 'destroy'])->name('produits.destroy');
});
