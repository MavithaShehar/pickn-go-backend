// Complaint Status enum
const COMPLAINT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  REJECTED: 'rejected',
  RESOLVED: 'resolved'
};

// Other app constants can go here
const MAX_IMAGES_PER_COMPLAINT = 5;
const MAX_IMAGE_SIZE_MB = 2;

module.exports = {
  COMPLAINT_STATUS,
  MAX_IMAGES_PER_COMPLAINT,
  MAX_IMAGE_SIZE_MB
};