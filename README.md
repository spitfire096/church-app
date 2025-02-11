# First Assembly Church Visitor Management System

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
- **CI/CD**: Jenkins Pipeline
- **Quality**: SonarQube
- **Package Registry**: Nexus Repository

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
- Jenkins (for CI/CD)
- SonarQube (for code quality)
- Nexus Repository (for package management)

### Environment Setup

Create .env.local in the frontend directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

Create .env in the backend directory:
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/first-assembly
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Installation & Development

1. Clone the repository
```bash
git clone https://github.com/spitfire096/church-app.git
cd church-app
```

2. Install Frontend Dependencies
```bash
cd FA-frontend
npm install
npm run dev
```

3. Install Backend Dependencies
```bash
cd ../FA-backend
npm install
npm run dev
```

## 📦 Features

- **First Timer Management**
  - Registration with detailed information
  - Gender tracking
  - Postal code for location analysis
  - Student status tracking
  - Spiritual journey tracking (born again, water baptism)
  - Prayer request handling

- **Follow-up System**
  - Automated task creation
  - Status tracking
  - Email notifications
  - Progress monitoring

- **Dashboard**
  - Real-time statistics
  - Recent activities
  - Pending tasks
  - Performance metrics

## 🔄 CI/CD Pipeline

The project uses Jenkins for continuous integration and deployment:
- Automated builds
- SonarQube analysis
- Nexus artifact storage
- Automated testing
- Quality gate enforcement

## 📊 Quality Metrics

- SonarQube for code quality analysis
- Jest for unit testing
- E2E testing with Cypress
- Continuous monitoring

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the list of contributors.
