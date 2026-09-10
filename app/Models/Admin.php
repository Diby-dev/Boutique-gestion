<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    protected $table = 'admins';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'mot_de_passe',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    public function achats()
    {
        return $this->hasMany(Achat::class, 'admin_id');
    }
}
