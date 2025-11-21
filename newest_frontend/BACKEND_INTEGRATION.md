# Backend Integration Guide

This is a **STATIC FRONTEND** project. All backend logic has been removed. The backend developer needs to integrate the following:

## 🔧 Removed Backend Logic

### 1. **Authentication & User Management**
- **File**: `src/pages/Authentication/Login.jsx`
  - Login function is placeholder - needs API integration
  - Form data structure: `{ email: string, password: string }`
  
- **File**: `src/contexts/storecontexts.jsx`
  - `getUser()` function needs API call to fetch user data
  - Token stored in `localStorage.getItem('token')`

### 2. **Dashboard & Organizations**
- **File**: `src/pages/Dashboard/page.jsx`
  - `fetchOrganizations()` - needs API call to `/organization/fetch/hierarchical`
  - WebSocket connection for real-time updates
  - Temperature/Power/Lock controls need backend API calls
  - All `websocket.sendBatchCommandsMultiBrand()` calls need implementation
  - All `lockService` calls need implementation

### 3. **Organization Detail Page**
- **File**: `src/pages/Dashboard/organization-detail-page.jsx`
  - Device search/fetching needs API integration
  - Device temperature/power/lock controls need API calls
  - All `lockService` calls need implementation

### 4. **Redux Slices (API Calls Removed)**
All slices have API calls commented out:

- **`src/slices/OrganizationSlice.js`**
  - `fetchAllOrganizations` - needs API integration
  
- **`src/slices/ManagerSlice.js`**
  - `fetchAllManagers` - needs API integration
  - `DeleteManager` - needs API integration
  
- **`src/slices/DeviceSlice.js`**
  - Device fetching/management APIs needed
  
- **`src/slices/VenueSlice.js`**
  - Venue fetching/management APIs needed

### 5. **Management Pages**
All pages need API integration for:
- **Organization Management**: Create, Read, Update, Delete
- **Device Management**: Create, Read, Update, Delete
- **Venue Management**: Create, Read, Update, Delete
- **Manager Management**: Create, Read, Update, Delete
- **User Management**: Create, Read, Update, Delete
- **Brand Management**: OTA file upload, device list

### 6. **Services Removed**
- `src/lib/websocket.ts` - **DELETED** (needs to be recreated)
- `src/lib/lockservice.ts` - **DELETED** (needs to be recreated)

### 7. **Events Schedule**
- **File**: `src/pages/Dashboard/EventsSchedule.jsx`
  - Event fetching needs API integration
  - Event creation/update/delete needs API integration

## 📋 What Needs Implementation

### Required Services:
1. **WebSocket Service** - For real-time device updates
2. **Lock Service** - For device lock/unlock operations
3. **API Service** - For all CRUD operations

### Required API Endpoints:
1. Authentication: `/auth/login`, `/auth/register`
2. User: `/user/me`, `/user/fetch/all`, `/user/delete`
3. Organizations: `/organization/fetch/all`, `/organization/fetch/hierarchical`
4. Devices: Device CRUD endpoints
5. Venues: Venue CRUD endpoints
6. Managers: Manager CRUD endpoints
7. Brands: Brand CRUD, OTA endpoints
8. Events: Scheduler event endpoints

## 🎨 What's Kept (Static UI)

✅ All UI components and styling
✅ All routes and navigation
✅ Form structures and validation UI
✅ Redux store structure (without API calls)
✅ All static assets and images

## 📝 TODO Comments

Look for `// TODO: Backend developer` comments throughout the codebase to find exact places where API calls need to be added.

