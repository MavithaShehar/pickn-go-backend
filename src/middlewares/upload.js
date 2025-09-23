const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Use existing uploads folder -> create "documents" subfolder inside it
const documentsPath = path.join("uploads", "documents");
if (!fs.existsSync(documentsPath)) {
  fs.mkdirSync(documentsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsPath); // store in uploads/documents
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload.fields([
  { name: "idProof", maxCount: 1 },
  { name: "license", maxCount: 1 },
]);
