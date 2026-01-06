# Bookshelf API - Backend

GraphQL API for managing books with Auth0 authentication and comprehensive activity logging.

## Tech Stack

- **NestJS** - Backend framework
- **GraphQL** - API layer (Apollo Server)
- **TypeORM** - Database ORM
- **SQLite** - Database
- **Auth0** - Authentication & Authorization
- **TypeScript** - Language

## Prerequisites

- Node.js 18+
- npm
- Auth0 account

## Features

- **Authentication & Authorization** via Auth0 JWT
- **Book CRUD Operations** - Create, Read, Update, Delete
- **Activity Logging** - Every admin action is logged and traceable
- **GraphQL API** with type-safe schema
- **Secured Endpoints** - All operations require authentication

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Auth0

1. Create Auth0 account at https://auth0.com
2. Create a new API:
   - Name: `Bookshelf API`
   - Identifier: `https://bookshelf-api` (AUTH0_AUDIENCE)
3. Note your Auth0 domain (e.g., `dev-xxxxxxxx.us.auth0.com`)

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Auth0 credentials:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://bookshelf-api
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./db.sqlite
```

### 4. Run the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server runs on `http://localhost:4000/graphql`

## GraphQL Schema

### Types

```graphql
type Book {
  id: Int!
  name: String!
  description: String!
}

type Activity {
  id: Int!
  action: String!
  entityType: String!
  entityId: Int
  details: String
  userId: String!
  userEmail: String!
  timestamp: DateTime!
}
```

### Queries

```graphql
# Get all books
query GetBooks {
  books {
    id
    name
    description
  }
}

# Get activity logs
query GetActivities {
  activities {
    id
    action
    entityType
    entityId
    details
    userId
    userEmail
    timestamp
  }
}
```

### Mutations

```graphql
# Create a book
mutation CreateBook {
  createBook(name: "Book Title", description: "Book description") {
    id
    name
    description
  }
}

# Update a book
mutation UpdateBook {
  updateBook(id: 1, name: "Updated Title", description: "Updated description") {
    id
    name
    description
  }
}

# Delete a book
mutation DeleteBook {
  deleteBook(id: 1)
}
```

## Authentication & Authorization

### How It Works

This application uses **Auth0** for authentication. Here's the flow:

```
User → Frontend → Auth0 Login → JWT Token → Backend API
                                    ↓
                          Token Validation (JWKS)
                                    ↓
                          Extract User Info → Process Request
```

#### Authentication Flow:

1. **User Authentication**: User logs in via Auth0 (handled by frontend)
2. **Token Generation**: Auth0 generates a JWT token upon successful login
3. **Token Validation**: Backend validates the token on every request using:
   - **JWKS (JSON Web Key Set)**: Fetches public keys from Auth0
   - **RS256 Algorithm**: Asymmetric encryption for enhanced security
   - **Token Claims**: Validates audience, issuer, and expiration
4. **User Extraction**: `@CurrentUser()` decorator extracts user info from validated JWT
5. **Request Processing**: If valid, request proceeds; otherwise returns 401 Unauthorized

#### Security Features:

- **Stateless Authentication**: No server-side session storage needed
- **JWT-based**: Industry standard token format
- **Public Key Cryptography**: RS256 signing with automatic key rotation
- **Token Expiration**: Configurable token lifetimes in Auth0
- **User Context**: Every request knows who made it (for activity logging)

### Using the API

All endpoints require a valid JWT from Auth0.

Include the token in the `Authorization` header:

```
Authorization: Bearer <your-access-token>
```

### Getting an Access Token

#### For Testing (Quick Method):

```bash
curl --request POST \
  --url https://YOUR_AUTH0_DOMAIN/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"YOUR_CLIENT_ID",
    "client_secret":"YOUR_CLIENT_SECRET",
    "audience":"YOUR_AUTH0_AUDIENCE",
    "grant_type":"client_credentials"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

### Testing with GraphQL Playground

1. Start the server: `npm run start:dev`
2. Open GraphQL Playground: `http://localhost:4000/graphql`
3. Get an access token from Auth0 (see above)
4. Add to HTTP Headers in playground:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

5. Run queries and mutations:

```graphql
# Test creating a book
mutation {
  createBook(name: "Test Book", description: "Testing the API") {
    id
    name
    description
  }
}

# Verify it was logged
query {
  activities {
    id
    action
    entityType
    entityId
    userEmail
    timestamp
  }
}
```

## Activity Logging

**Every admin action is logged and traceable.**

### What Gets Logged:

- **Book Creation** - Full book details and creator
- **Book Updates** - Before and after state
- **Book Deletions** - Deleted book details
- **User Information** - Who performed the action (from JWT)
- **Timestamps** - When the action occurred

### Activity Log Structure:

```typescript
{
  id: 1,
  action: "BOOK_CREATED",           // Action type
  entityType: "BOOK",                // Entity affected
  entityId: 1,                       // Book ID
  details: "{...}",                  // JSON with operation details
  userId: "auth0|123456",            // Auth0 user ID
  userEmail: "admin@example.com",    // User's email
  timestamp: "2025-01-06T15:30:00Z"  // When it happened
}
```

### Implementation:

Activity logging is automatic and happens in the GraphQL resolvers:

```typescript
@Mutation(() => Book)
@UseGuards(GqlAuthGuard)
async createBook(
  @Args('name') name: string,
  @Args('description') description: string,
  @CurrentUser() user: any, // Extracted from JWT token
): Promise<Book> {
  const book = await this.bookService.create(name, description);
  
  // Automatically log the activity
  await this.activityService.log(
    'BOOK_CREATED',
    'BOOK',
    book.id,
    { name: book.name, description: book.description },
    user.sub,      // Auth0 user ID
    user.email,    // User's email
  );

  return book;
}
```

## Database

SQLite database file: `db.sqlite`

The database is committed to the repository for easy setup. In production, you would use a proper database service like PostgreSQL or MySQL.

### Tables:

- **book** - Stores book records
- **activity** - Stores activity log entries

Tables are auto-created on first run via TypeORM `synchronize: true`.

## Project Structure

```
src/
├── auth/
│   ├── auth.module.ts          # Auth module configuration
│   ├── jwt.strategy.ts         # Auth0 JWT validation strategy
│   ├── gql-auth.guard.ts       # GraphQL authentication guard
│   └── current-user.decorator.ts # Extract user from JWT
├── book/
│   ├── book.module.ts          # Book module
│   ├── book.entity.ts          # Book database entity
│   ├── book.service.ts         # Business logic
│   ├── book.resolver.ts        # GraphQL resolvers
│   └── book.resolver.spec.ts   # Unit tests
├── activity/
│   ├── activity.module.ts      # Activity module
│   ├── activity.entity.ts      # Activity log entity
│   ├── activity.service.ts     # Activity logging service
│   └── activity.resolver.ts    # Activity query resolver
├── database/
│   └── database.module.ts      # TypeORM configuration
├── app.module.ts               # Root module
└── main.ts                     # Application entry point
```

## Testing

### Unit Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

## Role-Based Access Control (RBAC)

### Current Implementation

All authenticated users have full admin access. This is suitable for single-tenant admin panels where all users are trusted administrators.

### Production Extension

For production environments, implement RBAC using Auth0:

1. **Define Roles in Auth0**:
   - Super Admin (full access)
   - Admin (CRUD books)
   - Editor (create/update only)
   - Viewer (read only)

2. **Add Roles to JWT** via Auth0 Actions:
```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://your-app.com';
  api.accessToken.setCustomClaim(`${namespace}/roles`, event.user.app_metadata.roles);
};
```

3. **Create Role Guards** in NestJS:
```typescript
@Roles('admin', 'super-admin')
@UseGuards(GqlAuthGuard, RolesGuard)
@Mutation(() => Book)
async deleteBook(@Args('id') id: number): Promise<boolean> {
  return this.bookService.delete(id);
}
```

## Deployment

### Deployed API

- **GraphQL Endpoint**: https://scrapays-be.onrender.com/graphql

### Deploy to Render

1. Create new Web Service on Render
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. Add environment variables:
   - `AUTH0_DOMAIN`
   - `AUTH0_AUDIENCE`
   - `PORT` (Render provides this)
   - `FRONTEND_URL` (your deployed frontend URL)
5. Deploy!

### Post-Deployment

- Update Auth0 API settings with production URL
- Update CORS settings in `main.ts` to allow production frontend
- Monitor logs for any issues

## Development

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for formatting
- **Conventional Commits** for commit messages

Format code:
```bash
npm run format
```

Lint code:
```bash
npm run lint
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add activity logging system
fix: resolve JWT validation issue
docs: update API documentation
test: add unit tests for book service
chore: upgrade dependencies
```

## API Documentation

Access GraphQL Playground in development:
- URL: `http://localhost:4000/graphql`
- Interactive schema exploration
- Built-in documentation
- Query testing interface

## Troubleshooting

### "Unauthorized" Error

- Verify token is not expired
- Check `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` match Auth0 settings
- Ensure token is in `Authorization: Bearer TOKEN` format

### Database Issues

View database contents:
```bash
sqlite3 db.sqlite
.tables
SELECT * FROM activity;
.quit
```

### CORS Errors

Update `FRONTEND_URL` in `.env` and restart server.

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact the development team.