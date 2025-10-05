# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a metrics dashboard application for Series, providing an interactive data room interface for viewing and editing business metrics. The application uses a React/Vite frontend with an Express/MongoDB backend, deployed to Google Cloud Run.

## Architecture

### Frontend (Vite + React + TypeScript)
- **Entry point**: `src/main.tsx` renders `AuthWrapper` component
- **Authentication**: Password-protected access with two levels:
  - View-only: `DistributionWinsTheDataRace` OR `ConsumerSocial@2025`
  - Admin/Edit: `BigPod@2025`
  - Auth state persisted in localStorage for 24 hours
- **Main App**: `src/App.tsx` contains the dashboard logic with:
  - Category-based metric display system
  - Edit mode with undo/redo functionality
  - Revision control (draft/published states)
  - Image upload capability
  - Dynamic data management
- **Components**: Located in `src/components/`
  - `AuthWrapper.tsx` - Authentication shell
  - `MetricCard.tsx` - Individual metric display
  - `ChartCard.tsx` - Chart visualization
  - `SimpleChart.tsx` - Chart rendering logic
  - `SearchInterface.tsx` - Search functionality
  - `LoginForm.tsx` - Login UI

### Backend (Express + MongoDB)
- **Server**: `server/index.js` - Express server on port 3001
- **Database**: MongoDB Atlas (`series-dataroom` database)
  - `dataroom` collection: Main data storage with versioning
  - `images` collection: Image upload storage
- **Data Model**:
  - Documents have `page`, `status` (draft/published/archived), `version`, `minor` fields
  - `data` field contains array of `CategoryData` objects
  - Revision system tracks major/minor versions

### Data Flow
1. Frontend fetches published data from `GET /api/dataroom`
2. Static analytics data in `src/data/analyticsData.ts` (for reference/defaults)
3. Admin users can:
   - Create/edit drafts via revision system
   - Upload images to MongoDB GridFS-like storage
   - Publish drafts which archives previous published versions
4. All edits go through versioning system (drafts → published → archived)

## Commands

### Development
```bash
# Install dependencies
npm install

# Run frontend only (dev mode)
npm run dev                    # Vite dev server on localhost:5173

# Run backend only
npm run server                 # Express server on localhost:3001

# Run both frontend and backend concurrently
npm run dev:all                # Recommended for full-stack development

# Production backend
npm start                      # NODE_ENV=production server
```

### Build & Quality
```bash
npm run build                  # Vite production build → dist/
npm run preview                # Preview production build
npm run lint                   # ESLint check
```

## API Endpoints

Base URL (production): `https://series-metrics-api-202642739529.us-east1.run.app`

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/dataroom` - Get published dashboard data
- `GET /api/revisions` - List all revisions (metadata only)
- `GET /api/revisions/:version?minor=N` - Get specific revision
- `POST /api/revisions` - Create new draft revision
- `PUT /api/revisions/:version?minor=N` - Update draft revision
- `POST /api/publish/:version?minor=N` - Publish a draft
- `POST /api/images` - Upload image (multipart/form-data)
- `GET /api/images/:id` - Retrieve uploaded image

### Revision System
- Major versions increment when creating new drafts from published state
- Minor versions track edits within a draft
- Publishing a draft:
  - Archives the current published version
  - Promotes draft to published status
  - Draft becomes the new canonical version

## Key Patterns

### Data Structure (TypeScript interfaces in App.tsx)
```typescript
interface MetricData {
  title: string;
  value: string;
  description?: string;
  insight?: string;
  ctaText?: string;
  ctaLink?: LinkSpec;
  expandedData?: Array<{label, value, description?, link?}>;
  // ... more fields
}

interface CategoryData {
  title: string;
  header?: string;
  metrics: MetricData[];
}
```

### Authentication Flow
1. `AuthWrapper` checks localStorage for valid auth (< 24hrs old)
2. If not authenticated, shows `LoginForm`
3. On successful login, stores auth state and renders main `App`
4. Admin password grants edit/revision capabilities

### Edit Mode Workflow
1. Admin enters edit mode → local state becomes editable
2. Changes tracked in `undoStack`/`redoStack`
3. Save creates/updates draft revision in MongoDB
4. Publish promotes draft to published, archives old published version
5. Exit without saving → confirm dialog → option to reload from server

### Image Uploads
- Frontend: `handleImageUpload` in App.tsx sends FormData to `/api/images`
- Backend: Multer processes upload, stores binary in MongoDB `images` collection
- Returns URL: `https://series-metrics-api-202642739529.us-east1.run.app/api/images/{id}`
- Images can be linked in metric cards via `LinkSpec` with `type: 'image'`

## Development Notes

### Frontend Proxy Setup
Vite dev server proxies `/api/*` to `http://localhost:3001` (see `vite.config.ts`). This means:
- Use relative URLs (`/api/dataroom`) in development
- Production uses hardcoded GCP Cloud Run URLs in App.tsx

### MongoDB Connection
Connection string is hardcoded in `server/index.js` (line 12). The database auto-seeds with default retention/distribution data on first run.

### Styling
- Tailwind CSS for all styling (config in `tailwind.config.js`)
- Responsive design with mobile-first approach
- Custom classes defined in `src/index.css`

### State Management
- Local React state (no Redux/Zustand)
- Undo/redo implemented via state snapshots in arrays
- `hasUnsavedChanges` flag tracks dirty state
