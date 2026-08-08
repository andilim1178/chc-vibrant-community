# Projects Database + C# API Design

**Date:** 2026-08-08
**Project:** PlaceRate — Vibrant Community Assessment
**Feature:** C# backend API and Azure SQL database to store saved projects

## Overview

Projects currently live only in the browser's `localStorage` (`PlaceRateContext.tsx`), with no server-side persistence at all. This feature adds a real database and a C# API in front of it, so projects survive across devices and browsers instead of being tied to one machine's local storage.

This spec covers **the backend only**: the database schema, the C# Azure Functions API, and its provisioning/local-dev story — verified standalone (via `curl`/Postman), without touching the React frontend. Wiring the frontend to call this API (replacing the `localStorage`-backed functions in `PlaceRateContext.tsx`) is a deliberate follow-up spec, once this backend is confirmed working.

## Why Azure Functions on Static Web Apps

The frontend is already deployed to Azure Static Web Apps (`rg-vibrantcommunity`, `australiaeast`) via GitHub Actions, static-only today (see `docs/superpowers/specs/2026-08-05-azure-static-web-app-deployment.md`). Azure Static Web Apps has first-class support for a linked "managed" Functions API, written in C#, deployed through the *same* GitHub Actions workflow already in place. This avoids standing up and paying for a second, separately-hosted backend.

## Scope

- **In scope:** SQL schema, EF Core models/migrations, Azure Functions HTTP API (CRUD for projects), local dev setup, Azure provisioning plan, standalone testing.
- **Out of scope (future specs):** Frontend integration (`PlaceRateContext.tsx` rewire), real user authentication/accounts, CI/CD wiring for the Functions project into the existing GitHub Actions workflow, normalizing answers/scores into relational tables.

## Data Model

One table, `Projects`, in a single Azure SQL Database (serverless tier, auto-pause — used for both local development and production, since no Docker/LocalDB is available on this machine and a second database isn't worth the added cost/complexity yet):

| Column | Type | Notes |
|---|---|---|
| `Id` | `uniqueidentifier` (PK) | Server-generated GUID — the client never supplies or trusts an ID it created itself. |
| `Name` | `nvarchar(200)` | **Unique constraint.** Enforces "no duplicate project names" at the database level, as a backstop to the client-side check already in `SetupForm.tsx`. |
| `Addr` | `nvarchar(500)` | |
| `Postcode` | `nvarchar(20)` | Nullable. |
| `Type` | `nvarchar(100)` | |
| `By` | `nvarchar(200)` | Nullable. |
| `ProjectDate` | `date` | |
| `AnswersJson` | `nvarchar(max)` | Serialized `Record<elementId, Record<questionIdx, value>>` — same shape as `Project.answers` today. |
| `ScoresJson` | `nvarchar(max)` | Serialized `Record<elementId, number>` — same shape as `Project.scores` today. |
| `CreatedAt` | `datetime2` | Set on insert. |
| `UpdatedAt` | `datetime2` | Set on insert and every update. |

Answers and scores stay as JSON blobs rather than normalized tables: the element/question *catalog* (`placerate-template.json`) stays entirely client-side, so there's nothing relational to join a per-project answer against yet. Revisit if cross-project reporting/analytics becomes a real need.

## API

Azure Functions, HTTP-triggered, isolated worker model, .NET 8. Base route `/api/projects`.

| Method | Route | Behavior |
|---|---|---|
| `GET` | `/api/projects` | List all projects (summary fields — not the full answers/scores blobs, to keep the list payload light). |
| `GET` | `/api/projects/{id}` | Get one project, full detail including answers/scores. |
| `POST` | `/api/projects` | Create. Body: `{ name, addr, postcode, type, by }`. Server generates `Id`, `CreatedAt`, `UpdatedAt`; `AnswersJson`/`ScoresJson` start empty. **409 Conflict** if `name` already exists (case-insensitive). |
| `PUT` | `/api/projects/{id}` | Full update — used both for metadata edits and for answer/score changes (the client sends the whole updated project shape it already holds in React state). Updates `UpdatedAt`. **404** if the ID doesn't exist. **409** if renaming to a name already used by a *different* project. |
| `DELETE` | `/api/projects/{id}` | Delete. **404** if the ID doesn't exist. |

Request/response bodies use simple DTOs (not the EF entity directly), so the API's JSON shape is decoupled from the database schema.

## Local Development

Neither .NET SDK nor Azure Functions Core Tools are installed on this machine yet — both need installing via Homebrew (`brew install dotnet-sdk`, `brew install azure-functions-core-tools@4`) before any C# code can be built or run locally. Docker and SQL Server LocalDB are both unavailable (no Docker installed; LocalDB is Windows-only), so local development points at the same Azure SQL Database as production, via a connection string in `local.settings.json` (which is gitignored, matching Functions convention — never committed).

`func start` runs the API locally against that database; `curl`/Postman exercise it before any frontend work begins.

## Provisioning

Azure resources needed (matching the existing resource group and region):

- **Azure SQL Server + Database** (`rg-vibrantcommunity`, `australiaeast`), serverless compute tier with auto-pause, to keep cost near-zero when idle.
- **Function App**, linked to the existing Static Web App as its managed API.

I'll write the exact `az` CLI commands for these and confirm the specific resources, SKU/tier, and estimated cost with you **before running anything that provisions billable infrastructure** — this is a real subscription (CHC tenant), not a sandbox.

## Error Handling

- Duplicate name → `409 Conflict` with a message the frontend can surface directly (matching the existing client-side error text style).
- Missing project on `GET`/`PUT`/`DELETE` → `404 Not Found`.
- Malformed request body → `400 Bad Request` with validation details.
- Unhandled exceptions → `500`, logged (Application Insights, since it comes free with the Function App) — no stack traces returned to the client.

## Testing

Standalone, before any frontend changes:
1. `func start` locally against the Azure SQL Database.
2. `curl`/Postman: create, list, get-one, update (including an answers/scores update), delete, and the duplicate-name conflict path.
3. Confirm the unique constraint and 409 behavior with a real duplicate-name attempt.

## File Structure

```
api/                              (NEW — sibling to src/, matches SWA's expected API folder convention)
├── PlaceRate.Api.csproj
├── host.json
├── local.settings.json           (gitignored)
├── Program.cs
├── Data/
│   ├── PlaceRateDbContext.cs
│   └── Migrations/                (EF Core migrations)
├── Models/
│   └── Project.cs                 (EF entity)
├── Dtos/
│   ├── ProjectSummaryDto.cs
│   ├── ProjectDetailDto.cs
│   └── CreateProjectRequest.cs
└── Functions/
    └── ProjectsFunctions.cs        (GET/POST/PUT/DELETE handlers)
```

## Success Criteria

1. ✅ `Projects` table exists in Azure SQL with the schema above, including the unique name constraint.
2. ✅ All five endpoints work against the real database, verified via `curl`/Postman.
3. ✅ Duplicate project names are rejected with `409`, both via direct API call and (unchanged) the existing frontend check.
4. ✅ Local dev works end-to-end once .NET SDK + Functions Core Tools are installed.
5. ✅ Provisioning commands are written and reviewed, with actual execution gated on explicit go-ahead.

## Open Questions / Notes

- Whether the `GET /api/projects` list endpoint should support pagination — not needed yet at this project's scale, revisit if the projects list grows large.
- Whether to split local dev onto a separate database from production once the team grows beyond one developer — deferred per the Local Development section above.
- CI/CD: wiring this Functions project into the existing `.github/workflows/azure-static-web-apps.yml` so it deploys automatically is intentionally left for a follow-up, once the API is confirmed working manually.
