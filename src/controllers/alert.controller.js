const Alert = require("../models/alert.model");

exports.getCustomerAlerts = async (req, res) => {
    try {
        const customerId = req.user.id; // assuming you have auth middleware

        const alerts = await Alert.find({ customerId })
            .sort({ createdAt: -1 }); // newest first

        res.json({ success: true, alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


exports.markAlertAsRead = async (req, res) => {
    try {
        const customerId = req.user.id;
        const alertId = req.params.id;

        const alert = await Alert.findOne({ _id: alertId, customerId });
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });

        alert.isRead = true;
        await alert.save();

        res.json({ success: true, message: "Alert marked as read", alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

