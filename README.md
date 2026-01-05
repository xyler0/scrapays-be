# Bookshelf API - Backend

GraphQL API for managing books with Auth0 authentication.

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

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Auth0

1. Create Auth0 account at https://auth0.com
2. Create a new API:
   - Name: `Bookshelf API`
   - Identifier: `https://bookshelf-api`(AUTH0_AUDIENCE)
3. Note your Auth0 domain (e.g.,`devxxxxxxxx.us.auth0.com`)

### 3. Environment Variables

```

Edit `.env` with your Auth0 credentials:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://bookshelf-api
PORT=4000
FRONTEND_URL=http://localhost:3000
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

### Queries

```graphql
query GetBooks {
  books {
    id
    name
    description
  }
}
```

### Mutations

```graphql
mutation CreateBook {
  createBook(name: "Book Title", description: "Book description") {
    id
    name
    description
  }
}

mutation UpdateBook {
  updateBook(id: 1, name: "Updated Title", description: "Updated description") {
    id
    name
    description
  }
}

mutation DeleteBook {
  deleteBook(id: 1)
}
```

## Authentication

All endpoints require a valid JWT from Auth0.

Include the token in the `Authorization` header:

```
Authorization: Bearer <your-access-token>
```

### Testing with GraphQL Playground

1. Get an access token from Auth0
2. Add to HTTP Headers in playground:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

## Database

SQLite database file: `db.sqlite`

The database is committed to the repository for easy setup. In production, you would use a proper database service.

Tables are auto-created on first run via TypeORM synchronize.

## Project Structure

```
src/
├── auth/
│   ├── auth.module.ts          # Auth module configuration
│   ├── jwt.strategy.ts         # Auth0 JWT validation
│   └── gql-auth.guard.ts       # GraphQL auth guard
├── book/
│   ├── book.module.ts          # Book module
│   ├── book.entity.ts          # Book database entity
│   ├── book.service.ts         # Business logic
│   └── book.resolver.ts        # GraphQL resolvers
├── database/
│   └── database.module.ts      # TypeORM configuration
├── app.module.ts               # Root module
└── main.ts                     # Application entry
