const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema({
  rollNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  class: {
    type: Number,
    required: true
  },
  studentName: {
    type: String,
    required: true,
  },
  // Marks are optional because teacher uploads different FA's on different days
  FA1: {
    type: Number,
    default: null,
  },
  FA2: {
    type: Number,
    default: null,
  },
  FA3: {
    type: Number,
    default: null,
  },
  FA4: {
    type: Number,
    default: null,
  },

  // Optional remarks
  teacherRemarks: {
    type: String,
    default: "",
  },
  parentRemarks: {
    type: String,
    default: "",
  }
});

module.exports = mongoose.model("Assessment", assessmentSchema);
