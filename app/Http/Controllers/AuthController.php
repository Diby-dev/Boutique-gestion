<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin(Request $request)
    {
        if ($request->session()->has('admin_id')) {
            return redirect()->route('achats.create');
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'nom' => 'required|string',
            'mot_de_passe' => 'required|string',
        ], [
            'nom.required' => 'Le nom d\'administrateur est requis.',
            'mot_de_passe.required' => 'Le mot de passe est requis.',
        ]);

        $admin = Admin::where('nom', $credentials['nom'])->first();

        if (!$admin || !Hash::check($credentials['mot_de_passe'], $admin->mot_de_passe)) {
            return back()->withErrors([
                'nom' => 'Identifiants incorrects. Vérifiez votre nom ou mot de passe.',
            ])->onlyInput('nom');
        }

        // Authentifier dans la session
        $request->session()->put('admin_id', $admin->id);
        $request->session()->put('admin_nom', $admin->nom);
        $request->session()->regenerate();

        return redirect()->intended(route('achats.create'))->with('success', "Bienvenue, {$admin->nom} !");
    }

    public function logout(Request $request)
    {
        $request->session()->forget(['admin_id', 'admin_nom']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Vous avez été déconnecté.');
    }
}
