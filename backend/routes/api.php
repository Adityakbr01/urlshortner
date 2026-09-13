<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShortUrlController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/urls', [ShortUrlController::class, 'index']);
    Route::post('/shorten', [ShortUrlController::class, 'store']);
});
