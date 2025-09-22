const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");

class ReportService {
    // Full vehicle report
    static async generateVehicleReport() {
        const vehicles = await Vehicle.find()
            .populate("ownerId", "name")
            .populate("vehicleTypeId", "name")
            .populate("fuelTypeId", "name");

        const mappedVehicles = vehicles.map(v => ({
            ...v._doc,
            ownerName: v.ownerId?.name || "N/A",
            vehicleType: v.vehicleTypeId?.name || "N/A",
            fuelType: v.fuelTypeId?.name || "N/A",
        }));

        const totalVehicles = vehicles.length;
        const availableVehicles = vehicles.filter(v => v.status === "available").length;
        const unavailableVehicles = vehicles.filter(v => v.status === "unavailable").length;

        return { totalVehicles, availableVehicles, unavailableVehicles, vehicles: mappedVehicles };
    }

    // Vehicle report filtered by status
    static async generateVehicleReportByStatus(status) {
        const vehicles = await Vehicle.find({ status })
            .populate("ownerId", "name")
            .populate("vehicleTypeId", "name")
            .populate("fuelTypeId", "name");

        const mappedVehicles = vehicles.map(v => ({
            ...v._doc,
            ownerName: v.ownerId?.name || "N/A",
            vehicleType: v.vehicleTypeId?.name || "N/A",
            fuelType: v.fuelTypeId?.name || "N/A",
        }));

        return { status, total: vehicles.length, vehicles: mappedVehicles };
    }

    static async generateUserReport() {
        const users = await User.find(
            { role: { $in: ["customer"] } },
            "-password -resetOTP -resetOTPExpires" // exclude sensitive fields
        );

        const totalUsers = users.length;
        const totalCustomers = users.filter(u => u.role === "customer").length;


        return { totalUsers, totalCustomers, users };
    }

    // Generate Vehicle Owners Report
    static async getVehicleOwnersReport() {
        return await Vehicle.find()
            .populate("ownerId", "firstName lastName email phoneNumber role status")
            .populate("vehicleTypeId", "name")
            .populate("fuelTypeId", "name")
            .lean();
    }

}

module.exports = ReportService;
