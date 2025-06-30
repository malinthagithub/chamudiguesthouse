# chamudiguesthouse


A backend system for managing hotel reservations, rooms, and user accounts.

---

##  Table of Contents
- [Features](#-features)
- [Identifiers (IDs)](#-identifiers-ids)
- [Tech Stack](#-tech-stack)
- [Setup](#-setup)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

 Features
- User registration and authentication.
- Room availability checks.
- Booking creation/modification.
- Payment processing integration.

---

## Identifiers (IDs)
Unique identifiers used in the database and API:

### 1. User Management
| Field        | Type     | Description                          | Example               |
|-------------|----------|--------------------------------------|-----------------------|
| `user_id`   | `UUID`   | Unique ID for each user.             | `"usr_48f9b2e1"`      |
| `email`     | `String` | Unique login identifier.             | `"guest@example.com"` |

### 2. Bookings
| Field           | Type       | Description                          | Example               |
|----------------|------------|--------------------------------------|-----------------------|
| `booking_id`   | `UUID`     | Unique booking reference.            | `"book_a1b2c3d4"`     |
| `confirmation_code` | `String` | Human-readable code for guests.      | `"HOTEL-XY123"`       |

### 3. Rooms
| Field        | Type     | Description                          | Example               |
|-------------|----------|--------------------------------------|-----------------------|
| `room_id`   | `INT`    | Auto-incremented room number.        | `101`                 |
| `room_type` | `String` | Category (e.g., "Deluxe").           | `"deluxe"`            |

---

##  Tech Stack
- **Backend**: Node.js, Express
- **Database**: PostgreSQL/MongoDB
- **Auth**: JWT
- **Testing**: Jest

---

## 🛠 Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/your-repo/hotel-booking-system.git
