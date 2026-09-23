# Nova Sapphire


An independent alliance community hub for server 1616, built for the Nova Sapphire brand. Owned by **raidarqn-lab**, intended for a future subdomain of **join1616.com**. No ChatGPT hosting dependency.


## First version


- Home board with territory captures, upcoming events, and alliance notices.
- Weekly VS and donation leaderboards with a category switch.
- Alliance standouts, a train timetable, and searchable/filterable guides.
- Seven complete interface languages: English, French, Spanish, Portuguese, Vietnamese, Korean, and German. Never use flags for languages.
- Real invitation-only accounts with usernames, passwords, and recovery codes. No email field or email provider.
- A private member room and officer/admin invitation creation.
- Responsive layouts, native accessible dialogs, keyboard focus styles, and reduced-motion support.


**The board combines supplied schedules with labelled examples.** The conductor roster and NvSP season operations come from the supplied documents. Scores, standouts and general tips remain sample content. Daily and weekly schedules advance with the Pacific reset.


## Run locally


Requires Node.js 24 or newer. There are no runtime npm dependencies.


```sh
npm start
```


Open http://localhost:4173. Run `npm test` for integration tests and `npm run check` for syntax checks. Configuration comes from environment variables. If using a `.env` file, launch with `node --env-file=.env server/index.js`; `npm start` does not load it automatically.


Create the first account invitation in another terminal, using the same DB_PATH and APP_ORIGIN as the server:


```sh
npm run invite:admin
```


The bootstrap invitation expires in one hour and grants the admin role. Save the recovery codes when registering. Once an active admin exists, the bootstrap command refuses to create another. Re-running it before registration invalidates older bootstrap links. Keep the invitation private; do not commit it to GitHub.


Admins and officers can create 48-hour single-use **member** invitations from the member room. Roles are never accepted from public registration input. Invitations grant access to whoever redeems the link first; verify the intended player in game before sending it.


## Hosting


This application needs a **Node.js server and durable storage**. GitHub stores the source; GitHub Pages alone cannot run its authentication. A Dockerfile is provided for a host with a persistent volume mounted at `/app/data`.


Set:


- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT` to the host's expected port
- `APP_ORIGIN=https://<chosen-subdomain>.join1616.com` (exact origin, no trailing slash)
- `DB_PATH=/app/data/nova.sqlite`
- `TRUST_PROXY=1` only if the host's trusted reverse proxy overwrites `X-Forwarded-For`; otherwise leave unset.


Use a single application instance with this SQLite setup. Back up the database using SQLite's online backup mechanism or a consistent volume snapshot; do not copy only the live main database while WAL writes are active. Place the service behind HTTPS, verify persistence across deploys, then add the subdomain DNS record supplied by the chosen host. Hosting and DNS have not been configured by this initial repository creation.


## Files and content


- `public/app.js`: views, navigation, and account forms.
- `public/style.css`: responsive visual system.
- `public/i18n.js`: interface translations for all seven languages.
- `public/content.js`: localized demonstration content and sample records.
- `server/`: static serving, SQLite persistence, and account endpoints.
- `docs/`: brand guide, accepted decisions, and rollout notes.


Public assets are downloadable without signing in. Never put confidential scores, strategies, member records, or real alliance schedules in `public/` unless deliberately public. The next content phase should store member-only records in the database, retrieve them through authorized endpoints, and add an officer editing interface. This initial version does not yet provide content editing, uploads, score imports, or automatic game integrations.


Translations are first-pass product copy. Regional choices for Portuguese, French, and Spanish remain to be confirmed; fluent member review is recommended before launch. Every new informational image/example must include all seven languages. The unchanged NOVA logo is a brand asset, not a multilingual announcement.


## Authentication details


Passwords use salted scrypt (`N=32768, r=8, p=1`). Sessions use random server-side tokens with hashed storage, HttpOnly/SameSite cookies, seven-day expiry, and Secure cookies in production. Mutations require the exact configured Origin; signed-in mutations also require the session's CSRF token. Invitation tokens and recovery codes are stored as hashes. Recovery rotates all codes and invalidates all old sessions. IP/account rate limits are persisted in SQLite. Users marked inactive cannot use existing sessions.


The current recovery path requires a saved recovery code. Officer-assisted recovery, member suspension/role administration UI, audit logs, and production monitoring are rollout work, not implemented features. The server deliberately never logs passwords, invitations, cookies, or recovery codes.


## Brand


Navy `#0B1423`, sapphire `#082B50`, electric blue `#168CF0`, cyan `#27DDE8`, and lime `#B5DD4A`. Uses the supplied NOVA PNG artwork. Barlow Condensed and Noto Sans are loaded from Google Fonts with system fallbacks; self-host fonts if external font requests are undesirable. A simple star favicon is a temporary small-size treatment, not a replacement for the full emblem.



## Daily season operations

The imported NvSP plan is in `public/season-plan.js` (Flinty Ermine revision 7, plan `73d7705eef74e378`, supplied planbook pages 13–14 and 42). It includes all remaining NvSP captures and releases from Day 17, plus related partner pickups. Day 17 is anchored to server-calendar 2026-09-23, as confirmed by the owner.

`public/train-clock.js` defines server midnight as **19:00 America/Los_Angeles**, year-round. Daylight saving changes follow that time zone. Browser-local dates and times use Intl; no location permission is needed.

The default Today view and upcoming capture list roll forward automatically at reset, including while the page stays open. Day buttons allow browsing the plan. Planned actions never become confirmed captures merely because their date passes. The PDF is a snapshot, not a game API: a revised plan requires updating the data. Previous-evening releases are assigned to the day their countdown actually begins. All additions support EN, FR, ES, PT, VI, KO and DE.

## Weekly rollover and conductor history

Weekly periods begin Sunday 19:00 Pacific (Monday 00:00 server). Week labels and weekly sections refresh at that boundary while the page is open. The supplied roster and sample rankings/standouts belong only to the server week beginning 2026-09-21; later weeks show an awaiting-update state until new content is added.

Conductor history is durable versioned data in `conductorWeeks`, keyed by the Monday server date (for example `2026-09-21`). Add each new roster under a new key; do not overwrite previous weeks. Previous/next/current-week controls browse those records. No roster is invented for a missing week. The initial saved history is 21–27 September 2026; officer roster editing is not yet implemented.
