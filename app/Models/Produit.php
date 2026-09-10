<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $table = 'produits';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'description',
        'prix',
        'stock',
        'categorie_id',
    ];

    protected $casts = [
        'prix' => 'float',
        'stock' => 'integer',
    ];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    public function detailsAchats()
    {
        return $this->hasMany(DetailAchat::class, 'produit_id');
    }
}
