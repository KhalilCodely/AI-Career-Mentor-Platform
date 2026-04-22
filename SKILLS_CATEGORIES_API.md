# Skills & Categories API Documentation

Complete backend implementation for managing Skills and Categories with proper relationships, validation, and clean architecture.

## Architecture Overview

### Database Layer (Prisma)
- **Category Model**: Represents a skill category (e.g., Frontend Development)
- **Skill Model**: Represents individual skills belonging to categories (e.g., JavaScript)
- **Relationship**: One Category → Many Skills (1:N relationship)

### Application Layers

1. **Validation Layer** (`src/lib/validation/`)
   - `category.ts`: Request validation and schemas for categories
   - `skill.ts`: Request validation and schemas for skills

2. **Service Layer** (`src/lib/services/`)
   - `categoryService.ts`: Business logic for category operations
   - `skillService.ts`: Business logic for skill operations

3. **Route Layer** (`src/app/api/`)
   - `categories/`: Category endpoints
   - `categories/[id]/`: Category-specific endpoints
   - `categories/[id]/skills/`: Get skills for a category
   - `skills/`: Skill endpoints
   - `skills/[id]/`: Skill-specific endpoints

## Database Schema

### Category Model
```prisma
model Category {
  id        String   @id @default(uuid())
  name      String   @unique              // Unique category name
  description String?                     // Optional description
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  skills    Skill[]                       // One-to-many relationship
}
```

### Skill Model
```prisma
model Skill {
  id         String   @id @default(uuid())
  name       String                      // Skill name
  categoryId String   @map("category_id")  // Foreign key to Category
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  category   Category                    // Many-to-one relationship
  userSkills UserSkill[]                 // Relation to UserSkill
  courses    Course[]                    // Relation to Course
  
  @@unique([name, categoryId])           // Unique constraint: same skill name per category
}
```

## API Endpoints

### Categories API

#### POST /api/categories
Create a new category
```json
{
  "name": "Frontend Development",
  "description": "Skills related to frontend web development"
}
```
Response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Frontend Development",
    "description": "Skills related to frontend web development",
    "createdAt": "2026-04-22T...",
    "updatedAt": "2026-04-22T..."
  },
  "message": "Category created successfully"
}
```

#### GET /api/categories
Get all categories
```
Query params:
  - include_skills (optional): "true" to include skills for each category
```
Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Frontend Development",
      "description": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "skills": []  // Only if include_skills=true
    }
  ],
  "count": 1
}
```

#### GET /api/categories/:id
Get a specific category
```
Query params:
  - include_skills (optional): "true" to include skills
```
Response (200): Same as single category above

#### PUT /api/categories/:id
Update a category
```json
{
  "name": "New Category Name",
  "description": "Updated description"
}
```
Response (200): Updated category object

#### DELETE /api/categories/:id
Delete a category
Response (200): Deleted category object

### Skills API

#### POST /api/skills
Create a new skill
```json
{
  "name": "React",
  "categoryId": "uuid-of-frontend-category"
}
```
Response (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "React",
    "categoryId": "uuid",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Skill created successfully"
}
```

#### GET /api/skills
Get all skills
```
Query params:
  - category_id (optional): Filter by specific category
  - include_category (optional): "true" to include category details
```
Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "React",
      "categoryId": "uuid",
      "createdAt": "...",
      "updatedAt": "...",
      "category": {  // Only if include_category=true
        "id": "uuid",
        "name": "Frontend Development"
      }
    }
  ],
  "count": 1
}
```

#### GET /api/skills/:id
Get a specific skill
```
Query params:
  - include_category (optional): "true" to include category details
```
Response (200): Single skill object

#### PUT /api/skills/:id
Update a skill
```json
{
  "name": "React.js",
  "categoryId": "new-category-uuid"
}
```
Response (200): Updated skill object

#### DELETE /api/skills/:id
Delete a skill
Response (200): Deleted skill object

### Category Skills API

#### GET /api/categories/:id/skills
Get all skills for a specific category
Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "React",
      "categoryId": "uuid",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "count": 1
}
```

## Validation Rules

### Category
- **name**: Required, string, max 120 characters, must be unique
- **description**: Optional, string, max 1000 characters

### Skill
- **name**: Required, string, max 120 characters
- **categoryId**: Required, must be valid UUID, category must exist
- **Unique Constraint**: Same skill name cannot exist in the same category

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Skill name is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Category with ID 'xxx' not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Category with name 'Frontend Development' already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch categories"
}
```

## Usage Examples

### Create a Category and Add Skills

1. Create a category:
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend Development",
    "description": "Server-side development skills"
  }'
```

Response includes the category ID, e.g., `"id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"`

2. Create skills for that category:
```bash
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js",
    "categoryId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
  }'

curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Express",
    "categoryId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
  }'
```

3. Get all categories with their skills:
```bash
curl http://localhost:3000/api/categories?include_skills=true
```

4. Get skills for a specific category:
```bash
curl http://localhost:3000/api/categories/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6/skills
```

## Key Features

✅ **Clean Architecture**
- Separation of concerns with validation, service, and route layers
- Reusable service functions
- Proper error handling and validation

✅ **Relationship Management**
- One-to-many relationship between Category and Skill
- Cascade deletes configured appropriately
- Foreign key constraints enforced

✅ **Validation**
- Input validation at every endpoint
- Type safety with TypeScript interfaces
- Clear error messages for validation failures

✅ **Database Optimization**
- Indexed columns for performance
- Unique constraints to prevent duplicates
- Proper field mapping for database conventions

✅ **Error Handling**
- Specific HTTP status codes (400, 404, 409, 500)
- Descriptive error messages
- Proper logging for debugging

✅ **Extensibility**
- Service layer can be easily extended
- Validation functions can be reused
- Routes follow consistent patterns

## File Structure

```
src/
├── app/api/
│   ├── categories/
│   │   ├── route.ts              # GET all, POST new
│   │   ├── [id]/
│   │   │   ├── route.ts          # GET one, PUT, DELETE
│   │   │   └── skills/
│   │   │       └── route.ts      # GET skills for category
│   ├── skills/
│   │   ├── route.ts              # GET all, POST new
│   │   └── [id]/
│   │       └── route.ts          # GET one, PUT, DELETE
├── lib/
│   ├── validation/
│   │   ├── category.ts           # Category validation schemas
│   │   └── skill.ts              # Skill validation schemas
│   └── services/
│       ├── categoryService.ts     # Category business logic
│       └── skillService.ts        # Skill business logic
```

## Database Migration

The Prisma schema includes:
- New `Category` model with unique name constraint
- Updated `Skill` model with `categoryId` foreign key
- Proper indexes for performance
- Cascade delete configuration

To apply the migration:
```bash
npx prisma db push
# or
npx prisma migrate dev --name add-category-model
```

## Next Steps

Consider adding:
- Authentication/authorization middleware
- Rate limiting
- Pagination for large result sets
- Bulk operations (create multiple skills at once)
- Search functionality for categories and skills
- Soft deletes for audit trails
- API versioning
