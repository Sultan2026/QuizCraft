# Notes API Documentation

This document describes the Notes API endpoints for QuizCraft with authentication and usage limits.

## Overview

The Notes API provides CRUD operations for user notes with the following features:
- Authentication required for all operations
- Free users limited to 10 notes
- Pro users have unlimited notes
- Row-level security ensures users can only access their own notes

## Database Schema

### notes table
```sql
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### users table (updated)
```sql
ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free';
```

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-supabase-jwt-token>
```

## API Endpoints

### GET /api/notes

Lists all notes for the authenticated user.

**Request:**
```bash
GET /api/notes
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "user_id": "uuid", 
        "title": "Note Title",
        "content": "Note content...",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 5,
    "limit": 10
  }
}
```

### POST /api/notes

Creates a new note. Checks usage limits for free users.

**Request:**
```bash
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Note Title",
  "content": "This is the note content..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "My Note Title", 
    "content": "This is the note content...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Note created successfully"
}
```

**Response (Limit Exceeded):**
```json
{
  "success": false,
  "error": "Note limit reached. Upgrade to Pro for unlimited notes.",
  "message": "You have reached your limit of 10 notes. Current plan: Free"
}
```

### PUT /api/notes?id=<note-id>

Updates an existing note by ID.

**Request:**
```bash
PUT /api/notes?id=note-uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "note-uuid",
    "user_id": "user-uuid", 
    "title": "Updated Title",
    "content": "Updated content...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T01:00:00Z"
  },
  "message": "Note updated successfully"
}
```

### DELETE /api/notes?id=<note-id>

Deletes a note by ID.

**Request:**
```bash
DELETE /api/notes?id=note-uuid
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional details"
}
```

**Common Error Codes:**
- `400` - Bad Request (missing required fields, invalid data)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (usage limit exceeded, access denied)
- `500` - Internal Server Error

## Usage Limits

- **Free Plan**: Maximum 10 notes
- **Pro Plan**: Unlimited notes

The API automatically checks usage limits when creating new notes and returns appropriate error messages when limits are exceeded.

## Security

- Row Level Security (RLS) is enabled on the notes table
- Users can only access notes they own
- All operations require valid authentication tokens
- Note ownership is verified before updates/deletes

## Implementation Files

- `src/app/api/notes/route.ts` - Main API route handlers
- `src/lib/auth.ts` - Authentication utilities
- `src/lib/usage-limits.ts` - Usage limit validation
- `src/lib/supabase.ts` - Database helpers (updated with notes functions)
- `src/types/database.ts` - TypeScript types (updated with notes types)
- `database-setup.sql` - Database schema with notes table
