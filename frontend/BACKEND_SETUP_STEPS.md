# Backend Setup Steps (Laravel — beginner guide)

> Ye guide bilkul zero se shuru karti hai. Saare commands `backend/` folder se chalane hain:
> `cd D:\MY_PROJECTS\Laravel-Projects\urlshortner\backend`
>
> Pehle se ready hai: `routes/api.php`, Sanctum migration, `.env` me MySQL setting.

## Step 0 — Terminal backend folder me kholo

```bash
cd D:\MY_PROJECTS\Laravel-Projects\urlshortner\backend
```

Saare neeche wale commands isi folder se chalenge.

## Step 1 — MySQL chalao + database banao

- XAMPP kholo → **MySQL Start** karo (Apache ki zaroorat nahi).
- phpMyAdmin me (`http://localhost/phpmyadmin`) ek database banao, naam: `urlshortner`.
  Ya MySQL shell me: `CREATE DATABASE urlshortner;`

**Kyon:** `.env` me `DB_DATABASE=urlshortner` likha hai — Laravel usi naam ka DB
dhoondega. DB nahi hoga to migrate fail hoga.

## Step 2 — Pehla migrate chalao

```bash
php artisan migrate
```

Tables ban jayengi (`users`, `personal_access_tokens`, ...).

**Kyon:** migration = database ka version-controlled naksha. Sanctum ke login token
isi `personal_access_tokens` table me save honge.

## Step 3 — CORS file banao

```bash
php artisan config:publish cors
```

**Kyon:** frontend `:5173` se chalega aur backend `:8000` se — browser alag port ko
block karta hai. Ye file React ko permission deti hai. Default settings dev ke liye
kaafi hain, kuch edit mat karo.

## Step 4 — User model me token wala trait lagao

File: `app/Models/User.php` — 2 line add karo:

```php
use Laravel\Sanctum\HasApiTokens;   // sabse upar, baaki 'use' lines ke saath
```

```php
use HasFactory, Notifiable, HasApiTokens;   // class ke andar wali line me HasApiTokens jodo
```

**Kyon:** isi trait se `$user->createToken()` kaam karta hai — login/register me
token banane ke liye yehi chahiye.

## Step 5 — ShortUrl model + migration banao

```bash
php artisan make:model ShortUrl -m
```

**Kyon:** Model = `short_urls` table se baat karne wali PHP class. `-m` saath me
uski migration file bhi bana deta hai.

### Step 5b — ShortUrl model me fillable lagao (ZAROORI, warna error aayega)

File: `app/Models/ShortUrl.php` — ye lines add karo:

```php
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'original_url', 'short_code', 'clicks'])]
class ShortUrl extends Model
```

**Kyon:** Laravel security ke liye `create()` se data save karne se pehle poochta hai
"kaun-kaun se columns bharne ki permission hai?" — ye list hi `fillable` hai.
Na lagao to `MassAssignmentException` error aata hai (wahi jo tumhe mila tha).

## Step 6 — Migration file me columns likho

`database/migrations` me sabse nayi file kholo (`...._create_short_urls_table.php`)
aur `Schema::create` ke andar ye columns rakho:

```php
Schema::create('short_urls', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->text('original_url');
    $table->string('short_code')->unique();
    $table->unsignedInteger('clicks')->default(0);
    $table->timestamps();
});
```

Phir chalao:

```bash
php artisan migrate
```

**Kyon:** `user_id` batata hai link kiska hai, `short_code` unique hona chahiye
taaki 2 link kabhi takraye nahi.

## Step 7 — User se links ka rishta jodo

`app/Models/User.php` me class ke andar ye method add karo:

```php
public function shortUrls()
{
    return $this->hasMany(ShortUrl::class);
}
```

(Dono class `App\Models` namespace me hain, isliye alag `use` line ki zaroorat nahi.)

**Kyon:** isse `$user->shortUrls` likh ke us user ke saare links mil jayenge.

## Step 8 — AuthController banao + code paste karo

```bash
php artisan make:controller AuthController
```

File: `app/Http/Controllers/AuthController.php` — poora content ye rakho:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // model me 'hashed' cast hai, auto-hash hoga
        ]);

        return response()->json(['data' => [
            'token' => $user->createToken('web')->plainTextToken,
            'user' => $user,
        ]], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return response()->json(['data' => [
            'token' => $user->createToken('web')->plainTextToken,
            'user' => $user,
        ]]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
```

**Kyon:** Controller = request aane par kya karna hai, wo logic. `validate()`
galat data par khud `422` error bhej deta hai.

## Step 9 — ShortUrlController banao + code paste karo

```bash
php artisan make:controller ShortUrlController
```

File: `app/Http/Controllers/ShortUrlController.php`:

```php
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
```

## Step 10 — API routes likho

File: `routes/api.php` — poora content ye rakho:

```php
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
```

**Kyon:** route = "is URL par aane wali request is controller ko do".
`auth:sanctum` wala group bina token ke andar nahi jaane dega (401 dega).

> Request/response ka full contract `API_CONTRACT.md` me hai.

## Step 11 — Redirect route (web.php me, sabse NEECHE)

File: `routes/web.php` — existing `/` wale route ke **neeche** ye add karo:

```php
use App\Http\Controllers\ShortUrlController;

Route::get('/{code}', [ShortUrlController::class, 'redirect'])
    ->where('code', '[A-Za-z0-9]{4,12}');
```

**Kyon:** short link share hone par browser yahi kholega
(`http://localhost:8000/aB3x9Q`) aur ye asli site par bhej dega. Neeche isliye
taaki `/` wala route pehle match ho — upar likh diya to home page khulna band
ho jayega.

## Step 12 — Verify karo

```bash
php artisan route:list --path=api
```

Tumhe `register, login, logout, urls, shorten` dikhne chahiye. Phir server:

```bash
php artisan serve
```

> **Note:** aage agar koi PHP file (model/controller/route) change karo aur server
> pehle se chal raha ho, to terminal me `Ctrl + C` dabakar server band karo aur
> `php artisan serve` dobara chalao — taaki naya code load ho jaye.

## Step 13 — Test karo (Thunder Client / VS Code extension)

1. `POST http://localhost:8000/api/register`
   body: `{ "name": "...", "email": "...", "password": "...", "password_confirmation": "..." }`
   → token milega.
2. Token copy karke header lagao: `Authorization: Bearer <token>`
3. `POST http://localhost:8000/api/shorten`
   body: `{ "original_url": "https://example.com" }` → `short_url` milega.
4. Browser me `short_url` kholo → asli site par redirect hona chahiye.

## Step 14 — Frontend jodo

`frontend/.env` banao (`.env.example` already hai):

```
VITE_API_URL=http://localhost:8000/api
```

Phir frontend folder me `npm run dev` → Register page se account banao.
Ab demo-mode ki jagah asli API chalegi.

## Errors — ab tak aaye hue errors (seekhne + fix karne ke liye)

### Quick table

| Error | Matlab / fix |
|---|---|
| `SQLSTATE connection refused` | MySQL start nahi hai (XAMPP → MySQL Start) |
| `401 Unauthorized` | Token header missing/galat hai |
| Browser me `CORS error` | Step 3 wali file missing hai |
| `404` on `/api/...` | Route naam galat hai — Step 12 se list check karo |
| `MassAssignmentException` / `Add [...] to fillable property` | Neeche Error 1 dekho |
| `Unknown column 'clicks'` | Neeche Error 2 dekho |

### Error 1 — MassAssignmentException (`Add [original_url] to fillable property...`)

**Poora error:** `Add [original_url] to fillable property to allow mass assignment
on [App\Models\ShortUrl].`

**Kyon aaya:** Laravel me `create([...])` se data save karna **mass assignment**
kehlata hai. Security ke liye Laravel har model se poochta hai: "kaun-kaun se
columns bharne ki permission hai?" — ye permission list hi `fillable` hai.
`ShortUrl` model me ye list thi hi nahi, isliye usne data save karne se mana
kar diya. (`User` model me ye pehle se thi — `#[Fillable(['name', 'email',
'password'])]` — isliye register/login me error nahi aaya tha.)

**Fix:** `app/Models/ShortUrl.php` me ye add karo (Step 5b):

```php
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'original_url', 'short_code', 'clicks'])]
class ShortUrl extends Model
```

**Seekhne wali baat:** jab bhi naya model banao aur `create()` se save karo, to
us model me `fillable` list lagana mat bhoolo.

### Error 2 — Unknown column 'clicks' (`SQLSTATE[42S22]: Column not found: 1054...`)

**Poora error:** `SQLSTATE[42S22]: Column not found: 1054 Unknown column 'clicks'
in 'field list' (... SQL: update `short_urls` set `clicks` = `clicks` + 1 ...)`

**Kyon aaya:** `short_urls` wali migration **khali/adhoori file ke saath chal gayi
thi**, aur columns file me **baad me** add kiye gaye. Sequence aisi hui:
1. `make:model ShortUrl -m` se file bani,
2. `php artisan migrate` chal gaya → table ban gayi **bina `clicks` ke**,
3. phir columns file me paste kiye,
4. dobara `migrate` chalaya → Laravel bola "Nothing to migrate" (uske hisaab se
   ye migration ho chuki hai — `php artisan migrate:status` me `[Ran]` dikhega).

Tab redirect wala code `clicks + 1` karne gaya, column table me tha hi nahi.
**Laravel ka rule: chal chuki migration file edit karne se database nahi badalta.**

**Fix (Tareeka A — sahi/professional tareeka):** nayi migration banao:

```bash
php artisan make:migration add_clicks_to_short_urls_table
```

Nayi file me `up()` aur `down()` likho:

```php
public function up(): void
{
    Schema::table('short_urls', function (Blueprint $table) {
        $table->unsignedInteger('clicks')->default(0)->after('short_code');
    });
}

public function down(): void
{
    Schema::table('short_urls', function (Blueprint $table) {
        $table->dropColumn('clicks');
    });
}
```

Phir `php artisan migrate` chalao — sirf nayi migration chalegi, purana data
(users, links) safe rahega.

**Fix (Tareeka B — shortcut, sirf test data par):**

```bash
php artisan migrate:fresh
```

Ye saari tables gira ke dobara banata hai — users aur links ka data DELETE ho
jayega, Register dobara karna padega. Real project me kabhi mat karna.

**Seekhne wali baat:** database me badlav hamesha NAYI migration se aata hai,
purani chali hui migration edit karne se nahi. `up()` = aage badho (column jodo),
`down()` = peeche hato (column hatao).
