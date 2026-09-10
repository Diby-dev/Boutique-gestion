<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Table des administrateurs
        if (!Schema::hasTable('admins')) {
            Schema::create('admins', function (Blueprint $table) {
                $table->increments('id');
                $table->string('nom', 100);
                $table->string('mot_de_passe', 255);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 2. Table des clients
        if (!Schema::hasTable('clients')) {
            Schema::create('clients', function (Blueprint $table) {
                $table->increments('id');
                $table->string('nom', 100);
                $table->string('prenom', 100);
                $table->string('telephone', 20)->nullable()->unique();
                $table->string('email', 150)->nullable()->unique();
                $table->text('adresse')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        // 3. Table des catégories
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->increments('id');
                $table->string('nom', 100)->unique();
                $table->text('description')->nullable();
            });
        }

        // 4. Table des produits
        if (!Schema::hasTable('produits')) {
            Schema::create('produits', function (Blueprint $table) {
                $table->increments('id');
                $table->string('nom', 150);
                $table->text('description')->nullable();
                $table->decimal('prix', 10, 2);
                $table->integer('stock')->default(0);
                $table->unsignedInteger('categorie_id')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('categorie_id')
                    ->references('id')
                    ->on('categories')
                    ->onDelete('set null');
            });
        }

        // 5. Table des achats
        if (!Schema::hasTable('achats')) {
            Schema::create('achats', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('client_id');
                $table->unsignedInteger('admin_id')->nullable();
                $table->timestamp('date_achat')->useCurrent();
                $table->decimal('montant_total', 10, 2);
                $table->string('statut', 50)->default('en_cours');

                $table->foreign('client_id')
                    ->references('id')
                    ->on('clients')
                    ->onDelete('cascade');

                $table->foreign('admin_id')
                    ->references('id')
                    ->on('admins')
                    ->onDelete('set null');
            });
        }

        // 6. Table des détails des achats
        if (!Schema::hasTable('details_achats')) {
            Schema::create('details_achats', function (Blueprint $table) {
                $table->increments('id');
                $table->unsignedInteger('achat_id');
                $table->unsignedInteger('produit_id');
                $table->integer('quantite');
                $table->decimal('prix_unitaire', 10, 2);

                $table->foreign('achat_id')
                    ->references('id')
                    ->on('achats')
                    ->onDelete('cascade');

                $table->foreign('produit_id')
                    ->references('id')
                    ->on('produits')
                    ->onDelete('restrict');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('details_achats');
        Schema::dropIfExists('achats');
        Schema::dropIfExists('produits');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('admins');
    }
};
