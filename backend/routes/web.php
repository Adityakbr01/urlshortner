<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\shortUrlController;

Route::get('/', function () {
    return view('welcome');
});



Route::get('/{code}', [ShortUrlController::class, 'redirect'])
    ->where('code', '[A-Za-z0-9]{4,12}');

