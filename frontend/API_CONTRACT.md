# API Contract — what the frontend sends & expects

Base URL (frontend `VITE_API_URL`): `http://localhost:8000/api`
Every request sends: `Content-Type: application/json`, `Accept: application/json`
Authenticated requests send: `Authorization: Bearer <token>`

> Frontend unwraps responses with `body.data ?? body`, so you may return
> either `{ "data": ... }` (Laravel Resource style) or the raw object/array.
> Both work.

## Endpoints to create

| # | Method | Path         | Auth? | Frontend sends | Frontend expects back |
|---|--------|--------------|-------|----------------|-----------------------|
| 1 | POST   | `/register`  | No    | name, email, password, password_confirmation | `{ token, user }` |
| 2 | POST   | `/login`     | No    | email, password | `{ token, user }` |
| 3 | POST   | `/logout`    | Yes   | (empty body) | `200` any body |
| 4 | GET    | `/urls`      | Yes   | — | array of ShortUrl (logged-in user's links, newest first) |
| 5 | POST   | `/shorten`   | Yes   | original_url | single ShortUrl |
| 6 | GET    | `/{code}`    | No    | — | **302 redirect** to original URL (web route, NOT under `/api`) |

## 1. POST /api/register

Request:
```json
{ "name": "Aarav Sharma", "email": "you@brand.com", "password": "secret123", "password_confirmation": "secret123" }
```
Validate: `name: required|string|max:255`, `email: required|email|unique:users`,
`password: required|min:6|confirmed`.
Success `201`:
```json
{ "data": { "token": "1|abc...", "user": { "id": 1, "name": "Aarav Sharma", "email": "you@brand.com" } } }
```
Fail `422`: `{ "message": "...", "errors": { "email": ["..."] } }`

## 2. POST /api/login

Request:
```json
{ "email": "you@brand.com", "password": "secret123" }
```
Success `200`: same `{ token, user }` shape as register.
Fail `401`/`422`: `{ "message": "Invalid credentials." }`

## 3. POST /api/logout

Headers: `Authorization: Bearer <token>`. Empty body.
Action: delete current Sanctum token. Success `200`: `{ "message": "Logged out." }`

## 4. GET /api/urls

Headers: `Authorization: Bearer <token>`.
Success `200` — array, newest first:
```json
{ "data": [ { "id": 5, "original_url": "https://example.com/very/long", "short_code": "aB3x9Q", "short_url": "http://localhost:8000/aB3x9Q", "clicks": 12, "created_at": "2026-09-13T10:00:00Z" } ] }
```
Notes: `short_url` must be the FULL public URL (frontend renders it as a link).
`clicks` and `created_at` are optional but shown in the UI if present.

## 5. POST /api/shorten

Headers: `Authorization: Bearer <token>`.
Request:
```json
{ "original_url": "https://example.com/very/long/page" }
```
Validate: `original_url: required|url|max:2048`.
Action: generate unique 6-char `short_code`, store row linked to `auth()->id()`.
Success `201`: single ShortUrl object (same shape as items in §4).

## 6. GET /{code} (redirect — web route)

`GET http://localhost:8000/aB3x9Q` → increment `clicks` → `302` redirect to `original_url`.
`404` if code unknown. This is what makes short links actually work when shared.

---

## Copy-paste Laravel wiring (Sanctum)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

`routes/api.php`:
```php
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
```

`routes/web.php` (add — keep after existing routes):
```php
use App\Http\Controllers\ShortUrlController;

Route::get('/{code}', [ShortUrlController::class, 'redirect'])
    ->where('code', '[A-Za-z0-9]{4,12}');
```

Controller sketches:
```php
// AuthController
public function register(Request $r) {
    $d = $r->validate(['name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6|confirmed']);
    $user = User::create(['name' => $d['name'], 'email' => $d['email'],
        'password' => Hash::make($d['password'])]);
    return response()->json(['data' => [
        'token' => $user->createToken('web')->plainTextToken, 'user' => $user,
    ]], 201);
}
public function login(Request $r) {
    $d = $r->validate(['email' => 'required|email', 'password' => 'required']);
    $user = User::where('email', $d['email'])->first();
    if (! $user || ! Hash::check($d['password'], $user->password))
        return response()->json(['message' => 'Invalid credentials.'], 401);
    return response()->json(['data' => [
        'token' => $user->createToken('web')->plainTextToken, 'user' => $user,
    ]]);
}
public function logout(Request $r) {
    $r->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out.']);
}

// ShortUrlController
public function index(Request $r) {
    return response()->json(['data' =>
        $r->user()->shortUrls()->latest()->get()->map(fn ($u) => [
            'id' => $u->id, 'original_url' => $u->original_url,
            'short_code' => $u->short_code,
            'short_url' => url('/' . $u->short_code),
            'clicks' => $u->clicks, 'created_at' => $u->created_at,
        ])]);
}
public function store(Request $r) {
    $d = $r->validate(['original_url' => 'required|url|max:2048']);
    do { $code = Str::random(6); }
    while (ShortUrl::where('short_code', $code)->exists());
    $u = $r->user()->shortUrls()->create([
        'original_url' => $d['original_url'], 'short_code' => $code, 'clicks' => 0]);
    return response()->json(['data' => [
        'id' => $u->id, 'original_url' => $u->original_url,
        'short_code' => $u->short_code, 'short_url' => url('/' . $code),
        'clicks' => 0, 'created_at' => $u->created_at,
    ]], 201);
}
public function redirect(string $code) {
    $u = ShortUrl::where('short_code', $code)->firstOrFail();
    $u->increment('clicks');
    return redirect()->away($u->original_url);
}
```

Suggested migration (`short_urls`): `id`, `user_id` (FK), `original_url` (text),
`short_code` (string, unique), `clicks` (unsigned int, default 0), timestamps.
`User` model needs `HasApiTokens` trait + `shortUrls()` hasMany.

CORS: with `VITE_API_URL=http://localhost:8000/api` and Vite on `:5173`,
allow that origin in `config/cors.php` (`allowed_origins` → `http://localhost:5173`).
