Got it. Here’s a tight, LLM-ready product overview you can drop into your knowledge base. It’s written to be both human-readable and machine-parseable, with a schema the model can anchor on.

# Product Overview — “Columbia Events Map”

## 1) One-liner

Interactive, map-first directory of Columbia University events that aggregates official calendars into a geocoded, filterable experience—“Google Maps for campus events.”

## 2) Primary users

* **Undergrads/Grads:** discover what’s happening near them, right now.
* **Prospective attendees on campus (guests/alumni):** quick, no-login discovery.
* **Event organizers:** increase reach; ensure accurate location and metadata.

## 3) Core jobs-to-be-done

* **JTBD-1:** “Show me events near my current location/building within a time window.”
* **JTBD-2:** “Let me filter by category, school, cost, and tags.”
* **JTBD-3:** “Open the event details and RSVP or add to my calendar in 1 tap.”
* **JTBD-4:** “Notify me when new events match my saved filters (phase 2).”

## 4) Value proposition

* Single source of truth across fragmented calendars.
* Spatial context: clusters + walking distance make choice easy.
* Fast: cached feed + map bounding-box queries.

## 5) Key features (MVP)

* **Map-first UI:** clustered pins; pin → event card → details.
* **Filters:** date/time range, category, school, free/paid, keywords.
* **List view:** accessible list synchronized with current map viewport.
* **Calendar actions:** Add to Apple/Google Calendar; deep-link to source RSVP.
* **Auto-ingest:** scheduled fetch from official calendars; geocoding + de-dupe.
* **No required login:** optional favorites in phase 2 (UNI or email auth).

## 6) Non-goals (MVP)

* Ticketing/payments, room booking, moderator tooling, or private/auth-only events.

## 7) Data sources (public/official)

* **University Events Calendar (Bedework)** – JSON export.
* **CampusGroups instances (school/org calendars)** – ICS feeds.
* **Org sites/LionLink** – public event pages (scrape or request ICS when available).

> Note: Respect source TOS, rate limits; attribute original source in event details.

## 8) Data pipeline (ETL)

1. **Fetch:** Pull JSON/ICS from sources on cron (e.g., every 30–60 min).
2. **Normalize:** Convert to unified event schema (see below).
3. **Geocode:** Map venue names/addresses → lat/lon (cache results).
4. **De-dup:** Merge duplicates (fuzzy title + time ±2h + venue proximity ≤100m).
5. **Store:** Upsert into `events`, `venues` with PostGIS points.
6. **Index:** GIST on `geom`, btree on `starts_at`, tsvector on text fields.

## 9) System architecture (suggested)

* **Frontend:** Next.js + Mapbox GL (or Leaflet) + shadcn/ui.
* **Backend:** Next.js API routes (read) + serverless jobs (ETL).
* **DB:** Supabase Postgres + PostGIS extension.
* **Search:** SQL full-text + geo queries; optional client clustering.
* **Caching:** SWR + CDN cache for GET endpoints; stale-while-revalidate.

## 10) Unified data model (canonical schema)

```json
{
  "$schema": "https://example.com/columbia-events.schema.json",
  "entities": {
    "Venue": {
      "id": "uuid",
      "name": "string",
      "address": "string|null",
      "campus": "string|null",          // e.g., Morningside, CUIMC, Manhattanville
      "longitude": "number",            // WGS84
      "latitude": "number",             // WGS84
      "source": "string"                // bedework|campusgroups|lionlink|other
    },
    "Event": {
      "id": "uuid",
      "source": "string",
      "source_id": "string",
      "title": "string",
      "description": "string|null",
      "starts_at": "ISO-8601",
      "ends_at": "ISO-8601|null",
      "timezone": "string",             // e.g., America/New_York
      "category": "string|null",        // social|academic|career|arts|sports|service|other
      "tags": ["string"],
      "org": "string|null",             // hosting dept/club
      "url": "string|null",             // RSVP/detail page
      "is_free": "boolean|null",
      "venue_id": "uuid|null",
      "longitude": "number|null",
      "latitude": "number|null"
    }
  }
}
```

## 11) Public API (for app + LLM tools)

### REST

* `GET /api/events?bbox=WEST,SOUTH,EAST,NORTH&start=ISO&end=ISO&category=&school=&q=&limit=500`

  * Returns events intersecting map bbox & time window; sorted by start time.
* `GET /api/events/{id}`

  * Full event details.
* `GET /api/venues?bbox=…&q=…`

  * Venue lookup for search/autocomplete.

### Example `GET /api/events` response (abridged)

```json
{
  "events": [
    {
      "id": "5f4b…",
      "title": "SEAS Career Fair Prep",
      "starts_at": "2025-10-12T15:00:00-04:00",
      "ends_at": "2025-10-12T16:00:00-04:00",
      "longitude": -73.9626,
      "latitude": 40.8075,
      "venue_id": "1b2c…",
      "org": "SEAS",
      "category": "career",
      "is_free": true,
      "url": "https://…"
    }
  ]
}
```

## 12) LLM function/tooling spec (for agent integration)

```json
{
  "functions": [
    {
      "name": "search_events",
      "description": "Find events within a time window and/or map area.",
      "parameters": {
        "type": "object",
        "properties": {
          "bbox": { "type": "array", "items": { "type": "number" }, "minItems": 4, "maxItems": 4 },
          "start": { "type": "string", "description": "ISO-8601 start time" },
          "end": { "type": "string", "description": "ISO-8601 end time" },
          "category": { "type": "string" },
          "school": { "type": "string" },
          "q": { "type": "string", "description": "keyword search" },
          "limit": { "type": "number", "default": 200 }
        },
        "required": ["start", "end"]
      }
    },
    {
      "name": "get_event",
      "description": "Fetch full details for a specific event.",
      "parameters": {
        "type": "object",
        "properties": { "id": { "type": "string" } },
        "required": ["id"]
      }
    },
    {
      "name": "nearby_events",
      "description": "Find events around a lat/lon within a radius (meters).",
      "parameters": {
        "type": "object",
        "properties": {
          "lat": { "type": "number" },
          "lon": { "type": "number" },
          "radius_m": { "type": "number", "default": 500 },
          "start": { "type": "string" },
          "end": { "type": "string" }
        },
        "required": ["lat", "lon", "start", "end"]
      }
    }
  ]
}
```

## 13) LLM content policy (internal)

* **Do not fabricate** event times/locations; if missing, say “unknown” and link to the source URL.
* **Explain uncertainty** (e.g., “Location unverified—click source”).
* **Respect campus branding & TOS**: no logo claims; attribute sources.

## 14) Prompts & behaviors (LLM guidance)

**System prompt (summarized intent):**

> You are the campus events guide for Columbia University. Prioritize accuracy and recency. When users ask for events, filter by time window and location. Always include title, start time, venue, distance (if user location known), and a link to the source. Avoid speculation.

**User intent examples:**

* “What’s happening near Butler Library tonight 6–10pm?”
* “Show free arts events on Morningside this weekend.”
* “What’s starting in the next 30 minutes within 300m of Lerner?”

**Response template (compact):**

* **Event title** — *Start–End (local time)*

  * Venue (distance if available)
  * Category/tags, Free/paid
  * Action: [Add to Calendar] [Open RSVP]

## 15) Metrics (MVP)

* **Discovery:** unique users, map loads, filter usage.
* **Engagement:** event card opens per session, calendar adds, RSVP clicks.
* **Coverage:** % of official feeds ingested, geocode success rate, de-dup rate.
* **Freshness:** median time to ingest from source update.

## 16) Privacy & compliance

* No PII required for browsing.
* If enabling favorites/alerts: store minimal profile (email/UNI), consent for notifications, opt-out controls.
* Log IP/user-agent only for abuse prevention and analytics.

## 17) Risks & mitigations

* **Inconsistent locations** → venue dictionary + manual overrides.
* **Duplicate events** → fuzzy de-dup + source precedence.
* **Feed outages** → graceful degradation; show last-updated timestamp.

## 18) Roadmap (high level)

* **M0 (2–3 wks):** ETL for 1–2 feeds, base schema, map view, bbox endpoint.
* **M1:** Filters, list view, calendar add, analytics.
* **M2:** Favorites + alerts, “near me,” accessibility polish.
* **M3:** Organizer portal (submit/edit), moderation queue.

## 19) Glossary

* **BBOX:** West, South, East, North bounds for current map viewport.
* **De-dup:** Merging near-identical events from different feeds.
* **Geocode:** Converting a building/address to lat/lon.
* **PostGIS:** Spatial extension for Postgres enabling geo queries.

---

# EXPANDED VISION & BUILD PLAN

## Updated Vision

Columbia's events and clubs are scattered across a dozen sites, Instagram pages, and email lists—so students miss opportunities and active clubs struggle to reach people. We're building a single platform that:

1. **Aggregates** every event + club into one feed
2. **Personalizes** content to each user
3. **Enables** one-tap RSVP, chat, and calendar sync
4. **Empowers** clubs with event creation, member verification, RSVP management, and community messaging

---

## Phase 0: UI Foundation ✅ (COMPLETED)

### What We Built
- Map-first UI with Mapbox GL (29° rotation for vertical alignment)
- Left sidebar with events list (Lu.ma-style cards)
- Location search (Mapbox Search Box API)
- Filter modal (Yelp-style with categories, time, price)
- Mobile-responsive bottom sheet with snap points
- User geolocation marker
- Event cards with images, organizer, time, location
- Recenter button (appears when off-campus)
- Clean, modern UI with shadcn components

### Tech Stack Confirmed
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **UI:** shadcn/ui + Tailwind CSS v4
- **Map:** Mapbox GL JS + react-map-gl
- **State:** React hooks (will add Zustand/context later)

---

## Phase 1: Backend Foundation (Next Steps)

### 1.1 Database Setup

**Supabase Postgres + PostGIS**

**Tables:**
```sql
-- Users
users (
  id uuid PRIMARY KEY,
  uni text UNIQUE, -- Columbia UNI
  email text UNIQUE,
  name text,
  avatar_url text,
  preferences jsonb, -- saved filters, notifications
  created_at timestamptz
)

-- Clubs
clubs (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  logo_url text,
  category text, -- social, academic, sports, arts, service, etc.
  school text, -- CC, SEAS, Barnard, GS, etc.
  instagram_url text,
  website_url text,
  member_count int DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz
)

-- Club Members
club_members (
  club_id uuid REFERENCES clubs,
  user_id uuid REFERENCES users,
  role text, -- admin, moderator, member
  verified boolean DEFAULT false,
  joined_at timestamptz,
  PRIMARY KEY (club_id, user_id)
)

-- Venues (existing)
venues (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  address text,
  campus text,
  geom geography(POINT, 4326), -- PostGIS
  created_at timestamptz
)

-- Events (expanded)
events (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  timezone text DEFAULT 'America/New_York',
  
  -- Location
  venue_id uuid REFERENCES venues,
  geom geography(POINT, 4326),
  
  -- Metadata
  category text,
  tags text[],
  is_free boolean,
  capacity int,
  
  -- Organizer
  club_id uuid REFERENCES clubs,
  organizer_name text,
  
  -- Source
  source text, -- bedework, campusgroups, user_created
  source_id text,
  source_url text,
  
  -- Media
  image_url text,
  
  -- Engagement
  rsvp_count int DEFAULT 0,
  view_count int DEFAULT 0,
  
  created_at timestamptz,
  updated_at timestamptz,
  
  -- Indexes
  INDEX idx_events_geom USING GIST (geom),
  INDEX idx_events_time (starts_at),
  INDEX idx_events_category (category),
  INDEX idx_events_club (club_id)
)

-- RSVPs
rsvps (
  event_id uuid REFERENCES events,
  user_id uuid REFERENCES users,
  status text, -- going, interested, not_going
  created_at timestamptz,
  PRIMARY KEY (event_id, user_id)
)

-- Event Chat Messages
event_messages (
  id uuid PRIMARY KEY,
  event_id uuid REFERENCES events,
  user_id uuid REFERENCES users,
  message text NOT NULL,
  created_at timestamptz
)

-- Club Chat Messages
club_messages (
  id uuid PRIMARY KEY,
  club_id uuid REFERENCES clubs,
  user_id uuid REFERENCES users,
  message text NOT NULL,
  created_at timestamptz
)
```

### 1.2 Authentication

**Supabase Auth with UNI verification**
- Sign in with email
- Optional: Columbia UNI verification (email @columbia.edu)
- OAuth: Google (columbia.edu domain)
- Session management via Supabase

### 1.3 API Routes (Next.js)

**Public (no auth):**
- `GET /api/events` - List events (bbox, filters)
- `GET /api/events/[id]` - Event details
- `GET /api/clubs` - List clubs
- `GET /api/clubs/[slug]` - Club profile

**Authenticated:**
- `POST /api/events/[id]/rsvp` - RSVP to event
- `GET /api/me/events` - My RSVPs
- `POST /api/clubs/[id]/join` - Join club
- `POST /api/events` - Create event (club admins)

---

## Phase 2: Core Features

### 2.1 Event Details & Actions

**Event Detail Page/Modal:**
- Full description
- Cover image
- Time, location, organizer
- RSVP button (going/interested)
- RSVP count + avatar stack
- "Add to Calendar" (.ics download)
- External RSVP link
- Chat/comments section
- Share button

**Implementation:**
- Expand event-detail-modal component
- Add RSVP mutations
- Generate .ics files
- Real-time RSVP count

### 2.2 Club Profiles

**Club Page (`/clubs/[slug]`):**
- Cover photo + logo
- Description
- Upcoming events
- Member count
- Join/Leave button
- Instagram feed embed
- Message board
- Admin controls (if admin)

**Implementation:**
- New route: `app/clubs/[slug]/page.tsx`
- Club data fetching
- Member management UI

### 2.3 Personalization Feed

**"For You" Tab:**
- Events from clubs you follow
- Events matching saved preferences
- Events near saved locations
- Friends' RSVPs
- Popular events trending

**Implementation:**
- Recommendation algorithm (simple scoring)
- Saved filters in user preferences
- Activity feed component

### 2.4 RSVP & Calendar

**Features:**
- One-tap RSVP (going/interested)
- See who's going (avatar stacks)
- Add to Apple Calendar
- Add to Google Calendar
- iCal download
- Email reminders (optional)

**Implementation:**
- RSVP mutations (Supabase)
- .ics file generation
- Calendar deep links
- Email service (Resend/SendGrid)

---

## Phase 3: Social Features

### 3.1 Event Chat

**Real-time chat per event:**
- Pre-event questions/coordination
- Live updates during event
- Post-event discussion
- Moderated by organizers

**Tech:** Supabase Realtime

### 3.2 Club Messaging

**Club-specific channels:**
- Announcements (admin-only)
- General discussion
- DMs between members
- Push notifications

**Tech:** Supabase Realtime + Push API

### 3.3 Social Graph

**Follow system:**
- Follow clubs
- Follow friends
- See friends' RSVPs
- "Who else is going?"

---

## Phase 4: Club Management Tools

### 4.1 Club Admin Dashboard

**For club leaders:**
- Create/edit events
- Upload event images
- Manage members (approve/remove)
- View analytics (RSVPs, views, engagement)
- Send announcements
- Export member list

**Route:** `/clubs/[slug]/admin`

### 4.2 Member Verification

**UNI-based verification:**
- Email verification (@columbia.edu)
- Club admins approve join requests
- Verified badge on profiles
- Prevent fake accounts

### 4.3 Event Creation Form

**Rich event editor:**
- Title, description (rich text)
- Date/time picker
- Location search (our component!)
- Category selection
- Image upload (Supabase Storage)
- Capacity limit
- Free/paid toggle
- External RSVP link
- Publish draft/live

---

## Phase 5: Discovery & Engagement

### 5.1 Smart Notifications

**Push + Email:**
- New events from followed clubs
- Event starting soon (1 hour before)
- Friend RSVPed to event near you
- Club announcements
- Event updates/cancellations

**Tech:** Web Push API + email service

### 5.2 Search Improvements

**Enhanced search:**
- Full-text search (Postgres tsvector)
- Search events, clubs, venues
- Recent searches
- Trending searches
- Voice search (future)

### 5.3 Analytics Dashboard

**For admins:**
- Event views/RSVPs over time
- Popular categories
- Peak times
- Top clubs
- User retention metrics

---

## Technical Implementation Details

### Data Ingestion (ETL)

**Scheduled jobs (Vercel Cron or Supabase Functions):**

```typescript
// cron/ingest-bedework.ts
export async function ingestBedework() {
  // Fetch from Columbia Bedework calendar
  const events = await fetchBedeworkJSON()
  
  // Geocode venues
  const geocoded = await geocodeVenues(events)
  
  // De-duplicate
  const deduped = await deduplicateEvents(geocoded)
  
  // Upsert to database
  await supabase.from('events').upsert(deduped)
}
```

**Sources:**
1. Bedework (official Columbia calendar)
2. CampusGroups ICS feeds
3. Instagram posts (scrape with hashtags)
4. User-created events

### Real-time Features

**Supabase Realtime subscriptions:**
```typescript
// Subscribe to event RSVPs
supabase
  .channel(`event:${eventId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rsvps' }, 
    (payload) => updateRSVPCount()
  )
  .subscribe()
```

### Image Handling

**Supabase Storage:**
- Event cover images
- Club logos
- User avatars
- Auto-resize/optimize
- CDN delivery

### Calendar Integration

**Generate .ics files:**
```typescript
function generateICS(event) {
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${event.id}@columbiacentral.app
DTSTAMP:${formatDate(event.created_at)}
DTSTART:${formatDate(event.starts_at)}
DTEND:${formatDate(event.ends_at)}
SUMMARY:${event.title}
LOCATION:${event.venue_name}
DESCRIPTION:${event.description}
URL:${event.source_url}
END:VEVENT
END:VCALENDAR`
}
```

---

## Build Phases Timeline

### ✅ Phase 0 (Week 1) - DONE
- Map UI
- Event cards
- Filters
- Location search
- Mobile responsive

### 📅 Phase 1 (Week 2-3)
- Supabase setup
- Database schema
- Auth implementation
- Basic API routes
- Event detail page

### 📅 Phase 2 (Week 4-5)
- RSVP functionality
- Calendar export
- Club profiles
- User profiles
- Personalization

### 📅 Phase 3 (Week 6-7)
- Real-time chat
- Notifications
- Social features
- Follow system

### 📅 Phase 4 (Week 8-9)
- Club admin tools
- Event creation
- Member management
- Analytics

### 📅 Phase 5 (Week 10+)
- ETL pipelines
- Data ingestion
- Search improvements
- Polish & scale

---

## Technical Decisions Log

### Why Mapbox over Google Maps?
- Native clustering for event pins
- Better performance with WebGL
- Custom styling (Columbia blue theme)
- Cheaper at scale ($5/50k loads vs $7/1k)

### Why Supabase over Firebase?
- Postgres > NoSQL for relational data (events → venues → clubs)
- PostGIS for spatial queries
- Better SQL query capabilities
- Open source, self-hostable

### Why Next.js over pure React?
- SSR for SEO (event pages discoverable)
- API routes for backend logic
- File-based routing
- Edge functions for ETL

### Why Lu.ma-style cards?
- Clean, scannable
- Horizontal layout fits more info
- Image-first for engagement
- Industry-proven pattern

---

## Next Immediate Steps

1. **Set up Supabase project**
   - Create database
   - Run migrations for schema
   - Configure auth

2. **Build event detail page**
   - Dynamic route `/events/[id]`
   - Fetch from Supabase
   - Add RSVP button

3. **Implement RSVP system**
   - Auth required
   - Optimistic updates
   - Real-time count

4. **Add calendar export**
   - Generate .ics files
   - Deep links to Google/Apple Calendar

5. **Create club pages**
   - `/clubs/[slug]` route
   - Club event feed
   - Join button

We'll build incrementally - each phase ships a usable feature set.
