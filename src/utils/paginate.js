// utils/paginate.js
async function paginate(model, page = 1, limit = 10, filter = {}, populateOptions = []) {
  try {
    const skip = (page - 1) * limit;

    const data = await model
      .find(filter)
      .populate(populateOptions)
      .skip(skip)
      .limit(limit);

    const totalDocuments = await model.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / limit);

    return { data, currentPage: page, totalPages, totalDocuments };
  } catch (err) {
    throw new Error("Pagination failed: " + err.message);
  }
}

module.exports = paginate;
