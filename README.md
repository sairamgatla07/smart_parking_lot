# Smart Parking Lot System

A low-level design project for a smart parking lot, built with Node.js, Express, MongoDB and Mongoose.

## Features

- Check-in and check-out for motorcycles, cars and buses.
- Multiple parking floors and spot types.
- Smallest-compatible-spot-first allocation.
- Hourly fee calculation: each started hour is charged as a full hour; zero-duration stays cost zero.
- Live availability counts by floor, spot type and status.
- Persistent tickets and vehicle history.
- Atomic conditional spot reservation.
- MongoDB transactions for check-in/check-out consistency.
- Validation, unique indexes and centralized error handling.

## Requirements

- Node.js 18+
- MongoDB running locally as a replica set for transactions, or MongoDB Atlas.
- A standalone local MongoDB server does not support multi-document transactions. For a quick demo, use Atlas or configure a local replica set.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI`. Then run:

```bash
npm run dev
```

Open `http://localhost:3000` to see the API overview.

## Quick demo (Postman or curl)

### 1. Create demo data

```bash
curl -X POST http://localhost:3000/api/admin/seed
```

Copy the returned `parkingLotId`.

### 2. Check in a car

Replace `YOUR_LOT_ID` with the returned ID:

```bash
curl -X POST http://localhost:3000/api/parking/entry \
  -H "Content-Type: application/json" \
  -d '{"parkingLotId":"YOUR_LOT_ID","licensePlate":"TS09AB1234","vehicleType":"CAR"}'
```

Copy `ticket._id` from the response.

### 3. Check availability

```bash
curl "http://localhost:3000/api/parking/availability?parkingLotId=YOUR_LOT_ID"
```

### 4. Check out

```bash
curl -X POST http://localhost:3000/api/parking/exit/YOUR_TICKET_ID
```

The response includes duration, billable hours and fee.

### 5. Retrieve a ticket

```bash
curl http://localhost:3000/api/parking/tickets/YOUR_TICKET_ID
```

## API summary

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/admin/seed` | Create demo lot, floors, spots and pricing |
| POST | `/api/parking/entry` | Register vehicle and reserve a spot |
| POST | `/api/parking/exit/:ticketId` | Calculate fee, complete ticket and release spot |
| GET | `/api/parking/availability?parkingLotId=...` | Count spots by floor/type/status |
| GET | `/api/parking/tickets/:ticketId` | Retrieve ticket details |

## Example check-in request

```json
{
  "parkingLotId": "YOUR_LOT_ID",
  "licensePlate": "TS09AB1234",
  "vehicleType": "CAR"
}
```

Allowed vehicle types: `MOTORCYCLE`, `CAR`, `BUS`.

Compatibility:
- Motorcycle -> motorcycle, compact, large.
- Car -> compact, large.
- Bus -> large.

## Design notes

- **Entities:** ParkingLot, ParkingFloor, ParkingSpot, Vehicle, ParkingTicket, PricingRule.
- **Services:** SpotAllocationService, FeeCalculator, ParkingService.
- **Separation of concerns:** HTTP controllers handle requests; services implement business rules; Mongoose models define persistence and validation.
- **Concurrency:** a conditional `findOneAndUpdate` claims only spots that are still available. A MongoDB transaction groups related changes so a failed check-in or check-out is rolled back.
- **Historical pricing:** each ticket stores `pricingVersion` so the fee can use the corresponding pricing rule.
- **Indexes:** unique vehicle license plate, unique spot number per floor, unique ticket number, and partial unique indexes to prevent multiple active tickets for one spot or vehicle.

## Assumptions and limitations

- The demo seed endpoint is not authenticated. Do not expose it publicly in production.
- The example pricing values are INR 20/hour for motorcycles, INR 40/hour for cars, and INR 80/hour for buses; configure these according to the actual assignment.
- Pricing uses ceiling-hour billing. For example, a stay of 61 minutes is billed as two hours.
- This is a learning project. Before production use, add authentication/authorization, payment integration, idempotency keys, stronger operational logging, and integration tests.
- MongoDB multi-document transactions require a replica set or sharded cluster (MongoDB Atlas supports this).
- The current demo creates one lot and is intended for local testing.

## LLD concepts demonstrated

1. **Single Responsibility Principle:** allocation, pricing, and workflow orchestration live in separate services.
2. **Encapsulation:** spot status and compatibility rules are managed in domain-specific code.
3. **Strategy-friendly design:** the fee calculator is isolated so more pricing policies can be introduced.
4. **Atomicity:** spot claiming uses a conditional database update; check-in/out use transactions.
5. **Persistence modeling:** current spot state is separate from historical parking tickets.

## Before submitting

- Run the API locally and test all endpoints.
- Add screenshots of successful check-in, availability and check-out responses if your cohort accepts them.
- Ensure `.env` is not committed.
- Replace the README author section, if you add one, with your own details and be prepared to explain the design decisions.
