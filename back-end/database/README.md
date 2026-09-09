# MediQuick — Core API

Express + Drizzle service over the Supabase Postgres database. Owns users,
profiles, appointments, **prescriptions**, **pharmacy orders** and notifications.

Separate from `back-end/consultation/` (LiveKit teleconsultation, port 5006) and
`back-end/Gallery/` (FastAPI image service).

## Setup

```bash
cd back-end/database
npm install
```

Create `.env`:

```
DATABASE_URL=postgres://...        # Supabase connection string
CLERK_SECRET_KEY=sk_...            # required by clerkMiddleware
PORT=3000                          # optional
```

Then run the two SQL files in `src/db/`, in order, against the database
(Supabase SQL editor or psql):

1. `prescription_migration.sql` — adds name/address/phone to `pharmacies`, plus
   indexes. Idempotent.
2. `seed.sql` — 20 medicines, 4 pharmacies, and inventory for each. Idempotent.
   Required: the pharmacy screens are empty without it.
3. `link_existing_pharmacists.sql` — **only if you already have pharmacist
   accounts.** See "Pharmacists must belong to a pharmacy" below.

```bash
npm run dev
```

### Pharmacists must belong to a pharmacy

Orders are addressed to a **pharmacy**, not to a person: `pharmacy_orders` holds
a `pharmacy_id`, and `GET /pharmacy-orders` matches it against the caller's
`pharmacist_profiles.pharmacy_id`. A pharmacist whose `pharmacy_id` is NULL gets
`400 — You are not linked to a pharmacy yet`, and their queue cannot be built.

Sign-up (`front-end/app/(auth)/pharmacy.tsx`) now asks which pharmacy they work
at and stores it. Accounts created before that are still unlinked — run
`link_existing_pharmacists.sql` to attach them.

## The prescription flow

```
doctor issues          patient forwards           pharmacist dispenses
────────────────       ──────────────────         ────────────────────
POST /prescriptions -> POST /:id/send-to-pharmacy -> POST /pharmacy-orders/:id/dispense
prescriptions          pharmacy_orders             dispensing_logs
prescription_items     pharmacy_order_items        pharmacy_inventory (decremented)
status: created        status: sent_to_pharmacy    status: fulfilled
```

Every step queues a `notifications` row for the other party.

### Prescriptions — `/api/v1/prescriptions`

| Method | Path | Who | Purpose |
|---|---|---|---|
| `POST` | `/` | doctor | Issue a prescription |
| `GET` | `/doctor/mine` | doctor | Prescriptions they issued (`?status=`) |
| `GET` | `/patient/mine` | patient | Prescriptions written for them (`?status=`) |
| `GET` | `/:id` | doctor / patient / pharmacist holding an order | One prescription with items |
| `POST` | `/:id/send-to-pharmacy` | patient | Body `{ pharmacyId }` — creates the order |

`POST /` body:

```json
{
  "patientId": "<patient_profiles.id>",
  "clinicalNote": "Acute bacterial pharyngitis",
  "items": [
    { "name": "Amoxicillin 500mg", "dosage": "500mg",
      "frequency": "1-0-1", "duration": "5 days" }
  ]
}
```

Only `patientId` and each item's `name` are required.

- **`consultation_id` is NOT NULL and UNIQUE** on `prescriptions`, but doctors
  prescribe straight from a patient card. When no `consultationId` (or
  `appointmentId`) is given, the API creates a closed `appointments` +
  `consultations` pair behind the prescription. Pass `consultationId` when
  prescribing from a real consultation and it is used instead.
- **Medicine names are free text.** `resolveMedicineId` in `src/utils/medicines.js`
  matches them against the `medicines` catalogue (exact → prefix → leading word)
  and sets `medicine_id` on a hit; the typed text is always kept in
  `medicine_name_freetext`. Unmatched items still work, but carry no stock level
  and do not decrement inventory when dispensed.
- **`quantity` is optional.** `inferQuantity` reads doses/day out of "1-0-1" and
  days out of "5 days" and multiplies. Falls back to 1.

### Pharmacy orders — `/api/v1/pharmacy-orders`

| Method | Path | Who | Purpose |
|---|---|---|---|
| `GET` | `/mine` | patient | Orders they sent out |
| `GET` | `/` | pharmacist | Their pharmacy's queue (`?status=`) |
| `GET` | `/:id` | pharmacist / owning patient | Order with items; stock shown to pharmacists only |
| `PATCH` | `/:id/status` | pharmacist | `{ status, pharmacistNotes? }` |
| `POST` | `/:id/dispense` | pharmacist | Hand over medicines, draw down stock |
| `POST` | `/:id/notify` | pharmacist | `{ message }` — quick reply to the patient |

Status moves one step at a time and is enforced server-side:

```
pending -> accepted -> processing -> ready -> completed
   \_________/
        -> rejected           (returns the prescription to 'created')
```

`POST /:id/dispense` body:

```json
{ "items": [
    { "orderItemId": "...", "quantity": 10, "batchNo": "B2026-0003" },
    { "orderItemId": "...", "unavailable": true }
] }
```

Runs in one transaction: writes `dispensing_logs`, decrements
`pharmacy_inventory`, updates each item. Batches are consumed
**first-expiry-first-out**, spanning batches when one is short, unless a
`batchNo` is named. When nothing is left outstanding, the order becomes
`completed` and the prescription `fulfilled`.

### Notifications — `/api/v1/notifications`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | This user's notifications (`?unread=true`, `?limit=`) |
| `PATCH` | `/read-all` | Mark all read |
| `PATCH` | `/:id/read` | Mark one read |

`payload.kind` is one of `prescription_issued`, `pharmacy_order_received`,
`pharmacy_order_status`, `pharmacy_message`.

## Auth

Every route sits behind `userauthenticate` (`src/middlewares/authenticate.js`),
which reads the Clerk session token, maps it to a `users` row (creating one on
first request), and puts it on `req.user`. Controllers then resolve the caller's
doctor / patient / pharmacist profile from `req.user.id` — the role is never
taken from the request body.
