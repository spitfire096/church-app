# church-app
# wsf-wcito-devops Visitor Management System

A modern web application for managing first-time visitors and follow-ups, built with Next.js and Node.js.

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context
- **Authentication**: Custom JWT-based auth
- **Data Fetching**: Native fetch API
- **Form Handling**: React Hook Form
- **Components**: Custom components with accessibility features

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Zod
- **Error Handling**: Custom middleware

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- MongoDB instance

### Environment Setup

#### Frontend (.env.local)

#### Backend (.env)

```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/first-assembly
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/spitfire096/church-app.git
cd first-assembly
```

2. Install Frontend Dependencies
```bash
cd FA-frontend
npm install
```

3. Install Backend Dependencies
```bash
cd ../FA-backend
npm install
```

4. Start Development Servers

Frontend:
```bash
cd FA-frontend
npm run dev
```

Backend:
```bash
cd FA-backend
npm run dev
```

## 🏛️ Project Structure

### Frontend (FA-frontend)
```
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts
│   ├── lib/                 # Utility functions
│   └── types/              # TypeScript types
├── public/                  # Static assets
└── tailwind.config.js      # Tailwind configuration
```

### Backend (FA-backend)
```
├── src/
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── utils/            # Utility functions
├── config/               # Configuration files
└── tests/               # Test files
```

## 🔐 Authentication

The application uses JWT-based authentication:
- Tokens are stored in localStorage and HTTP-only cookies
- Protected routes require valid JWT
- Automatic token refresh mechanism
- Role-based access control

## 🔄 API Routes

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

### First Timers
- `GET /api/first-timers`
- `POST /api/first-timers`
- `GET /api/first-timers/:id`
- `PUT /api/first-timers/:id`
- `DELETE /api/first-timers/:id`

### Follow-ups
- `GET /api/follow-ups`
- `POST /api/follow-ups`
- `PUT /api/follow-ups/:id`
- `DELETE /api/follow-ups/:id`

## 🧪 Testing

```bash
# Run frontend tests
cd FA-frontend
npm test

# Run backend tests
cd FA-backend
npm test
```

## 📦 Deployment

### Frontend
The frontend can be deployed to Vercel:
```bash
cd FA-frontend
vercel
```

### Backend
The backend can be deployed to any Node.js hosting service:
1. Build the application: `npm run build`
2. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 👥 Authors

- https://github.com/spitfire096/church-app.git

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the robust database
- All friends in wsf-wcito-devops team
