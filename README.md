
# techtalks-career-mentor

Career Mentor platform project for Group D.

## Teams
- Khalil AL Youssef
- Hiba Yahya Mehrez
- Chaza Raed Mohammad
- Malak Faour

# 🚀 Career Mentor AI – Setup Guide

## 📦 1. Clone the Repository

```bash
git clone https://github.com/KhalilCodely/techtalks-career-mentor.git
cd techtalks-career-mentor
git checkout feature/setup-database
```

---

## 📥 2. Install Dependencies

```bash
npm install
```

---

## 🔐 3. Setup Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Then open `.env` and update:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/career_mentor"
```

👉 Replace:

* `USER` → your PostgreSQL username
* `PASSWORD` → your PostgreSQL password

---

## 🗄️ 4. Setup PostgreSQL Database

Make sure PostgreSQL is installed and running.

Create the database:

```sql
CREATE DATABASE career_mentor;
```

---

## ⚙️ 5. Run Prisma Migrations

```bash
npx prisma migrate dev
```

👉 This will:

* Create all tables
* Sync database with schema

---

## 🧠 6. Generate Prisma Client

```bash
npx prisma generate
```

---

## 🔍 7. (Optional) Open Database UI

```bash
npx prisma studio
```

👉 If Studio fails, use pgAdmin instead.

---

## ▶️ 8. Run the Project

```bash
npm run dev
```

---

## 👥 Team Notes

* Do NOT commit `.env`
* Always pull latest changes before working:

  ```bash
  git pull
  ```
* After pulling schema changes, run:

  ```bash
  npx prisma migrate dev
  ```

---

## 🛠️ Troubleshooting

### ❌ Database connection error

* Check PostgreSQL is running
* Verify `DATABASE_URL`

### ❌ No tables found

```bash
npx prisma migrate dev
```

### ❌ Prisma issues

```bash
npx prisma generate
```

---

## ✅ You’re Ready!

You can now start developing features using Prisma and Next.js 🚀
