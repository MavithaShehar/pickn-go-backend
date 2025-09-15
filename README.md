# 🚗 PicknGo - Rent a Car System (Backend)

![Development Status](https://img.shields.io/badge/Status-Under%20Development-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express.js](https://img.shields.io/badge/Express.js-4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)

## 📋 Project Overview

**PicknGo** is a comprehensive car rental management system backend developed by **Gamage Recruiters - Project 04 Group**. This RESTful API provides robust functionality for managing vehicle rentals, user authentication, booking systems, and payment processing.

> ⚠️ **Note**: This project is currently under active development.

## 🏗️ System Architecture

The system is built around a well-designed database schema that includes:

- **User Management** (Customers, Admins, Owners)
- **Vehicle Management** (Cars, Motorcycles, Vans)
- **Booking System** (Reservations, Availability)
- **Review & Rating System**
- **Payment Processing**
- **Document Management**

## 🛠️ Tech Stack

- **Runtime**: Node.js (18+)
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **Environment Management**: dotenv

## 📊 Database Schema

Our system follows a comprehensive Entity-Relationship model with the following main entities:

### Core Entities
- **User**: Multi-role user management (Customer, Admin, Owner)
- **Vehicle**: Complete vehicle information with categories
- **Booking**: Reservation and rental management
- **Review**: Customer feedback and rating system
- **Payment**: Transaction processing and records
- **VehicleAvailability**: Real-time availability tracking

### Supporting Entities
- **RentDocument**: Rental agreement management
- **VehicleFeed**: Vehicle listing and information feed

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MavithaShehar/pickn-go-backend.git
   cd pickn-go-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory.

4. **Start the development server**
   ```bash
   npm run dev # for development
   npm start # for production
   ```

## 📁 Project Structure

```
pickn-go-backend/
 ┣ src/
 ┃ ┣ config/           # Configuration files (db, environment, etc.)
 ┃ ┣ controllers/      # Handle HTTP requests/responses
 ┃ ┣ routes/           # Define API routes
 ┃ ┣ services/         # Business logic (separate from controllers)
 ┃ ┣ models/           # Database models (MongoDB, MySQL, etc.)
 ┃ ┣ middlewares/      # Auth, validation, error handling
 ┃ ┣ utils/            # Helper functions (e.g., formatters, validators)
 ┃ ┣ app.js            # Express app setup (middlewares, routes)
 ┃ ┗ server.js         # Entry point (start server)
 ┣ tests/              # Unit and integration tests
 ┣ .env                # Environment variables
 ┣ .gitignore
 ┣ package.json
 ┗ README.md

```

## 📝 Development Status

### ✅ Completed Features
- [ ] User authentication system
- [ ] Basic CRUD operations for vehicles
- [ ] Database schema implementation
- [ ] API route structure

### 🚧 In Progress
- [ ] Booking management system
- [ ] Payment integration
- [ ] Review and rating system
- [ ] Vehicle availability tracking

### 📋 Planned Features
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Mobile app API support
- [ ] Third-party integrations

## 🤝 Contributing

This project is developed by **Gamage Recruiters - Project 04 Group**. 

### Development Workflow
1. Create a feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Submit a pull request

### Code Style
- Use ESLint configuration
- Follow conventional commit messages
- Maintain consistent code formatting

## 📚 Documentation

- [API Documentation](https://documenter.getpostman.com/view/36468384/2sB3HonyNk)

## 🐛 Issues & Support

For bugs, feature requests, or support:
1. Check existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Development Team

**Gamage Recruiters - Project 04 Group**

---

<div align="center">
  <strong>PicknGo Backend API</strong><br>
  Built with ❤️ by Gamage Recruiters Team
</div>
