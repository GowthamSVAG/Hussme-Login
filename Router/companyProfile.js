const express = require("express");
const router = express.Router();
const CompanyProfile = require("../model/CompanyProfile");
const authMiddleware = require("../middleware");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create or Update Company Profile with file upload
router.post("/update-company-profile", authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user._id; 
    const { companyName, industry, email, phone, website, address, city, state, zip, country } = req.body;

    // Get file path if an image was uploaded
    let logoPath = null;
    if (req.file) {
      logoPath = `/api/company/uploads/${req.file.filename}`;
    }

    // Check if profile already exists
    let companyProfile = await CompanyProfile.findOne({ userId });

    // If updating profile and a new logo is uploaded, delete the old logo file
    if (companyProfile && companyProfile.logo && logoPath) {
      const oldLogoFilename = companyProfile.logo.split('/').pop();
      const oldLogoPath = path.join(__dirname, '../uploads', oldLogoFilename);
      
      // Check if file exists before attempting to delete
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    if (companyProfile) {
      // Update existing profile
      companyProfile = await CompanyProfile.findOneAndUpdate(
        { userId },
        { 
          companyName, 
          industry, 
          email, 
          phone, 
          website, 
          address, 
          city, 
          state, 
          zip, 
          country,
          // Only update logo if a new one was uploaded
          ...(logoPath && { logo: logoPath })
        },
        { new: true }
      );
    } else {
      // Create new profile
      companyProfile = new CompanyProfile({
        userId,
        companyName,
        industry,
        email,
        phone,
        website,
        address,
        city,
        state,
        zip,
        country,
        logo: logoPath,
      });
      await companyProfile.save();
    }

    res.status(200).json({ message: "Company profile saved successfully", companyProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create or Update Company Profile with base64 image
router.post("/update-company-profile-base64", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; 
    const { companyName, industry, email, phone, website, address, city, state, zip, country, logo } = req.body;

    // Check if profile already exists
    let companyProfile = await CompanyProfile.findOne({ userId });

    if (companyProfile) {
      // Update existing profile
      companyProfile = await CompanyProfile.findOneAndUpdate(
        { userId },
        { companyName, industry, email, phone, website, address, city, state, zip, country, logo },
        { new: true }
      );
    } else {
      // Create new profile
      companyProfile = new CompanyProfile({
        userId,
        companyName,
        industry,
        email,
        phone,
        website,
        address,
        city,
        state,
        zip,
        country,
        logo,
      });
      await companyProfile.save();
    }

    res.status(200).json({ message: "Company profile saved successfully", companyProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Company Profile for Logged-in User
router.get("/get-company-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; 
    const companyProfile = await CompanyProfile.findOne({ userId });

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.status(200).json(companyProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
