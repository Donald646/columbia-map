# EventsCU

Link to deployed website: [EventsCU](https://www.eventscu.com/columbia)
Link to Video: [Video for EventsCU](https://www.youtube.com/watch?v=uR3CGEMzbu0)

Link to Higher Quality Video: https://youtu.be/5ZubEDRjLKE?feature=shared

**Discover campus events on an interactive map**

EventsCU is a modern campus events discovery platform that helps college students find activities, clubs, and events happening at their university through an intuitive, map-based interface. Currently supporting Columbia University and NYU, the platform combines visual event discovery with geographical context to make it easy for students to see what's happening around them.

---

## Overview

Finding campus events shouldn't be difficult. Students often miss out on activities because event information is scattered across different platforms, social media, and email lists. EventsCU solves this by centralizing all campus events in one place with a beautiful, interactive map interface.

Whether you're looking for:
- Social gatherings and parties
- Academic workshops and lectures
- Sports events and recreational activities
- Arts & culture performances
- Professional networking opportunities

EventsCU makes it easy to discover what's happening on campus, right when you need it.

---

## Features

### For Students

- **Interactive Campus Map**: View all upcoming events plotted on your campus map with custom markers
- **Smart Filtering**: Filter events by category (social, academic, sports, arts, etc.), time (today, this week, etc.), and price (free vs. paid)
- **Event Discovery**: Browse events in both map view and list view for different perspectives
- **Detailed Event Pages**: Rich event descriptions, dates, locations, hosting organization info, and registration links
- **Organization Directory**: Explore all student organizations, see verified badges, and discover their upcoming events
- **Mobile-Optimized**: Fully responsive design with touch-optimized interactions for browsing on the go

### For Organization Admins

- **Event Management Dashboard**: Create, edit, and delete events for your organization
- **Rich Text Editor**: Add formatted descriptions, links, and images to make events stand out
- **Location Search**: Easily set event locations with integrated map search
- **Team Management**: Invite other members to help manage your organization's events
- **Organization Profile**: Customize your org's profile with logo, banner, description, and social links

### For System Admins

- **Multi-School Support**: Manage multiple universities with school-specific branding and configuration
- **Organization Verification**: Review and verify official student organizations
- **System-Wide Dashboard**: Oversee all organizations, events, and users across the platform

---

## Tech Stack

EventsCU is built with modern, production-ready technologies:

**Frontend**
- **Next.js 15** - React framework with server-side rendering and app router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Shadcn/ui** - Accessible, customizable UI components

**Backend & Database**
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Google OAuth authentication with school email verification
- **Supabase Storage** - Image hosting for events and organizations
- **PostGIS** - Geospatial queries for location-based features

**Maps & Location**
- **Mapbox GL** - Interactive, customizable maps
- **React Map GL** - React wrapper for Mapbox

**Additional Tools**
- **TipTap** - Rich text editor for event descriptions
- **date-fns** - Date formatting and manipulation
- **Lucide React** - Beautiful icon library
- **Vercel Analytics** - Performance monitoring

---

## How It Works

### For Students

1. **Visit your school's page** (e.g., `/columbia`), we have built a scalable system to expand to other schools therefore the current route redirects to /columbia
2. **Explore the map** showing all upcoming events with custom markers
3. **Filter events** by your interests, schedule, and budget
4. **Click on events** to see full details, RSVP, or register
5. **Browse organizations** to discover clubs and follow their events

### For Organizations

1. **Sign in with your school email** (verified .edu domains)
2. **Create or claim your organization** on the platform
3. **Add events** with rich descriptions, images, and location details
4. **Invite team members** to help manage your organization
5. **Track engagement** through views and RSVPs

### Multi-School Architecture

EventsCU is designed to scale across universities:
- Each school has its own branded subdomain (e.g., `/columbia`, `/nyu`)
- Custom color schemes and logos per school
- School-specific map configurations (center point, zoom level)
- Email domain verification ensures students join the right school

---

## Development Process

The creation of EventsCU involved several key phases:

### 1. Planning & Architecture
- Researched existing event platforms (Luma, Eventbrite) and campus solutions
- Designed multi-school architecture to support scaling
- Planned database schema with flexibility for future features
- Chose modern tech stack for performance and developer experience

### 2. Database Design
- Created comprehensive PostgreSQL schema with Supabase
- Implemented Row Level Security (RLS) for data protection
- Set up PostGIS extension for geospatial features
- Designed role-based access control system

### 3. Core Features Implementation
- Integrated Mapbox for interactive campus maps
- Built event display with filtering and search
- Developed organization management system
- Implemented Google OAuth with school email verification

### 4. Admin Tools Development
- Created organization admin dashboard for event management
- Built team invitation and management system
- Developed rich text editor for event descriptions
- Implemented image upload functionality

### 5. UI/UX Refinement
- Designed Luma-inspired, clean interface
- Optimized for mobile with bottom drawer navigation
- Added responsive layouts for all screen sizes
- Implemented smooth animations and interactions

### 6. Testing & Deployment
- Deployed on Vercel for global performance
- Set up environment configurations
- Implemented analytics for monitoring
- Continuous improvements based on feedback

---

