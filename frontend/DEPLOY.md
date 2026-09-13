# Deploy Guide — app ko free me live karo

> Stack: React (Vite) frontend + Laravel API backend + MySQL.
> Ye guide Hinglish me hai, bilkul step-by-step. Pehle **recommended rasta** (sabse easy),
> phir **free options ki list**, phir **checklist + errors**.

## Rasta samjho (2 minute ka concept)

- **Frontend** (React) → static files (`dist/` folder) → **Vercel** par free host hoga.
- **Backend** (Laravel) → PHP server chahiye → **Railway** par free host hoga.
- **Database** → Railway ke andar hi free **MySQL plugin** lagega.
- Dono alag-alag URL par live honge, aur `VITE_API_URL` se aapas me judenge.

```
User → https://tumhara-app.vercel.app (frontend)
          ↓ API calls
       https://tumhara-api.railway.app/api (backend)
          ↓
       Railway MySQL (database)
```

## Step 0 — Code GitHub par dalo

Dono hosting GitHub se auto-deploy karti hain, to pehle code push karo:

```bash
cd D:\MY_PROJECTS\Laravel-Projects\urlshortner
git init
git add .
git commit -m "url shortener v1"
```

- GitHub.com par naya repository banao (naam: `urlshortner`), phir:
```bash
git remote add origin https://github.com/TUMHARA-USERNAME/urlshortner.git
git branch -M main
git push -u origin main
```

> `.env` files kabhi push mat karo — check karo `git status` me `.env` dikhe to
> turant `.gitignore` me add karo. Backend me ye pehle se hota hai, frontend me
> `.env` (jisme API URL hai) ignore list me rakho.

## Step 1 — Backend live karo (Railway)

1. **railway.app** par GitHub se login karo → **New Project → Deploy from GitHub** → apna `urlshortner` repo chuno.
2. Service ki **Settings → Root Directory** me `backend` likho (kyonki Laravel `backend/` folder me hai, repo root me nahi).
3. **Start Command** set karo (Settings → Deploy → Start Command):
   ```
   php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
   ```
   *Kyon: server start hone se pehle migrations auto-chal jayengi, table khud ban jayegi.*
4. **MySQL add karo:** Project canvas par **New → Database → MySQL**. Railway DB ke variables khud banata hai.
5. Backend service me **Variables** tab me ye add karo (DB wale MySQL plugin se reference lekar):

   | Variable | Value |
   |---|---|
   | `APP_ENV` | `production` |
   | `APP_DEBUG` | `false` |
   | `APP_KEY` | apne PC par `php artisan key:generate --show` chala ke jo key mile, wo paste karo |
   | `APP_URL` | Railway wali backend URL, jaise `https://tumhara-api.up.railway.app` |
   | `DB_CONNECTION` | `mysql` |
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_DATABASE` | `${{MySQL.MYSQLDATABASE}}` |
   | `DB_USERNAME` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |

   *`${{...}}` Railway ka reference syntax hai — value khud uth jayegi, type karne ki zaroorat nahi.*
6. **Deploy** dabao → **Deployments → View Logs** me `Started server` dikhe to backend live hai.
7. Test karo: browser me `https://tumhara-api.up.railway.app/up` kholo → `ok` dikhna chahiye (Laravel health check).
8. **Ek code change zaroori hai** (proxies ke liye) — `backend/bootstrap/app.php` me:
   ```php
   ->withMiddleware(function (Middleware $middleware): void {
       $middleware->trustProxies(at: '*');
   })
   ```
   *Kyon: Railway request proxy ke peeche se aata hai — ye line bina `http/https` confusion ke sahi URL banati hai (nahi to short links galat banenge). Change karke commit + push karo, Railway khud redeploy karega.*

## Step 2 — Frontend live karo (Vercel)

1. **vercel.com** par GitHub se login karo → **Add New → Project** → wahi repo import karo.
2. **Root Directory** me `frontend` chuno (Edit karke). Framework: **Vite** auto-detect hoga.
   Build Command: `npm run build`, Output Directory: `dist` (default sahi hai).
3. **Environment Variables** me add karo:
   ```
   VITE_API_URL=https://tumhara-api.up.railway.app/api
   ```
   *(apni Railway backend URL lagao — yehi frontend ko backend se jodta hai)*
4. **Deploy** → tumhe URL milega, jaise `https://tumhara-app.vercel.app`.
5. **CORS fix:** backend ke `config/cors.php` me `allowed_origins` me apni Vercel URL add karo:
   ```php
   'allowed_origins' => ['https://tumhara-app.vercel.app'],
   ```
   Commit + push karo (Railway redeploy ho jayega).
   *Kyon: browser backend ko tabhi data dega jab uski origin allow-list me ho — nahi to register/login par CORS error aayega.*

## Step 3 — Live test karo (checklist)

1. `https://tumhara-app.vercel.app/register` → account banao → Home khulna chahiye.
2. Link shorten karo → `short_url` backend domain ka milega (jaise `https://tumhara-api.../aB3x9Q`).
3. Short link naye tab me kholo → asli site khulni chahiye + clicks badhne chahiye.
4. Dark mode toggle + mobile view (phone se kholo) check karo.

## Free hosting options (poori list)

**Frontend (static — sab free, koi bhi chuno):**

| Service | Free me kya milta hai | Link |
|---|---|---|
| Vercel | Unlimited static sites, auto-deploy, free SSL | vercel.com |
| Netlify | 100GB bandwidth/month, auto-deploy, free SSL | netlify.com |
| Cloudflare Pages | Unlimited bandwidth (!), fast CDN | pages.cloudflare.com |

**Backend (PHP/Laravel — free starting options):**

| Service | Free me kya milta hai | Note |
|---|---|---|
| Railway | Naya account par free trial credit, PHP auto-detect, MySQL plugin 1-click | railway.app |
| Render | Free web service (Docker se Laravel), idle par sleep hota hai | render.com |
| Koyeb | Free tier instances, Git/Docker deploy | koyeb.com |
| Fly.io | `fly launch` Laravel pehchanta hai, CLI se deploy | fly.io |
| Oracle Cloud | Hamesha-free VPS (khud LEMP stack lagana padta hai — advanced) | oracle.com/cloud/free |
| InfinityFree | Free PHP + MySQL (no SSH/composer — sirf last option) | infinityfree.com |

**Free database (agar alag DB chahiye):**

| Service | Type | Link |
|---|---|---|
| Neon | Postgres (Laravel support karta hai) | neon.tech |
| Supabase | Postgres + extra tools | supabase.com |
| PlanetScale | MySQL | planetscale.com |
| TiDB Cloud | MySQL-compatible | tidbcloud.com |

> Free tiers ki limits badalti rehti hain — deploy se pehle us service ka pricing page
> ek nazar dekh lena. Demo/learning ke liye sab kaafi hain.

## Deploy ke baad aane wale common errors

| Error | Kyon / fix |
|---|---|
| `500` on all API routes | `APP_KEY` missing hai → Railway variables me set karo |
| `CORS error` browser me | Vercel URL `cors.php` allow-list me nahi → Step 2.5 karo |
| `SQLSTATE connection refused` | DB variables galat → Step 1.5 wali table check karo |
| Pehli request 30–60 sec slow | Free service sleep se jaag raha hai — normal hai, agli requests fast hongi |
| Short link `http://` ban raha hai | `trustProxies` wali line (Step 1.8) missing hai |
| `Mixed content` warning | Frontend `https` hai par `VITE_API_URL` me `http://` likha hai → `https://` karo |
| Vercel build fail | Root Directory `frontend` set hai ya nahi check karo; locally `npm run build` chala ke dekho |
| Railway build fail | `composer.json` `backend/` me hai aur Root Directory `backend` set hai check karo |

## Aage ke steps (optional, jab app stable ho jaye)

- **Custom domain:** Namecheap/Cloudflare se domain lo (~₹800/saal) → Vercel + Railway dono me free me jod sakte ho.
- **Uptime:** BetterUptime/UptimeRobot (free) se 5-min ping lagao — free backend sleep kam hoga aur down-time ka alert milega.
- **Logs:** Railway dashboard → Deployments → Logs me PHP errors dikhte hain — production me `APP_DEBUG=false` rakho taaki users ko error detail na dikhe.
