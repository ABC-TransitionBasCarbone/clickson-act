# Static Data Files - NO LONGER USED

⚠️ **IMPORTANT**: These static data files are no longer used by the application.

## Migration Status - COMPLETE ✅

- ✅ **emissions.json** → **REPLACED** with database-driven emission categories via `/api/emission-categories/public`
- ✅ **actions.json** → **REPLACED** with database-driven action templates via `/api/actions/public`

## Current System

The application now uses **ONLY DATABASE DATA**:

- **Emission Categories**: Fetched from `emissionCategories` collection
- **Action Templates**: Fetched from `admin-action-templates` collection
- **No Static Fallback**: If database is empty, the system shows appropriate messages asking users to contact administrators

## For Developers

All data **MUST** be added through:

- **Admin Panel** → Emission Categories Management
- **Admin Panel** → Actions Management

## File Status

- `emissions.json` - **OBSOLETE** - Not used by application
- `actions.json` - **OBSOLETE** - Not used by application

These files can be safely deleted as they are no longer referenced by the application code.
