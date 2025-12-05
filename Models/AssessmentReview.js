const mongoose = require("mongoose");

const faSchema = new mongoose.Schema(
  {
    teacherReview: {
      type: String,
      default: ""
    },
    parentReview: {
      type: String,
      default: ""
    }
  },
  { _id: false } 
);

const assessmentReviewSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: Number,
      required: true,
      unique: true
    },

    class: {
      type: Number,
      required: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    FA1: faSchema,
    FA2: faSchema,
    FA3: faSchema,
    FA4: faSchema
  },
  { timestamps: true }
);

// Collection name: assessment_reviews
module.exports = mongoose.model("AssessmentReview", assessmentReviewSchema);
