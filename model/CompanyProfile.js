const mongoose = require("mongoose");

const CompanyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Link to the user who owns this profile
    required: true,
    unique: true, // Each user has only one company profile
  },
  companyName: { type: String, required: true },
  industry: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  country: { type: String },
  logo: { type: String }, // Store logo URL
});

module.exports = mongoose.model("CompanyProfile", CompanyProfileSchema);
