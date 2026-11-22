# Smart Timetable System

A comprehensive web-based timetable management system designed for educational institutions to automate and optimize the creation and management of academic timetables.

## 🚀 Features

### Multi-Role User Management

- **Timetable Manager**: Oversees the entire system, manages departments, HODs, rooms, and generates timetables
- **Head of Department (HOD)**: Manages department-specific courses, classes, lecturers, CAT plans, and special cases
- **Lecturer**: Creates and manages CAT plans, uploads resources, views timetables, and handles special cases
- **Student**: Views timetables, accesses resources, submits special cases, and views CAT plans

### Timetable Generation

- Automated timetable generation using constraint satisfaction algorithms
- Conflict-free scheduling considering rooms, time slots, lecturers, and classes
- Support for multiple rounds and academic periods
- Optimized for course coverage and resource utilization

### Course and Resource Management

- Comprehensive course assignment system
- CAT (Continuous Assessment Test) plan management
- Resource sharing (PDFs, documents, slides, videos)
- Special case handling for retakes and reassessments

### Department and Class Management

- Hierarchical department structure
- Class-year organization
- Lecturer assignment and management
- Room allocation and management

## 🏗️ Architecture

The system follows a microservices architecture with three main components:

### Backend (Node.js/Express)

- RESTful API server built with Express.js and TypeScript
- Database ORM using Prisma with PostgreSQL
- JWT-based authentication and authorization
- File upload handling with Multer
- Comprehensive API endpoints for all system operations

### Frontend (React)

- Modern React application with TypeScript
- Material-UI component library for consistent design
- Role-based routing and protected pages
- Responsive design for desktop and mobile access

### Timetable Engine (Python/FastAPI)

- Constraint satisfaction solver for timetable generation
- FastAPI web framework for high-performance API
- Integration with PostgreSQL database
- Optimized algorithms for complex scheduling constraints

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **File Upload**: Multer
- **CORS**: cors middleware

### Frontend

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Date Handling**: date-fns

### Timetable Engine

- **Framework**: FastAPI
- **Language**: Python
- **Database**: PostgreSQL (psycopg2)
- **Constraints**: python-constraint
- **ASGI Server**: Uvicorn
- **Data Validation**: Pydantic

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-timetable
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/smart_timetable"
JWT_SECRET="your-jwt-secret-key"
PORT=5000
```

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Timetable Engine Setup

```bash
cd ../timetable-engine
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 5. Database Setup

Ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE smart_timetable;
```

## 🎯 Usage

### Starting the Services

1. **Backend Server**:

```bash
cd backend
npm run dev
```

Server will run on http://localhost:5000

2. **Frontend Application**:

```bash
cd frontend
npm run dev
```

Application will run on http://localhost:5173

3. **Timetable Engine**:

```bash
cd timetable-engine
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
python src/main.py
```

Engine will run on http://localhost:8000

### Accessing the Application

1. Open http://localhost:5173 in your browser
2. Register as a student or login with existing credentials
3. Navigate through the role-based dashboards

### Default Users

- Create users through the registration system or database seeding
- Timetable Manager can create HOD accounts
- HODs can create lecturer accounts
- Students can self-register

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Change password

### Public Endpoints

- `GET /api/public/departments` - Get all departments
- `GET /api/public/courses` - Get all courses

### Department Management (Manager)

- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Course Management

- `GET /api/courses` - Get courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Timetable Generation

- `POST /api/timetable/generate` - Generate timetable for a round
- `GET /api/timetable/:roundId` - Get timetable for a round

### CAT Plans

- `GET /api/cat-plans` - Get CAT plans
- `POST /api/cat-plans` - Create CAT plan
- `PUT /api/cat-plans/:id` - Update CAT plan

### Special Cases

- `GET /api/special-cases` - Get special cases
- `POST /api/special-cases` - Submit special case
- `PUT /api/special-cases/:id` - Update special case status

### Resources

- `GET /api/resources` - Get resources
- `POST /api/resources` - Upload resource
- `GET /api/resources/download/:id` - Download resource

## 🗄️ Database Schema

### Core Entities

- **Users**: System users with roles (Manager, HOD, Lecturer, Student)
- **Departments**: Academic departments with HOD assignments
- **Classes**: Student groups organized by year and department
- **Courses**: Academic courses with credits and types
- **CourseAssignments**: Links courses to lecturers and classes
- **Rooms**: Physical locations for sessions
- **TimeSlots**: Time periods for scheduling
- **Rounds**: Academic periods (semesters/terms)
- **Sessions**: Individual timetable entries

### Additional Features

- **CATPlans**: Continuous assessment test plans
- **SpecialCases**: Student special requests (retakes, etc.)
- **Resources**: File uploads for course materials

### Key Relationships

- Users belong to departments and classes (role-dependent)
- Courses are assigned to lecturers for specific classes
- Sessions link all scheduling components together
- Resources are associated with courses and classes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure database migrations are properly tested

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**Note**: This system is designed for educational institutions and may require customization for specific organizational needs.
