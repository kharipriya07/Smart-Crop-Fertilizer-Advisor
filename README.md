# 🌿 GardenGuru — Smart Crop & Fertilizer Advisor

A full-stack web application that helps beginners grow crops at home (pots, balconies, garden beds, indoors) with personalized fertilizer recommendations, multilingual support, and step-by-step care guides.

## Tech Stack
- **Frontend**: React 18 + Vite (run with `npm run dev`)
- **Backend**: Spring Boot 3.2 (Java 17)
- **Database**: MySQL (Aiven cloud)
- **Auth**: Spring Security + JWT
- **ORM**: Spring Data JPA
- **Build**: Maven

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend starts at: `http://localhost:8080`

> The database tables and seed data (crops + fertilizers) are auto-created on first run via JPA `ddl-auto=update` and `data.sql`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: `http://localhost:5173`

---

## 📁 Project Structure

```
garden-advisor/
├── backend/
│   ├── src/main/java/com/gardenadvisor/
│   │   ├── config/          # Security, CORS, AppConfig
│   │   ├── controller/      # Auth, Crop, Fertilizer, Recommendation
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── model/           # User, Crop, Fertilizer, UserCropHistory
│   │   ├── repository/      # JPA repositories
│   │   ├── security/        # JWT filter + utility
│   │   └── service/         # AuthService, RecommendationService
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql          # Seed data for crops + fertilizers
│
└── frontend/
    ├── src/
    │   ├── components/       # Navbar, RecommendationResult
    │   ├── context/          # AuthContext (global state)
    │   ├── i18n/             # i18next setup + translations (EN/HI/TE/TA)
    │   ├── pages/            # Home, Advisor, Research, Login, Register, History
    │   └── services/         # api.js (axios)
    ├── .env                  # VITE_API_BASE_URL
    └── vite.config.js
```

---

## 🌍 Supported Languages
- English (en)
- Hindi (hi) — हिन्दी
- Telugu (te) — తెలుగు
- Tamil (ta) — தமிழ்
- Kannada (kn) — ಕನ್ನಡ
- Marathi (mr) — मराठी

Change language via the navbar language selector. Saved to your account.

---

## 🔌 API Endpoints

### Auth (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| PUT | `/api/auth/language?language=hi` | Update preferred language |

### Crops (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crops/public/all` | All crops |
| GET | `/api/crops/public/search?query=tomato` | Search crops |
| GET | `/api/crops/public/space/POTS` | Crops by space type |

### Fertilizers (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fertilizers/public/all` | All fertilizers |
| GET | `/api/fertilizers/public/for-crop?cropName=Tomato` | Fertilizers for crop |

### Recommendations (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations` | Get crop recommendation |
| GET | `/api/recommendations/history` | User's history |

---

## 🗄️ Database Tables (auto-created)
- `users` — registration + language preference
- `crops` — 15 pre-seeded Indian home garden crops
- `fertilizers` — 10 pre-seeded fertilizers with full NPK data
- `user_crop_history` — saved recommendations per user

---

## ⚙️ Environment

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://mysql-224c4940-anurag-9dba.l.aivencloud.com:16389/defaultdb?sslMode=REQUIRED
spring.datasource.username=avnadmin
password=YOUR_DB_PASSWORD
app.jwt.secret=GardenAdvisorSecretKey2024SuperSecureKeyForJWT
app.jwt.expiration=86400000
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🚢 Deployment (Render)

### Backend
1. New Web Service → Connect your repo
2. Build: `cd backend && mvn clean package -DskipTests`
3. Start: `java -jar backend/target/garden-advisor-0.0.1-SNAPSHOT.jar`
4. Add env vars for `SPRING_DATASOURCE_URL`, etc.

### Frontend
1. New Static Site → Connect your repo
2. Root: `frontend`
3. Build: `npm install && npm run build`
4. Publish: `dist`
5. Set `VITE_API_BASE_URL` to your Render backend URL

---

## 🐛 Common Issues

**MySQL SSL error?**
Make sure URL uses `sslMode=REQUIRED` (camelCase), not `ssl-mode=REQUIRED`.

**Frontend can't reach backend?**
Check CORS in `application.properties` — add your frontend URL.

**Tables not created?**
Set `spring.jpa.hibernate.ddl-auto=create` on first run, then change back to `update`.
