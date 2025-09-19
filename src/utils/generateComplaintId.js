const Counter = require('../models/counter.model');

async function generateComplaintId() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'complaintId' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  return `C${counter.sequence.toString().padStart(6, '0')}`;
}

module.exports = generateComplaintId;