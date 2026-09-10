<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'clients';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'email',
        'adresse',
    ];

    public function achats()
    {
        return $this->hasMany(Achat::class, 'client_id');
    }

    public function getNomCompletAttribute()
    {
        return "{$this->prenom} {$this->nom}";
    }
}
