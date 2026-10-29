# Jungle Arcade Backend

Backend API for a Mines-style game, built with NestJS, TypeScript, MikroORM, and PostgreSQL.

The project focuses on game logic, wallet management, transactional consistency, idempotency, and real-time round updates.

## Tech Stack

- **NestJS** — application framework and dependency injection
- **TypeScript** — application language
- **MikroORM** — ORM and database persistence
- **PostgreSQL** — relational database
- **Docker** — local database environment
- **Jest** — unit and end-to-end testing
- **Socket.IO** — real-time game updates

## Features

### Game Rounds
- Create and retrieve game rounds.
- Generate mine positions.
- Reveal board positions and validate game rules.
- Track round states and revealed positions.

### Players and Wallets
- Create players with associated wallets.
- Track wallet balances through ledger entries.

### Transactional Ledger
- Record wallet credits and debits.
- Use database transactions to keep wallet balances and ledger entries consistent.
- Apply pessimistic locking to protect concurrent wallet operations.
- Use idempotency keys to prevent duplicate operations.
- Enforce database constraints for data integrity.
- Store the resulting wallet balance in each ledger entry.

### Real-Time Updates
- Emit round updates through WebSockets using Socket.IO.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/rounds` | Create a game round |
| `GET` | `/rounds/:id` | Retrieve a game round |
| `POST` | `/rounds/:id/reveal` | Reveal a board position |
| `POST` | `/players` | Create a player and wallet |

## Architecture

The application follows a **modular monolith** approach, separating responsibilities into modules and keeping game rules distinct from HTTP handling.

- **Controllers:** handle HTTP requests and responses.
- **Services:** coordinate application use cases.
- **Domain entities and logic:** represent game and ledger concepts and enforce business rules.
- **MikroORM and PostgreSQL:** handle persistence and database integrity.
- **WebSocket gateway:** broadcasts round updates to connected clients.

## Data Consistency

The ledger implements several mechanisms to protect financial operations:

- **Transactions:** wallet updates and ledger entries are committed or rolled back together.
- **Pessimistic locking:** prevents concurrent operations on the same wallet from using stale balances.
- **Idempotency:** repeated requests with the same key and payload return the previous result; reuse with different data is rejected.
- **Database constraints:** enforce positive transaction amounts and unique idempotency keys per wallet.

## Testing

The project includes unit tests and end-to-end tests covering game rules, round operations, wallet transactions, concurrent debits, and transaction rollback.

Latest verified test results:

- **25 unit tests passed**
- **15 end-to-end tests passed**
- **40 tests passed in total**

## Running Locally

### Requirements

- Node.js
- npm
- Docker

### Setup

```bash
npm install
docker compose up -d
```

Configure the PostgreSQL connection using the project's environment or application configuration.

Run database migrations if required by the current setup, then start the application:

```bash
npm run start:dev
```

### Build and Tests

```bash
npm run build
npm run test -- --runInBand
npm run test:e2e -- --runInBand
```

## Project Scope

This project was developed as an MVP to explore backend architecture, domain logic, database consistency, concurrency control, idempotency, automated testing, and real-time communication.

The application currently uses a modular monolith architecture. WebSocket updates are broadcast to connected clients; per-round rooms and production-grade WebSocket authorization are outside the current scope.
