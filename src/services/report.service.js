const Vehicle = require("../models/vehicle.model");
const User = require("../models/user.model");

class ReportService {



    // Users Report
    static async generateUserReport() {
        const users = await User.find(
            { role: { $in: ["customer"] } },
            "-password -resetOTP -resetOTPExpires" // exclude sensitive fields
        ).lean(); // lean() gives plain JS objects, easier to transform

        // Transform users: add "name" and "address"
        const transformedUsers = users.map(u => ({
            ...u,
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
            address: [
                u.addressLine1,
                u.addressLine2,
                u.postalCode
            ].filter(Boolean).join(", ") || "N/A"
        }));

        const totalUsers = transformedUsers.length;
        const totalCustomers = transformedUsers.filter(u => u.role === "customer").length;

        return { totalUsers, totalCustomers, users: transformedUsers };
    }


    // Generate Vehicle Owners Report
    static async getVehicleOwnersReport() {
        const vehicles = await Vehicle.find()
            .populate("ownerId", "firstName lastName email phoneNumber addressLine1 addressLine2 postalCode status role") // include address
            .lean();

        // Map the vehicles to simplified objects for the report
        const report = vehicles.map(v => ({
            vehicleName: v.title || "N/A",
            ownerName: v.ownerId ? `${v.ownerId.firstName} ${v.ownerId.lastName}` : "N/A",
            ownerEmail: v.ownerId ? v.ownerId.email || "N/A" : "N/A",
            ownerPhone: v.ownerId ? v.ownerId.phoneNumber || "N/A" : "N/A",
            ownerAddress: v.ownerId
                ? [v.ownerId.addressLine1, v.ownerId.addressLine2, v.ownerId.postalCode]
                    .filter(Boolean)
                    .join(",\n")
                : "N/A",
            status: v.status || "N/A",
        }));

        return report;
    }


    // Full vehicle report
    static async generateVehicleReport() {
        // Fetch vehicles with owner, type, fuel info
        const vehicles = await Vehicle.find()
            .populate("ownerId", "firstName lastName email phoneNumber addressLine1 addressLine2 postalCode status role")
            .populate("vehicleTypeId", "name") // vehicle type name
            .populate("fuelTypeId", "name") // fuel type name
            .select("title pricePerKm pricePerDay status") // vehicle fields needed
            .lean();

        // Map vehicles to include formatted owner info and vehicle type/fuel
        const formattedVehicles = vehicles.map(v => {
            const owner = v.ownerId || {};
            const ownerName = owner.firstName && owner.lastName ? `${owner.firstName} ${owner.lastName}` : "N/A";
            const ownerContact = owner.email || owner.phoneNumber
                ? `${owner.email || ""}${owner.email && owner.phoneNumber ? " | " : ""}${owner.phoneNumber || ""}`
                : "N/A";
            const ownerAddress = owner.addressLine1 || owner.addressLine2 || owner.postalCode
                ? [owner.addressLine1, owner.addressLine2, owner.postalCode].filter(Boolean).join(",\n")
                : "N/A";

            return {
                title: v.title || "N/A",
                vehicleType: v.vehicleTypeId?.name || "N/A",
                fuelType: v.fuelTypeId?.name || "N/A",
                pricePerKm: v.pricePerKm ?? "-",
                pricePerDay: v.pricePerDay ?? "-",
                status: v.status || "N/A",
                ownerName,
                ownerEmail: owner.email || "-",
                ownerPhone: owner.phoneNumber || "-",
                ownerAddress
            };
        });

        // Compute totals for summary
        const totalVehicles = formattedVehicles.length;
        const availableVehicles = formattedVehicles.filter(v => v.status.toLowerCase() === "available").length;
        const unavailableVehicles = totalVehicles - availableVehicles;

        return {
            vehicles: formattedVehicles,
            totalVehicles,
            availableVehicles,
            unavailableVehicles
        };
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


}

module.exports = ReportService;
