# Nova Sapphire brand and product rules

Repository implementation brief. The full visual brand guide was created on 23 September 2026 and supplied separately as a Word document.

## Identity

Nova Sapphire is an alliance/community hub for server 1616. Use Nova Sapphire in titles and preserve NOVA in the supplied logo. The experience should feel welcoming, cooperative, confident, and fun.

- Keep the supplied starburst geometry and wordmark intact. Do not redraw, stretch, rotate, or retype the logo.
- Use the full-colour dark artwork for prominent brand moments, blue for digital use with sufficient contrast, and navy for light backgrounds.
- Leave space around the visible mark equal to at least the height of its N. Proposed full-logo minimum: 120 px on screen or 30 mm in print; inspect at actual size.
- A small icon must remain legible at 16 and 32 px. The current simple star favicon is a temporary treatment.

## Working palette

These are proposed production values rather than certified samples from the logo gradients.

| Colour | HEX | Use |
| --- | --- | --- |
| Midnight | #0B1423 | Main backgrounds |
| Deep sapphire | #082B50 | Secondary surfaces |
| Electric blue | #168CF0 | Brand accents |
| Cyan | #27DDE8 | Links and selected highlights on dark |
| Mint | #86F0D0 | Supporting light accents |
| Lime | #B5DD4A | Limited emphasis |
| Ice white | #F4F8FC | Reading text on dark |

Let navy dominate. Keep text readable on calm surfaces. Use glow sparingly. Purple, gold, and red may appear in contextual game art; they are not the default interface palette.

## Type and imagery

Use bold condensed headlines sparingly and readable sans serif text for guides and controls. Proposed families: Barlow Condensed, Noto Sans, and Noto Sans KR. Preserve Vietnamese diacritics and Korean glyphs; do not force condensed, italic, or spaced lettering onto those scripts.

Use dramatic blue lighting, crystals, celestial light, and restrained tactical frames for campaign artwork. Put long reading content on quiet backgrounds. Keep artwork and editable text separate. Add multilingual wording with real text tools; provide accessible text alongside informational images.

## Required languages

Always include English, French, Spanish, Portuguese, Vietnamese, Korean, and German in informational examples and created images. Never omit a language because an older reference omitted it. Simplify copy or enlarge the format if necessary; never make translations unreadable to fit them in.

**Never use flags to represent languages anywhere.** Use language names or text codes.

| Code | Language label |
| --- | --- |
| EN | English |
| FR | Français |
| ES | Español |
| PT | Português |
| VI | Tiếng Việt |
| KO | 한국어 |
| DE | Deutsch |

The website shows one selected language at a time and offers all seven. English is the proposed editorial source. Portuguese, French, and Spanish regional preferences remain open. Review first-pass translations with fluent members before launch.

Translate the title, required action, deadline, warnings, image descriptions, and supporting information. Preserve NOVA, player names, URLs, and numbers. Check game terminology against the corresponding in-game language. Keep all editions on the same revision; mark any fallback clearly.

## Voice

Use direct, supportive language. State the action, reason, and deadline. Celebrate contribution and teamwork without blame or pressure. Use exact dates and a named time zone. Relative announcements need a publication timestamp and an expiry plan.

## Accepted product decisions

- New private repository: raidarqn-lab/nova-sapphire.
- Eventual address: a subdomain of join1616.com, still to be chosen. No ChatGPT hosting dependency.
- Captures means captured territories and objectives.
- Core areas: captures, upcoming events, standouts, notices, tips, weekly VS scores, train schedules, and weekly donation scores.
- Individual, single-use invitations with username/password login and recovery codes. No required email address.
- The first public preview uses labelled demonstration data. Do not present sample people, scores, or schedules as real alliance records.

## Next content and launch phase

1. Add approved real content and decide what is public versus member-only. Private records must be in the database behind authorized endpoints, not bundled in public JavaScript.
2. Add officer editing for events, captures, standouts, notes, train departures, and weekly scores, with translation and publication status.
3. Add member suspension and role-management UI, verified officer-assisted recovery, and an audit trail. Existing database roles and active flags are a foundation, not a finished administration interface.
4. Choose Node.js hosting with durable SQLite storage, or explicitly migrate the database to the selected host. Configure HTTPS, the exact production origin, backups, and monitoring.
5. Privately bootstrap the first admin, save recovery codes, and test invitations and persistence across redeploys.
6. Connect the selected join1616.com subdomain using the chosen host's DNS instructions.

Hosting, DNS, game-data imports, and messages to members are not part of the initial repository setup.
