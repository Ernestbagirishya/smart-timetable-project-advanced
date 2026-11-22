# Smart Timetable System - Complete Setup Guide

This guide provides detailed, step-by-step instructions to set up and run the Smart Timetable System on a new PC. Follow each section carefully to ensure a successful installation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Clone the Repository](#clone-the-repository)
4. [Database Setup](#database-setup)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Timetable Engine Setup](#timetable-engine-setup)
8. [Environment Configuration](#environment-configuration)
9. [Running the Application](#running-the-application)
10. [Accessing the Application](#accessing-the-application)
11. [Troubleshooting](#troubleshooting)
12. [Additional Notes](#additional-notes)

## Prerequisites

Before starting, ensure you have the following software installed on your system:

### Required Software

1. **Node.js** (v18 or higher)

   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Python** (v3.8 or higher)

   - Download from: https://python.org/
   - Verify installation: `python --version` or `python3 --version`

3. **PostgreSQL** (v12 or higher)

   - Download from: https://postgresql.org/
   - During installation, remember the password you set for the postgres user
   - Verify installation: `psql --version`

4. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Optional but Recommended

1. **Visual Studio Code** (IDE)

   - Download from: https://code.visualstudio.com/
   - Install extensions: TypeScript, React, Python

2. **Postman** (for API testing)
   - Download from: https://postman.com/

## System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Disk Space**: Minimum 2GB free space
- **Internet Connection**: Required for downloading dependencies

## Clone the Repository

1. Open your terminal/command prompt
2. Navigate to the directory where you want to store the project:
   ```bash
   cd path/to/your/projects/folder
   ```
3. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

   Replace `<repository-url>` with the actual repository URL.

4. Enter the project directory:
   ```bash
   cd smart-timetable
   ```

## Database Setup

1. **Start PostgreSQL Service**:

   - **Windows**: Open Services (search for "services.msc"), find "postgresql-x64-xx" and start it
   - **macOS**: `brew services start postgresql` (if installed via Homebrew)
   - **Linux**: `sudo systemctl start postgresql`

2. **Create Database**:

   - Open PostgreSQL command line or pgAdmin
   - Connect as postgres user
   - Run the following SQL command:
     ```sql
     CREATE DATABASE smart_timetable;
     ```

3. **Verify Database Creation**:
   - Connect to the database:
     ```bash
     psql -U postgres -d smart_timetable
     ```
   - If successful, you'll see the PostgreSQL prompt. Type `\q` to exit.

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:

   - Create a new file named `.env` in the backend directory
   - Add the following content (replace with your actual values):
     ```
     DATABASE_URL="postgresql://postgres:your_password@localhost:5432/smart_timetable"
     JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
     PORT=5000
     ```
     **Note**: Replace `your_password` with the password you set during PostgreSQL installation, and choose a strong JWT secret.

4. Generate Prisma client and push database schema:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Verify setup:
   - Check if there are any errors in the terminal
   - The database should now have all required tables

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Verify setup:
   - Check for any installation errors
   - The frontend should be ready to run

## Timetable Engine Setup

1. Navigate to the timetable-engine directory:

   ```bash
   cd ../timetable-engine
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Verify setup:
   - Check for any installation errors
   - The virtual environment should remain activated for running the engine

## Environment Configuration

### Backend Environment Variables

Ensure your `.env` file in the backend directory contains:

```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/smart_timetable"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
```

### Database Connection

Make sure PostgreSQL is running and the database `smart_timetable` exists.

### Firewall Settings

Ensure ports 5000 (backend), 5173 (frontend), and 8000 (timetable engine) are not blocked by your firewall.

## Running the Application

You need to run three services simultaneously. Open three separate terminal windows/command prompts.

### 1. Backend Server

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Expected output: Server running on http://localhost:5000

### 2. Frontend Application

1. Open a new terminal and navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Expected output: Application running on http://localhost:5173

### 3. Timetable Engine

1. Open a new terminal and navigate to timetable-engine directory:

   ```bash
   cd timetable-engine
   ```

2. Activate virtual environment:

   - **Windows**: `venv\Scripts\activate`
   - **macOS/Linux**: `source venv/bin/activate`

3. Start the engine:

   ```bash
   python src/main.py
   ```

4. Expected output: Server running on http://localhost:8000

## Accessing the Application

1. Open your web browser
2. Navigate to: http://localhost:5173
3. You should see the Smart Timetable System login page

### Default Access

- **Student Registration**: Use the registration form to create a student account
- **Manager Access**: Initially, you may need to create manager accounts through database seeding or contact your system administrator

## Troubleshooting

### Common Issues

1. **Port Already in Use**:

   - Change the port in `.env` file or stop the conflicting service
   - Find process using port: `netstat -ano | findstr :PORT` (Windows) or `lsof -i :PORT` (macOS/Linux)

2. **Database Connection Error**:

   - Ensure PostgreSQL is running
   - Verify DATABASE_URL in `.env` file
   - Check if database `smart_timetable` exists

3. **Prisma Errors**:

   - Run `npx prisma generate` again
   - Check database connection

4. **Node.js/Python Version Issues**:

   - Verify versions: `node --version`, `python --version`
   - Update if necessary

5. **Virtual Environment Issues**:

   - Deactivate and reactivate: `deactivate` then `source venv/bin/activate`
   - Recreate virtual environment if needed

6. **Permission Errors**:
   - Run terminal as administrator (Windows) or use `sudo` (macOS/Linux)
   - Check file permissions on project directory

### Getting Help

- Check the main README.md for additional information
- Review error messages carefully - they often provide specific solutions
- Ensure all prerequisites are correctly installed
- Try restarting your computer if issues persist

## Additional Notes

- **Development Mode**: All services run in development mode with hot reloading
- **Production Deployment**: Additional configuration required for production use
- **Security**: Change default passwords and JWT secrets before production deployment
- **Backup**: Regularly backup your database
- **Updates**: Pull latest changes from repository: `git pull`

---

**Congratulations!** You have successfully set up the Smart Timetable System. If you encounter any issues not covered in this guide, please refer to the main README.md or create an issue in the repository.
