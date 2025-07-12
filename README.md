# SkillXchange

SkillXchange is a modern skill swap platform that connects people to exchange skills and learn from each other. The platform features user registration, profile management, skill matching, swap requests, and a beautiful landing page.

---

## Project Structure

```
Skillswap/
  backend/    # Node.js/Express API server
  frontend/   # React client app
```

---

## Features
- User registration and authentication
- Profile creation and editing
- Skill offering and wanting
- Skill swap requests and management
- Dashboard and user search
- Modern, responsive UI with Tailwind CSS
- Toast notifications for feedback
- Landing page with About and Contact sections

---

## Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher)
- MongoDB (local or cloud)

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/PatelDharmik268/Skill_Swaper_oddooptimizer
cd Skillswap
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file or edit env.txt with your MongoDB URI and JWT secret
# Example env.txt:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/skillswap
# JWT_SECRET=your_jwt_secret
npm start
```
- The backend will run on `http://localhost:5000` by default.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
- The frontend will run on `http://localhost:3000` by default.

---

## Dependencies

### Backend
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv

### Frontend
- react
- react-router-dom
- react-toastify
- tailwindcss
- lucide-react

---

## Usage
- Visit `http://localhost:3000` to access the landing page.
- Register a new account or login.
- Create and edit your profile, list your skills, and browse other users.
- Send and manage skill swap requests.

---

## Customization
- To change the favicon/logo, replace `frontend/src/assets/logo.png` and update `frontend/public/index.html` as needed.
- To update backend environment variables, edit `backend/env.txt` or your `.env` file.

---

## License
This project is for educational and hackathon use. Please contact the authors for other uses. 
