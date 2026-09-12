# User dashboard — development mock data

> Development mock data only. It is automatically seeded when the MongoDB user collections are empty. Replace the seed data in `model/userModel.js` when real data is available.

## Stack and scope

- Node.js, Express, MongoDB, and Mongoose
- React frontend consumes the REST API
- This module provides profiles, allergies, notifications, doctor search, appointment booking, and registration

## Demo dashboard user

| Field | Value |
| --- | --- |
| Full name | Aarav Sharma |
| Email | aarav.sharma@example.com |
| Phone | +91 98765 43210 |
| Date of birth | 1998-04-18 |
| Blood group | O+ |
| Allergies | Penicillin, Peanuts |
| Profile photo | None |

The dashboard endpoints currently display this demo user. Newly registered users are stored in MongoDB but cannot have an individual dashboard session until login/authentication is added.

## Demo doctors

| Name | Specialty | Hospital |
| --- | --- | --- |
| Dr. Meera Iyer | General Physician | City Care Hospital |
| Dr. Kabir Singh | Cardiologist | Metro Heart Centre |
| Dr. Naina Gupta | Dermatologist | Wellness Clinic |

## Demo notification

| Title | Message | State |
| --- | --- | --- |
| Annual check-up due | Book your annual check-up when convenient. | Unread |

## API endpoints

| Method | URL | Purpose |
| --- | --- | --- |
| POST | `/api/users/register` | Create a new MongoDB user |
| GET | `/api/users/profile` | Get demo dashboard profile |
| PATCH | `/api/users/profile` | Update demo dashboard profile |
| POST | `/api/users/profile/photo` | Upload a JPEG, PNG, or WebP profile photo (maximum 5 MB) |
| GET/POST/DELETE | `/api/users/allergies` | Manage demo user allergies |
| GET | `/api/users/notifications` | Get demo user notifications |
| PATCH | `/api/users/notifications/:notificationId/read` | Mark notification as read |
| GET | `/api/users/doctors?search=&specialty=` | Search doctor directory |
| GET/POST | `/api/users/appointments` | List or book demo user appointments |

### Registration request

```json
{
  "fullName": "Priya Patel",
  "email": "priya@example.com",
  "password": "development-password",
  "phone": "+91 90000 00000",
  "dateOfBirth": "1999-10-20",
  "bloodGroup": "A+",
  "allergies": ["Dust"]
}
```

Passwords are validated only for presence and minimum length right now. They are **not stored**. Add password hashing, login, JWT/session handling, and user authorization before production.

## Information needed before production

1. Authentication approach: JWT, cookie session, or external provider.
2. Password policy, hashing method, account verification, and password reset flow.
3. Required user fields and which fields users may edit.
4. Roles and permissions: patient, doctor, admin, receptionist.
5. Source of doctor records, availability, leave, locations, and consultation type.
6. Appointment duration, time zone, cancellation/rescheduling policy, and approval process.
7. Notification types, delivery channels, and retention period.
8. Profile-photo storage provider and allowed file types/sizes.
9. Medical-data privacy, consent, audit-log, and data-retention requirements.
10. Validation/error-response contract expected by the React frontend.
