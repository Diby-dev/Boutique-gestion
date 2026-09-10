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
        if (Schema::hasTable('achats') && !Schema::hasColumn('achats', 'admin_id')) {
            Schema::table('achats', function (Blueprint $table) {
                $table->integer('admin_id')->nullable()->after('client_id');

                if (Schema::hasTable('admins')) {
                    $table->foreign('admin_id')
                        ->references('id')
                        ->on('admins')
                        ->onDelete('set null');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('achats') && Schema::hasColumn('achats', 'admin_id')) {
            Schema::table('achats', function (Blueprint $table) {
                $table->dropForeign(['admin_id']);
                $table->dropColumn('admin_id');
            });
        }
    }
};
