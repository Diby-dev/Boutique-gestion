<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailAchat extends Model
{
    protected $table = 'details_achats';
    public $timestamps = false;

    protected $fillable = [
        'achat_id',
        'produit_id',
        'quantite',
        'prix_unitaire',
    ];

    protected $casts = [
        'quantite' => 'integer',
        'prix_unitaire' => 'float',
    ];

    public function achat()
    {
        return $this->belongsTo(Achat::class, 'achat_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }

    public function getSousTotalAttribute()
    {
        return $this->quantite * $this->prix_unitaire;
    }
}
