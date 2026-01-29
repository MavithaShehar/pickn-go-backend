// models/damageReport.model.js
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const { createAlert } = require('../services/alert.service');

// Realistic damage types used by rental platforms
const DAMAGE_TYPES = [
  'scratch',
  'dent',
  'cracked_windshield',
  'broken_light',
  'flat_tire',
  'interior_stain',
  'missing_part',
  'body_damage',
  'mechanical_issue',
  'other'
];


const damageReportSchema = new mongoose.Schema({
  reportID: {
    type: String,
    required: true,
    unique: true,
    default: () => `DR-${nanoid(8).toUpperCase()}`
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phoneNumber: {  
  type: String,
  required: false // will be auto-filled, so not required on input
},
  damageType: {
    type: String,
    enum: {
      values: DAMAGE_TYPES,
      message: 'Invalid damage type'
    },
    required: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: {
    type: [String],
    validate: {
      validator: function(arr) {
        return arr.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    }
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Under Investigation', 'Awaiting Quote', 'Resolved', 'Closed'],
    default: 'Pending Review'
  },
  dateReported: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

damageReportSchema.post('save', async function (doc) {
      await createAlert({
        bookingId: doc.bookingId,
        vehicleId: doc.vehicleId,
        customerId: doc.customerId,
        damageId: doc._id, // ✅ Include damageId
        message: `Your damage report (ID: ${doc.reportID}) has been submitted successfully.`
      });
});

damageReportSchema.index({ bookingId: 1 });
damageReportSchema.index({ customerId: 1 });
damageReportSchema.index({ status: 1 });

// Export enum for reuse in service/controller
damageReportSchema.statics.DAMAGE_TYPES = DAMAGE_TYPES;

module.exports = mongoose.model('DamageReport', damageReportSchema);