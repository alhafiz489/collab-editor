<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::redirect('/dashboard', '/documents')
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    // Documents
    Route::get('/documents', [DocumentController::class, 'index'])
        ->name('documents.index');

    Route::post('/documents', [DocumentController::class, 'store'])
        ->name('documents.store');

    Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])
        ->name('documents.edit');

    Route::put('/documents/{document}', [DocumentController::class, 'update'])
        ->name('documents.update');

    Route::post('/documents/{document}/broadcast', [DocumentController::class, 'broadcast'])
        ->name('documents.broadcast');

    Route::get('/documents/{document}/versions', [DocumentController::class, 'versions'])
        ->name('documents.versions');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

require __DIR__.'/auth.php';