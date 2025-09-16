
const isAdmin = (req, res, next) => {
  try {
  
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in."
      });
    }

    
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only."
      });
    }

   
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({
      success: false,
      message: "Server error in admin middleware"
    });
  }
};

module.exports = { isAdmin };

