# API Routes Documentation

This document outlines the registered API routes in the Tech Talks Career Mentor application. Routes are registered by the Next.js App Router from `src/app/api`.

## Versioned API Base

All active application API routes are grouped under:

```txt
/api/v1
```

## Authentication Routes

### POST `/api/v1/auth/register`
**Purpose**: Register a new user and create an empty profile.
**Body**: `{ name: string, email: string, password: string }`
**Response**: `{ message: string, userId: string }`
**Status**: `201 | 400 | 409 | 500`

### POST `/api/v1/auth/login`
**Purpose**: Log in a user and set an HTTP-only auth cookie.
**Body**: `{ email: string, password: string }`
**Response**: `{ message: string, role: string, user: { id: string, email: string } }`
**Status**: `200 | 400 | 401 | 500`

### POST `/api/v1/auth/logout`
**Purpose**: Clear the auth cookie.
**Response**: `{ message: string }`
**Status**: `200`

## Profile Routes

### GET `/api/v1/profile`
**Purpose**: Get the authenticated user's profile.
**Auth**: Requires auth cookie.
**Response**: `{ success: true, data: Profile }`
**Status**: `200 | 401 | 404 | 500`

### POST `/api/v1/profile`
**Purpose**: Create or update the authenticated user's profile.
**Auth**: Requires auth cookie.
**Body**: `{ bio?: string, education?: string, experienceLevel?: string, careerGoal?: string, profileImage?: string }`
**Response**: `{ success: true, data: Profile, message: string }`
**Status**: `200 | 400 | 401 | 404 | 500`

### POST `/api/v1/profile/upload`
**Purpose**: Upload a profile image to `public/uploads`.
**Body**: `multipart/form-data` with a `file` field.
**Response**: `{ url: string }`
**Status**: `200 | 400 | 500`

## Skills Routes

### GET `/api/v1/skills`
**Purpose**: List available skills with their categories.
**Response**: `Skill[]`
**Status**: `200 | 500`

### GET `/api/v1/skills/user`
**Purpose**: List selected skill IDs for the authenticated user.
**Auth**: Requires auth cookie.
**Response**: `{ skillId: string }[]`
**Status**: `200 | 401 | 500`

### GET `/api/v1/skills/user?expand=skill`
**Purpose**: List selected user skills with full skill and category records.
**Auth**: Requires auth cookie.
**Response**: `UserSkill[]`
**Status**: `200 | 401 | 500`

### POST `/api/v1/skills/user`
**Purpose**: Replace the authenticated user's selected skills.
**Auth**: Requires auth cookie.
**Body**: `{ skillIds: string[] }`
**Response**: `{ message: string }`
**Status**: `200 | 400 | 401 | 500`

## Planned API Domains

The following versioned API folders are reserved for the next feature areas:

- `/api/v1/career`
- `/api/v1/courses`
- `/api/v1/ai`
- `/api/v1/resume`

## File Structure

```txt
src/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   └── api/
│       └── v1/
│           ├── auth/
│           │   ├── login/route.ts
│           │   ├── logout/route.ts
│           │   └── register/route.ts
│           ├── profile/
│           │   ├── route.ts
│           │   └── upload/route.ts
│           ├── skills/
│           │   ├── route.ts
│           │   └── user/route.ts
│           ├── career/
│           ├── courses/
│           ├── ai/
│           └── resume/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── skill/
│   ├── career/
│   ├── course/
│   ├── ai/
│   └── resume/
├── services/
│   ├── ai.service.ts
│   └── upload.service.ts
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── validations/
│   ├── auth.schema.ts
│   ├── skill.schema.ts
│   └── profile.schema.ts
├── types/
└── utils/
```

## Layering Rules

- `src/app/api/v1/**/route.ts` files should stay thin and handle HTTP concerns only.
- `src/modules/**` owns business logic and database orchestration.
- `src/services/**` owns reusable provider and infrastructure integrations.
- `src/validations/**` owns Zod request schemas.
- `src/lib/**` owns app-wide library helpers such as Prisma and authentication.

## Error Responses

Most errors follow this format:

```json
{
  "error": "Error message"
}
```

Profile errors include a success flag:

```json
{
  "success": false,
  "error": "Error message"
}
```
