# HealthTrack - Next Generation Healthcare Platform

This document outlines the complete technology stack, major libraries, and core features used to build the HealthTrack website.

## 🎨 Frontend Stack (Client-Side)
The frontend is built for speed, responsiveness, and a premium "Glassmorphism" aesthetic.

- **React.js (via Vite):** The core JavaScript framework used to build the interactive user interface. We used Vite for lightning-fast development server speeds.
- **Tailwind CSS:** Used for all the styling. It allowed us to rapidly build the beautiful frosted-glass cards, animated glowing backgrounds, and responsive layouts.
- **React Router DOM:** Handles the Single Page Application (SPA) routing, allowing users to instantly jump between the Login, Register, and Dashboard pages without the page reloading.
- **Axios:** The HTTP client used to seamlessly send and receive data (like login credentials and patient vitals) from the frontend to the backend.
- **Lucide-React:** A beautiful, open-source icon library. We used this for all the sleek icons (Stethoscopes, Hearts, Trash cans) across the site.
- **Google Translate API:** A custom script injected into the HTML to allow instant, real-time translation of the entire website between English and Kannada.

## ⚙️ Backend Stack (Server-Side)
The backend is built for security, secure file handling, and robust database management.

- **Node.js & Express.js:** The core server architecture that listens for requests from the React frontend, processes them, and returns the appropriate data.
- **Prisma (ORM):** A next-generation Object-Relational Mapper. We used Prisma to define our database schema (Patients, Doctors, Documents, Vitals) and interact with the database using simple JavaScript instead of raw SQL.
- **JSON Web Tokens (JWT):** Used for secure authentication. When a doctor or patient logs in, they are given a secure token that keeps them logged in.
- **Bcrypt:** A cryptography library used to securely hash and salt all passwords before saving them to the database, ensuring maximum security.
- **Multer:** A specialized middleware we used to handle file uploads. This is the engine that allows patients to upload PDF and Image lab reports, saving them securely on the server.
- **CORS:** Middleware that safely allows your frontend (hosted on one domain) to talk to your backend (hosted on another).

## 🚀 Major Features Built

1. **Dual-Portal System:** Separate, highly secure login portals and dashboards for both Doctors and Patients.
2. **Real-time Vitals Tracking:** Patients can log their blood pressure and blood sugar, which instantly updates the database.
3. **Report Uploads & Management:** Patients can upload physical documents/lab reports via the dashboard. They can also delete them if needed.
4. **Instant Doctor Review:** Doctors can search for a unique Patient Code, view that patient's entire medical history, and download/view the lab reports the patient uploaded.
5. **Bilingual Support:** A custom-built, sleek toggle switch that instantly translates the entire application between English and Kannada.
