# Skill Swaper Backend - Login/Register Only

A simplified Node.js/Express backend API for user authentication (login and register).

## 🚀 Features

- **User Registration**: Create new user accounts
- **User Login**: Authenticate users with JWT tokens
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: Request validation using express-validator
- **MongoDB**: Database storage with Mongoose ODM

## 📁 Project Structure

```
backend/
├── models/
│   └── User.js              # User model with authentication
├── routes/
│   └── auth.js              # Authentication routes (login/register)
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/skill_swaper
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication Routes

#### Register User
- **URL**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "location": "New York, NY",
    "profilePhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  }
  ```

#### Login User
- **URL**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

#### Health Check
- **URL**: `GET /health`
- **Response**: Server status

## 🧪 Testing with Postman

### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "location": "New York, NY",
  "profilePhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

### Login User
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

## 📊 User Model Fields

- `username` (required, unique)
- `email` (required, unique)
- `password` (required, hashed)
- `firstName` (required)
- `lastName` (required)
- `location` (optional)
- `profilePhoto` (optional, base64 format)
- `isActive` (default: true)
- `createdAt` (auto-generated)
- `updatedAt` (auto-generated)

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS enabled
- Error handling

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon 