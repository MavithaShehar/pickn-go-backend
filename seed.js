const mongoose = require("mongoose");
const User = require("./src/models/user.model");
const Vehicle = require("./src/models/vehicle.model");
const Review = require("./src/models/review.model");

mongoose.connect("mongodb://localhost:27017/pickngo");

async function seed() {
  const owner = await User.create({
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "0712345678",
    email: "john@example.com",
    role: "owner",
    password: "123456" 
  });

  const vehicle = await Vehicle.create({
    ownerId: owner._id,
    title: "Toyota Prius",
    description: "Eco-friendly car",
    pricePerKm: 2,
    pricePerDay: 50,
    year: 2020,
    seats: 4,
    status: "available",
    location: "Colombo"
  });

  await Review.create({
    bookingId: new mongoose.Types.ObjectId(),
    vehicleId: vehicle._id,
    rating: 5,
    comment: "Excellent car, very clean!"
  });

  console.log("Dummy data inserted!");
  mongoose.disconnect();
}

seed();
