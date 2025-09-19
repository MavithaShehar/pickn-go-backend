const mongoose = require('mongoose');
const { Schema } = mongoose;
const { COMPLAINT_STATUS } = require('../config/complaint');
const generateComplaintId = require('../utils/generateComplaintId');

const complaintSchema = new Schema({
  complaintID: {
    type: String,
    required: true,
    unique: true,
    default: async function () {
      return await generateComplaintId();
    }
  },

  user: {
    type: Schema.Types.ObjectId,
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
      values: Object.values(COMPLAINT_STATUS),
      message: 'Status must be: pending, processing, rejected, or resolved'
    },
    default: COMPLAINT_STATUS.PENDING
  },

  images: {
    type: [String],
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

// Auto-update lastModified on save
complaintSchema.pre('save', function (next) {
  this.lastModified = Date.now();
  next();
});

// Virtuals for user data (optional, since we populate)
complaintSchema.virtual('userName', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  options: { select: 'firstname' } // Match field in User model
});

complaintSchema.virtual('userEmail', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  options: { select: 'email' }
});

// Serialize virtuals
complaintSchema.set('toJSON', { virtuals: true });
complaintSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Complaint', complaintSchema);