const User = require("../models/user.model");
const Vehicle = require("../models/vehicle.model");
const Image = require("../models/image.model");

// 1️⃣ Upload Profile Photo by userId
exports.uploadProfilePhotoById = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profilePhoto = req.file.path;

    // Save image in Image collection
    const image = await Image.create({
      path: profilePhoto,
      type: "profile",
      user: userId,
    });

    // Update user's profilePhoto reference
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: image._id },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      user: updatedUser,
      image,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2️⃣ Upload Multiple Vehicle Images by vehicleId
exports.uploadVehicleImagesById = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Save each image in Image collection
    const images = await Promise.all(
      req.files.map((file) =>
        Image.create({
          path: file.path,
          type: "vehicle",
          vehicle: vehicleId,
        })
      )
    );

    // Save references to vehicle document
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { $push: { images: images.map((img) => img._id) } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Vehicle images uploaded successfully",
      vehicle: updatedVehicle,
      images,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
