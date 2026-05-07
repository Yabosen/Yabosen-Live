# AGENTS.md

Canonical guide for AI coding agents working in this repo. `CLAUDE.md` points here.

## What this is

A personal "live status" widget. Three components, one shared backing store (Upstash Redis):

1. **`app/`** — Next.js (App Router) site at `yabosen.live`. Hosts the public `/` page that displays current status, plus the API routes under `app/api/*`. Uses `@upstash/redis` for state.
2. **`YabosenStatus/`** — MAUI app, multi-targets `net9.0-android` and `net9.0-windows10.0.19041.0`. The Windows target is the "PC app". The Android target of this project is consumed as a class library by `YabosenStatus.Android/`.
3. **`YabosenStatus.Android/`** — MAUI Android entry-point project. References `YabosenStatus/` and provides the Android-specific `MainPage`, foreground service, and boot receiver.

There's also `Better-Anime/` (an unrelated Electron side-project) and `YabosenStatus.Shared/` (currently empty, kept for the .sln). Ignore both unless asked.

## How status is determined (the only architectural rule worth memorising)

Two heartbeat keys in Redis: `yabosen:heartbeat:pc` and `yabosen:heartbeat:mobile`. Each is a millisecond timestamp. Both apps POST `/api/heartbeat` with `{source:"pc"|"mobile"}` every 60 s while alive.

[`app/api/status/route.ts`](app/api/status/route.ts) `GET` resolves the *displayed* status:

| PC heartbeat | Mobile heartbeat | Shown status |
|---|---|---|
| fresh (<3 min) | any | stored status (online/dnd/streaming/etc.) |
| stale | fresh | **`idle`** ← override |
| stale | stale | `offline` (if `updatedAt` also stale) or stored status (if recent manual update) |

The "stored status" is whatever `POST /api/status` last wrote — a separate document at key `yabosen:status`. `customMessage`, `activityType`, etc. live there.

Staleness threshold is **3 minutes** ([`STALENESS_THRESHOLD_MS`](app/api/status/route.ts)). Heartbeat interval is 60 s, giving ~3 attempts before flipping. Don't tighten this without also lowering the heartbeat interval — Android Doze can delay one beat by a minute or two.

## File map

```
app/api/status/route.ts        — GET (public) + POST (auth'd) for status doc
app/api/heartbeat/route.ts     — POST (auth'd) — both PC and mobile call this
YabosenStatus/Services/StatusService.cs       — shared HTTP client for /api/status
YabosenStatus/Services/HeartbeatService.cs    — shared heartbeat loop (used by Windows)
YabosenStatus/MainPage.xaml.cs                — Windows MainPage (instantiates HeartbeatService)
YabosenStatus.Android/MainPage.xaml.cs        — Android MainPage (starts foreground service)
YabosenStatus.Android/Services/StatusForegroundService.cs  — FGS: heartbeat loop + auto-sleep state machine
YabosenStatus.Android/Services/AutoSleepReceiver.cs        — Handles "Still awake?" notification action buttons
YabosenStatus.Android/Services/BootReceiver.cs             — restarts FGS after reboot/update
```

## Build commands

The user is on Windows + PowerShell. Use absolute paths.

**Android APK (Release, signed with debug key, sideload-ready):**
```powershell
dotnet publish YabosenStatus.Android\YabosenStatus.Android.csproj -c Release -f net9.0-android -o YabosenStatus.Android\bin\Publish
```
Output: `YabosenStatus.Android\bin\Publish\com.yabosen.status.android-Signed.apk`

**Windows exe (unpackaged — `WindowsPackageType=None` is set in csproj):**
```powershell
dotnet publish YabosenStatus\YabosenStatus.csproj -c Release -f net9.0-windows10.0.19041.0 -r win-x64 --self-contained false -o YabosenStatus\bin\Publish-Windows
```
Output: `YabosenStatus\bin\Publish-Windows\YabosenStatus.exe`

**Web (Next.js):**
```powershell
npm run dev    # local
npm run build  # prod
```
Deployed via Vercel; env vars `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `STATUS_API_KEY` are required server-side.

Builds are slow (3–10 min for Android, 1–3 min for Windows). Run them with `run_in_background: true` and wait for the completion notification rather than polling.

## Authentication

Both heartbeat and status writes use `Authorization: Bearer <STATUS_API_KEY>`. The MAUI apps store the same value as the user's "password" via `StatusService.SetPasswordAsync`, which writes to **both** `SecureStorage` and `Preferences`. The Android foreground service reads from `Preferences` only — `SecureStorage` requires the MAUI main thread, which isn't reliably available when Android restarts a Sticky service on its own. **If you change password storage, keep the dual write.** Otherwise the FGS will silently fail to authenticate.

## Android gotchas (have bitten us)

- **POST_NOTIFICATIONS is runtime, Android 13+.** Without it the foreground notification is silently suppressed and the user thinks the service is dead. `EnsureNotificationPermissionAsync` in `MainPage.xaml.cs` handles it.
- **Battery optimization kills FGSes on most OEMs.** `PromptDisableBatteryOptimizationAsync` asks the user to whitelist on every launch where they're not whitelisted yet.
- **Foreground service notification needs the right `ForegroundServiceType`.** Currently `TypeDataSync` paired with the `FOREGROUND_SERVICE_DATA_SYNC` permission. Don't change without updating the manifest.
- **Wake lock is held for the lifetime of the service.** Without it, `Task.Delay(60_000)` skips during Doze. Held as `WakeLockFlags.Partial`; CPU only, not screen.
- **Sticky restart runs without the activity.** That's why password loading must be MAUI-main-thread-free. Anything new the FGS depends on must follow the same rule.
- **`BootReceiver` restarts the FGS** after `BOOT_COMPLETED` and `MY_PACKAGE_REPLACED`. Permission is in the manifest. Don't remove without replacement.
- **Auto-sleep lives inside the FGS, not a separate service.** `CheckAutoSleepAsync` runs every heartbeat tick. State (armed-date, armed-at-ms, response) lives in `Preferences` so it survives Sticky restarts. `AutoSleepReceiver` only writes the response string; the FGS reads it on the next tick. Toggle from `MainPage` writes `auto_sleep_enabled` directly to `Preferences` — there is no `AutoSleepService` class anymore.

## Windows gotchas

- The Windows MAUI app is **unpackaged** (`WindowsPackageType=None`) so the `.exe` runs standalone. Don't switch to MSIX without coordinating cert/signing.
- `HeartbeatService` is started in `MainPage.InitializeAsync` and disposed in `Unloaded`. If you add a tray-icon "minimize to tray" feature, make sure `Unloaded` is *not* triggered when the window is just hidden, otherwise heartbeats stop and the public site flips to idle.
- `App.xaml.cs` constructs `MainPage` directly with `new MainPage()` — not via DI. Registering things in `MauiProgram.cs` doesn't help the Windows path.

## Don'ts

- Don't add an `unstable_cache` or any caching wrapper around `GET /api/status`. The `dynamic = 'force-dynamic'` export is intentional — staleness logic must run per request.
- Don't `git push` or create commits unless the user explicitly asks. Same for force-pushes.
- Don't touch `Better-Anime/` for Yabosen Status work; it's a separate project.
- Don't trust the `obj/`, `bin/`, and `build_*.log` files committed in git status — they're generated artefacts. The user is aware they're noisy.
