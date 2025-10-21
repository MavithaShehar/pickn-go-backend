// utils/paginate.js
async function paginate(model, page = 1, limit = 2, filter = {}, populateOptions = "") {
  try {
    const skip = (page - 1) * limit;

    // Get paginated data
    const data = await model.find(filter)
      .populate(populateOptions)
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await model.countDocuments(filter);

    return {
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = paginate;
