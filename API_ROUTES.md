# API Routes Documentation

This document outlines all registered API routes in the Tech Talks Career Mentor application. Routes are automatically registered using Next.js App Router based on file structure.

## Authentication Routes

### POST `/api/login`
**Purpose**: User login  
**Body**: `{ email: string, password: string }`  
**Response**: `{ message: string, token: string, user: { id, name, email } }`  
**Status**: 200 | 400 | 401 | 500

### POST `/api/signup`
**Purpose**: User registration  
**Body**: `{ name: string, email: string, password: string }`  
**Response**: `{ message: string, user: { id, name, email } }`  
**Status**: 201 | 400 | 500

## Career Path Routes

### GET `/api/career_path`
**Purpose**: Get all career paths or user's enrolled paths  
**Query**: `?userId=<userId>` (optional)  
**Response**: `{ success: boolean, data: CareerPath[], count: number }`  
**Status**: 200 | 500

### POST `/api/career_path`
**Purpose**: Create a new career path (Admin only)  
**Body**: `{ title: string, description?: string }`  
**Auth**: Requires admin token  
**Response**: `{ success: boolean, data: CareerPath, message: string }`  
**Status**: 201 | 400 | 401 | 403 | 409 | 500

### GET `/api/career_path/:id`
**Purpose**: Get a single career path with enrolled users  
**Params**: `id: string (UUID)`  
**Response**: `{ success: boolean, data: CareerPath }`  
**Status**: 200 | 400 | 404 | 500

### PUT `/api/career_path/:id`
**Purpose**: Update a career path (Admin only)  
**Params**: `id: string (UUID)`  
**Body**: `{ title?: string, description?: string }`  
**Auth**: Requires admin token  
**Response**: `{ success: boolean, data: CareerPath, message: string }`  
**Status**: 200 | 400 | 401 | 403 | 404 | 409 | 500

### DELETE `/api/career_path/:id`
**Purpose**: Delete a career path (Admin only)  
**Params**: `id: string (UUID)`  
**Auth**: Requires admin token  
**Response**: `{ success: boolean, message: string }`  
**Status**: 200 | 400 | 401 | 403 | 404 | 500

## Career Path Enrollment Routes

### POST `/api/career_path/enroll`
**Purpose**: Enroll a user in a career path  
**Body**: `{ userId: string, careerPathId: string }`  
**Response**: `{ success: boolean, data: UserCareerPath, message: string }`  
**Status**: 201 | 400 | 404 | 409 | 500

### PATCH `/api/career_path/progress`
**Purpose**: Update user's progress in a career path  
**Body**: `{ userId: string, careerPathId: string, progress: number (0-100) }`  
**Response**: `{ success: boolean, data: UserCareerPath, message: string }`  
**Status**: 200 | 400 | 404 | 500

### DELETE `/api/career_path/unenroll`
**Purpose**: Unenroll a user from a career path  
**Body**: `{ userId: string, careerPathId: string }`  
**Response**: `{ success: boolean, message: string }`  
**Status**: 200 | 400 | 404 | 500

## Skills Routes

### GET `/api/skills`
**Purpose**: Get all skills or filter by category  
**Query**: `?category=<category>` (optional)  
**Response**: `{ success: boolean, data: Skill[], count: number }`  
**Status**: 200 | 500

### POST `/api/skills`
**Purpose**: Create a new skill (Admin only)  
**Body**: `{ name: string, category?: string }`  
**Auth**: Requires admin token  
**Response**: `{ success: boolean, data: Skill, message: string }`  
**Status**: 201 | 400 | 401 | 403 | 409 | 500

### GET `/api/skills/:id`
**Purpose**: Get a single skill by ID  
**Params**: `id: string (UUID)`  
**Response**: `{ success: boolean, data: Skill }`  
**Status**: 200 | 400 | 404 | 500

### PUT `/api/skills/:id`
**Purpose**: Update a skill (Admin only)  
**Params**: `id: string (UUID)`  
**Body**: `{ name?: string, category?: string }`  
**Auth**: Requires admin token  
**Response**: `{ success: boolean, data: Skill, message: string }`  
**Status**: 200 | 400 | 401 | 403 | 404 | 409 | 500

## Protected Routes

### GET `/api/protected/test`
**Purpose**: Test endpoint for authenticated users  
**Response**: `{ message: string }`  
**Status**: 200

### GET `/api/protected/test/admin`
**Purpose**: Test endpoint for admin users  
**Auth**: Requires admin token  
**Response**: `{ message: string, admin: JWTPayload }`  
**Status**: 200 | 401 | 403

### GET `/api/protected/test/user`
**Purpose**: Test endpoint for regular users  
**Response**: `{ message: string }`  
**Status**: 200

## Authentication

### Bearer Token
For admin-protected routes, include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Middleware Headers
The system also supports middleware headers:
```
x-user-role: ADMIN | USER
x-user-id: <userId>
```

## File Structure

All routes are automatically registered through Next.js App Router:

```
src/app/api/
├── career_path/
│   ├── route.ts                 (GET all, POST create)
│   ├── [id]/route.ts            (GET single, PUT update, DELETE)
│   ├── enroll/route.ts          (POST enroll)
│   ├── progress/route.ts        (PATCH progress)
│   └── unenroll/route.ts        (DELETE unenroll)
├── skills/
│   ├── route.ts                 (GET all, POST create)
│   └── [id]/route.ts            (GET single, PUT update)
├── login/route.ts               (POST login)
├── signup/route.ts              (POST signup)
└── protected/
    └── test/
        ├── route.ts             (GET test)
        ├── admin/route.ts       (GET admin test)
        └── user/route.ts        (GET user test)
```

## Error Responses

All routes follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common error codes:
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Duplicate resource
- `500`: Internal Server Error - Server-side error
