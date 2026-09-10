<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achat extends Model
{
    protected $table = 'achats';
    public $timestamps = false;

    protected $fillable = [
        'client_id',
        'admin_id',
        'date_achat',
        'montant_total',
        'statut',
    ];

    protected $casts = [
        'montant_total' => 'float',
        'date_achat' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public function details()
    {
        return $this->hasMany(DetailAchat::class, 'achat_id');
    }
}
