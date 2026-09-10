<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->session()->has('admin_id')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter pour accéder à l\'application.');
        }

        return $next($request);
    }
}
