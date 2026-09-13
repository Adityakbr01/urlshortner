<?php

namespace App\Http\Controllers;

use App\Models\ShortUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShortUrlController extends Controller
{
    public function index(Request $request)
    {
        $urls = $request->user()->shortUrls()->latest()->get()->map(fn ($u) => [
            'id' => $u->id,
            'original_url' => $u->original_url,
            'short_code' => $u->short_code,
            'short_url' => url('/'.$u->short_code),
            'clicks' => $u->clicks,
            'created_at' => $u->created_at,
        ]);

        return response()->json(['data' => $urls]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'original_url' => 'required|url|max:2048',
        ]);

        do {
            $code = Str::random(6);
        } while (ShortUrl::where('short_code', $code)->exists());

        $url = $request->user()->shortUrls()->create([
            'original_url' => $data['original_url'],
            'short_code' => $code,
        ]);

        return response()->json(['data' => [
            'id' => $url->id,
            'original_url' => $url->original_url,
            'short_code' => $url->short_code,
            'short_url' => url('/'.$code),
            'clicks' => 0,
            'created_at' => $url->created_at,
        ]], 201);
    }

    public function redirect(string $code)
    {
        $url = ShortUrl::where('short_code', $code)->firstOrFail();
        $url->increment('clicks');

        return redirect()->away($url->original_url);
    }
}
