# ReadNest — Online Book Borrowing Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4-183D33?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-8A2BE2?style=flat)](https://better-auth.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Native_Driver-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-22_Passed-success?style=flat)](https://nodejs.org/api/test.html)

**ReadNest** is a production-grade, architectural digital library platform engineered with Next.js App Router, TypeScript, Better Auth, and MongoDB. Designed with an editorial aesthetic, it enables verified readers to discover classic literature, technical treatises, and scientific volumes, borrow physical/digital copies with real-time atomic inventory management, and maintain their personal reader profile.

---

## 🔗 Project Links

- **Live Deployment**: `https://readnest-library.vercel.app` *(Production deployment placeholder)*
- **GitHub Repository**: [https://github.com/SamiumBashir/readNext](https://github.com/SamiumBashir/readNext)

---

## 🌟 Key Features

1. **Editorial Literary Aesthetic**:
   - Custom palette inspired by classic library archives: Warm ivory (`#FAF8F5`), deep forest green (`#183D33`), muted sage (`#52796F`), and warm amber highlights (`#C88A3B`).
   - Literary display typography using Google Fonts `Playfair Display` paired with `Plus Jakarta Sans`.

2. **Server-Rendered Database Collection**:
   - Featured books retrieved directly from MongoDB on the server with zero hardcoded mock arrays.
   - 15 realistic seed volumes balanced evenly across **Story**, **Tech**, and **Science** with authentic cover imagery.

3. **Interactive Swiper.js Showcase**:
   - Responsive carousel with custom navigation controls, pagination, touch/swipe gestures, and keyboard navigation.

4. **Dynamic Title Search & Category Filtering**:
   - Case-insensitive title searching combined concurrently with category filters (`All`, `Story`, `Tech`, `Science`).
   - Instant query parameter synchronization with accessible drawer toggles for mobile viewports.

5. **Authentication with Better Auth & MongoDB Adapter**:
   - Native MongoDB adapter (`mongodbAdapter(db)`).
   - Secure email & password registration and login with Zod validation.
   - Genuinely configured Google OAuth provider (`authClient.signIn.social({ provider: "google" })`).
   - Session persistence across page reloads and browser restarts.

6. **Protected Routes & Server-Side Security**:
   - Private route `/books/[id]`: Restricted to authenticated members. Unauthenticated visitors are automatically redirected to `/login?callbackUrl=...` and returned safely post-login.
   - Private route `/profile` & `/profile/edit`: Readers can view their membership statistics, active loans, and return volumes.

7. **Atomic, Race-Condition-Safe Borrowing**:
   - High-concurrency inventory decrement via MongoDB atomic updates (`$inc: { available_quantity: -1 }` with `{ available_quantity: { $gt: 0 } }`).
   - Immediate prevention of duplicate active loans for the same user and volume.
   - Dedicated book return workflow restoring stock count to the library.

8. **User Profile Management**:
   - Profile update powered by official Better Auth client method `authClient.updateUser({ name, image })`.
   - Real-time avatar preview and navbar session synchronization.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Server Components, Turbopack) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS v4 & DaisyUI v5 |
| **Authentication** | Better Auth v1.7 (MongoDB Adapter, Google Social Provider) |
| **Database** | MongoDB 7+ (Native Driver with Connection Pooling) |
| **Interactive UI** | Swiper.js v14 |
| **Form Management** | React Hook Form & Zod Schema Validation |
| **Notifications** | Sonner Toast Library |
| **Icons** | Lucide React |
| **Testing** | Node.js Built-in Test Runner (`node:test`, `node:assert`, `tsx`) |

---

## 📦 Installed Packages

```json
{
  "dependencies": {
    "@hookform/resolvers": "^6.0.2",
    "better-auth": "^1.7.14",
    "clsx": "^2.1.1",
    "daisyui": "^5.7.50",
    "lucide-react": "^1.64.0",
    "mongodb": "^7.7.0",
    "next": "16.4.3",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "react-hook-form": "^7.91.0",
    "sonner": "^2.0.8",
    "swiper": "^14.3.0",
    "tailwind-merge": "^3.7.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@tailwindcss/turbopack": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.4.3",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
```

---

## 📋 Prerequisites

- **Node.js**: `v20.0.0` or higher (Tested on `v24.12.0`)
- **npm**: `v10.0.0` or higher (Tested on `v11.11.0`)
- **MongoDB**: A running local MongoDB instance (`mongodb://127.0.0.1:27017/readnest`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string.

---

## 🚀 Installation & Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/online-book-borrowing-platform.git
cd online-book-borrowing-platform
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and define the required variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/readnest?retryWrites=true&w=majority

# Better Auth Secret (Minimum 32 characters)
BETTER_AUTH_SECRET=readnest_secure_random_production_secret_32chars_min
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth Credentials (Optional for local email/password testing)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 3. Seed MongoDB Book Collection

The application includes an idempotent seed script that populates 15 books across Story, Tech, and Science:

```bash
npm run db:seed
```

*(Note: If you start the app without manually running the seed command, the server will automatically detect an empty collection and seed the initial dataset on first visit).*

---

## 🔑 Google OAuth Setup (Optional)

To enable Google Social Sign-In:
1. Visit the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or select a project.
3. In **APIs & Services** > **Credentials**, click **Create Credentials** > **OAuth client ID**.
4. Set Application Type to **Web application**.
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://your-production-app.vercel.app` (when deployed)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-app.vercel.app/api/auth/callback/google`
7. Copy the generated **Client ID** and **Client Secret** into your `.env.local`.

---

## 💻 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `http://localhost:3000` |
| `npm run build` | Compiles an optimized production build |
| `npm run start` | Boots the compiled production server |
| `npm run lint` | Runs ESLint analysis across codebase |
| `npm test` | Executes the 22 automated unit & integration test suites |
| `npm run db:seed` | Populates or updates the MongoDB books collection idempotently |

---

## 🧪 Automated Testing

Run the test suite verifying validations, borrowing concurrency, duplicate prevention, and search filtering:

```bash
npm test
```

### Test Coverage Highlights:
- **`tests/validations.test.ts`**: Verifies Zod validation rules for registration, password strength, email schemas, photo URLs, profile updates, and borrowing inputs.
- **`tests/borrow-logic.test.ts`**: Verifies atomic inventory decrement, zero-stock rejection, active loan duplicate prevention, and return restoration.
- **`tests/catalog-filter.test.ts`**: Verifies case-insensitive search, combined genre filter logic, and pagination offset calculations.

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Import your repository.
4. In the **Environment Variables** panel, add:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `BETTER_AUTH_SECRET`: A generated 32-character random string.
   - `BETTER_AUTH_URL`: Your Vercel production URL (e.g., `https://readnest-library.vercel.app`).
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production URL.
   - `GOOGLE_CLIENT_ID`: (If Google login is enabled).
   - `GOOGLE_CLIENT_SECRET`: (If Google login is enabled).
5. In your MongoDB Atlas Dashboard:
   - Go to **Network Access** and add `0.0.0.0/0` (Allow Access from Anywhere) to permit Vercel serverless connections.
6. Click **Deploy**.

---

## 📄 License & Attribution

Developed for **Category-A8-Mango** as a modern, production-quality digital library platform. All book cover images are sourced via high-resolution Unsplash photography.
