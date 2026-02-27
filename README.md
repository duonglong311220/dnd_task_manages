# 🎯 DnD Task Manager

Ứng dụng quản lý công việc theo kiểu Kanban (Drag & Drop) với đầy đủ tính năng.

## 📁 Cấu trúc dự án

```
DnD_task_manages/
├── src/               # Frontend - React + TypeScript + Vite
└── backend/           # Backend - Node.js + Express + Prisma + PostgreSQL
```

## 🛠 Công nghệ sử dụng

### Frontend (`/src`)
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **TanStack Query** - Server state & API caching
- **@dnd-kit** - Drag & Drop
- **React Router v6** - Routing
- **React Icons** - Icon library
- **Axios** - HTTP client

### Backend (`/backend`)
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** - Database
- **Prisma ORM** - Database ORM & migrations
- **JWT** (jsonwebtoken) - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Request validation
- **CORS**, **dotenv**

---

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu
- Node.js >= 18
- PostgreSQL >= 14

### 1. Backend

```bash
cd backend
npm install

# Copy và cấu hình file môi trường
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn

# Tạo database & chạy migration
npm run db:migrate

# Seed dữ liệu mẫu (optional)
npm run db:seed

# Chạy dev server (port 3001)
npm run dev
```

### 2. Frontend

```bash
# Tại thư mục gốc
npm install

# Chạy dev server (port 5173)
npm run dev
```

### 3. Truy cập
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Prisma Studio: `cd backend && npm run db:studio`

---

## 📋 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/workspaces` | Lấy danh sách workspace |
| POST | `/api/workspaces` | Tạo workspace mới |
| GET | `/api/workspaces/:id/spaces` | Lấy spaces của workspace |
| GET | `/api/spaces/:id/columns` | Lấy columns của space |
| GET | `/api/columns/:id/tasks` | Lấy tasks của column |
| POST | `/api/tasks` | Tạo task mới |
| PATCH | `/api/tasks/:id` | Cập nhật task |
| DELETE | `/api/tasks/:id` | Xóa task |

---

## 🔐 Tài khoản demo

```
Email: demo@example.com
Password: password123
```



