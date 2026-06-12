# Campus Mobility and Ride Platform

A real-time campus ride management platform for passengers and e-rickshaw drivers. The app is built as a full-stack Next.js dashboard with authentication, driver onboarding, ride requests, ride assignment, live status updates, ratings, analytics, and optional campus map/scheduling/payment simulation surfaces.

## Live Demo

🌐 https://campus-mobility-ln21.onrender.com

## Technology Stack

- Next.js App Router and React
- MongoDB database with Mongoose ODM for data modeling and management
- Socket.IO for real-time ride and driver availability updates
- JWT authentication with HTTP-only cookies
- Zod validation
- SWR for client data fetching
- Chart.js for dashboard analytics
- Leaflet/OpenStreetMap campus map

## Features

- Passenger and driver registration/login
- Profile management for both roles
- Driver vehicle and verification information
- Driver online/offline availability
- Passenger ride request with pickup and destination
- Driver ride queue with accept/reject workflow
- Single-driver ride assignment protection
- Ride lifecycle: requested, accepted, in progress, completed, cancelled
- Live status, assignment, and availability notifications over Socket.IO
- Driver dashboard with completed rides, active rides, ratings, charts, and history
- Passenger ratings and written feedback
- Ride scheduling, simulated UPI/QR payments, and demand analytics views
- Demand forecasting summary based on collected ride history
- Live map view with pickup, destination, and driver hotspot markers

## Setup

1.Open the project folder in VS Code. Then open terminal in VS Code.
  Install Node.js if not already installed: https://nodejs.org

  
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `env.example`:

```bash
cp env.example .env
```

4. Run the development server:

```bash
npm run dev
```
or on Windows if PowerShell blocks npm:

```bash
npm.cmd run dev
```
5. Open `http://localhost:3000`.

6. The application uses MongoDB as its primary database. Configure the `MONGODB_URI` in the `.env` file to connect to your MongoDB instance. A local JSON fallback database is also included for demo/testing purposes when MongoDB is not configured.

7. Demo login:
Passenger: passenger@campus.test / password123
Driver: driver@campus.test / password123

## Demo Flow

1. Register a passenger.
2. Register a driver with vehicle and verification details.
3. Log in as the driver and go online.
4. Log in as the passenger, view available drivers, and request a ride.
5. Accept the ride from the driver dashboard.
6. Move the ride through in progress and completed states.
7. Submit passenger rating and feedback.

## Database

The platform uses MongoDB with Mongoose for storing and managing:

- User accounts and authentication data
- Driver profiles and vehicle information
- Ride requests and ride history
- Ratings and feedback
- Payment records
- Analytics and demand forecasting data

A local JSON fallback database is available for demonstration and testing when MongoDB is not configured.

## Project Structure

- `app`: pages, layouts, dashboard screens, API routes
- `components`: reusable UI, forms, charts, ride cards, map widgets
- `lib`: auth, database connection, validators, realtime helpers
- `models`: Mongoose schemas for users, drivers, rides, ratings, payments
- `data`: local fallback database used when MongoDB is not configured
- `docs`: architecture and submission design notes
