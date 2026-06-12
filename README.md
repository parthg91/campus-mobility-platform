# Campus Mobility and Ride Platform

🌍 **Live Demo:** [https://campus-mobility-ln21.onrender.com](https://campus-mobility-ln21.onrender.com)

A real-time campus ride management platform connecting passengers and e-rickshaw drivers. Built to solve the last-mile transportation problem across large university campuses, this platform coordinates ride requests, driver availability, and real-time location mapping.

---

## 🎯 Features & Deliverables Fulfilled

This project fully satisfies both the **Mandatory** and **Bonus** criteria outlined in the Real-Time Campus Mobility Platform specifications.

### Mandatory Features
* **User Authentication & Profile Management**
  * Secure JWT-based authentication with HTTP-only cookies.
  * Distinct workflows for Passenger and Driver accounts.
  * Comprehensive profile management, including driver vehicle verification (License number, vehicle type).
* **Driver Availability Management**
  * Drivers can dynamically toggle availability states: `Online`, `Offline`, or `Busy`.
  * Passengers can view all currently online and verified drivers before requesting a ride.
* **Ride Request Workflow**
  * Passengers specify pickup and destination points.
  * Drivers view an incoming queue of requests and can accept or reject them.
  * **Race-Condition Protection:** The system strictly ensures a single ride cannot be assigned to multiple drivers simultaneously.
* **Real-Time Updates (WebSockets)**
  * Powered by **Socket.IO** to deliver instant state synchronization without page refreshes.
  * Live notifications for ride assignments, driver availability shifts, and real-time status updates.
* **Ride Lifecycle Management**
  * Consistent state tracking across: `Requested` → `Accepted` → `In Progress` → `Completed` → `Cancelled`.
* **Driver Dashboard & Analytics**
  * A comprehensive driver portal displaying total completed rides, active queues, historical logs, and average ratings.
  * Visualized via interactive summary cards and `Chart.js` graphs.
* **Ratings & Feedback**
  * Passengers can rate drivers (1-5 stars) and submit written feedback after completion.
  * Platform calculates and tracks driver averages and performance summaries over time.

### Bonus / Optional Features Achieved 🚀
* **Live Map Integration:** Integrated `Leaflet` and OpenStreetMap to visually map pickup hotspots, destination clusters, and live driver locations.
* **Ride Scheduling:** Added the ability for passengers to book rides for future time slots rather than requesting immediate dispatch.
* **Digital Payments:** Simulated digital payment tracking (UPI/Cash/Wallet) with distinct `pending` and `paid` states and transaction references.
* **Demand Analytics & Forecasting:** Dedicated dashboard screens for analyzing peak campus demand hours and ride hotspots.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React, TailwindCSS, Lucide Icons, react-hook-form + Zod
- **Backend:** Next.js Serverless API routes + Custom Node.js Server for WebSockets
- **Database:** MongoDB (via Mongoose)
- **Real-Time:** Socket.IO
- **Data Fetching:** SWR
- **Visualizations:** Chart.js, react-leaflet

---

## 🚀 Local Setup & Installation

**1. Clone the repository**
```bash
git clone https://github.com/parthg91/campus-mobility-platform.git
cd campus-mobility-platform
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Copy the example environment file:
```bash
cp env.example .env.local
```
Inside `.env.local`, configure your MongoDB connection:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus_mobility
JWT_SECRET=your_secure_random_string
NEXT_PUBLIC_ENABLE_SOCKET=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**4. Run the development server**
Because this app relies on real-time WebSockets, start the application using the custom socket script:
```bash
npm run dev:socket
```
*(Open [http://localhost:3000](http://localhost:3000) in your browser).*

---

## 🧪 Demo Login Credentials

If you want to quickly test the application without registering:

**Passenger Account:**
* Email: `passenger@campus.test`
* Password: `password123`

**Driver Account:**
* Email: `driver@campus.test`
* Password: `password123`

---

## 📦 Deployment (Render)

This application is configured to be deployed on platforms that support persistent Node.js servers (like **Render** or **Railway**) due to its WebSocket requirements. 

**Build Command:** `npm install && npm run build`
**Start Command:** `npm run start:socket`

*Ensure all environment variables from `.env.local` are transferred to your hosting provider's configuration dashboard.*
