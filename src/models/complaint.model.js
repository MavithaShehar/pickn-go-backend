// models/complaint.model.js
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const { createAlert } = require('../services/alert.service');

const complaintSchema = new mongoose.Schema({
  complaintID: {
    type: String,
    required: true,
    unique: true,
    default: () => `C-${nanoid(6).toUpperCase()}`
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'rejected', 'resolved'],
      message: 'Status must be: pending, processing, rejected, or resolved'
    },
    default: 'pending'
  },
  // ⭐ CHANGED: Store Base64 strings instead of file paths
  images: {
    type: [String], // Array of Base64 strings
    validate: {
      validator: function (arr) {
        return arr.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    }
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

complaintSchema.pre('save', function (next) {
  this.lastModified = Date.now();
  next();
});

// Virtuals
complaintSchema.virtual('userName', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  options: { select: 'firstname' }
});

complaintSchema.virtual('userEmail', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  options: { select: 'email' }
});

complaintSchema.post('save', async function (doc) {

      await createAlert({
        customerId: doc.user, // alert for the user who submitted the complaint
        complaintId: doc._id,
        message: `Your complaint "${doc.title}" (ID: ${doc.complaintID}) has been submitted successfully.`
      })
});

complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Complaint', complaintSchema);