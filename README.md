# CCI India website

React 19 + Vite + Tailwind CSS website for CCI India. The public site includes searchable council directories, legacy council content, a database-backed newsfeed, and a protected news administration area.

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

The website builds without Supabase credentials. In that mode it displays the preserved static news seed and the admin login explains that configuration is required.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/202609170001_news_admin.sql` in the Supabase SQL editor. It creates the `news` and `admins` tables, the public `news-images` bucket, timestamp trigger, indexes, and Row Level Security policies.
3. Copy the project URL and publishable key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The legacy `VITE_SUPABASE_ANON_KEY` name remains supported as a fallback. Never add a secret or service-role key to this frontend.
4. In Supabase Authentication, create the first user with an email and a strong password. Copy that user’s UUID.
5. In the SQL editor authorize exactly that user:

```sql
insert into public.admins (user_id) values ('THE_AUTH_USER_UUID');
```

6. Restart the Vite server, open `/admin/login`, and sign in. Add the preserved static items as database rows if they should remain public after Supabase is connected.

For Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project and redeploy. `VITE_SUPABASE_ANON_KEY` can be used instead only for a legacy anon key. `vercel.json` already rewrites direct route visits to the SPA entry point.

## Content maintenance

- Council data: `content/councils.json`
- Council legacy importer: `npm run import:councils`
- Homepage help video: `content/video.json` (set `provider` to `youtube` or `local`, then update `url`, `poster`, `title`, and `caption`)
- Council images: set the `image` and `imageAlt` fields on one council entry; a branded placeholder is shown while `image` is empty.

## Verification

```bash
npm run lint
npm test
npm run build
```
