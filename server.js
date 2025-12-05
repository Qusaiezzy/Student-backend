const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./Models/User");
const AssessmentReview = require("./Models/AssessmentReview");
const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// CONNECT MONGODB ATLAS
// -----------------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.post("/login", async (req, res) => {
  try {
    const rollNumber = Number(req.body.rollNumber);
    const password = Number(req.body.password);

    console.log("Login Attempt:", rollNumber, password);

    // Step 1: find user only by rollNumber
    const user = await User.findOne({ rollNumber });
    console.log("User from DB:", user);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Step 2: match password separately
    if (user.password !== password) {
      return res.json({
        success: false,
        message: "Wrong password"
      });
    }

    // Step 3: success response
    res.json({
      success: true,
      message: "Login successful",
      role: user.role,
      rollNumber: user.rollNumber
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ success: false, message: "Empty Excel file" });
    }

    const errors = [];
    let inserted = 0;
    let updated = 0;

    for (let row of rows) {
      try {
        const rollNumber = Number(row.rollNumber);
        const studentClass = Number(row.class); 
        const studentName = row.studentName?.trim();

        if (!rollNumber || !studentClass || !studentName) {
          errors.push({ row, error: "Missing required fields" });
          continue;
        }

        const reviewData = {
          rollNumber,
          class: studentClass,
          studentName,

          FA1: {
            teacherReview: row.FA1_teacher || "",
            parentReview: row.FA1_parent || ""
          },

          FA2: {
            teacherReview: row.FA2_teacher || "",
            parentReview: row.FA2_parent || ""
          },

          FA3: {
            teacherReview: row.FA3_teacher || "",
            parentReview: row.FA3_parent || ""
          },

          FA4: {
            teacherReview: row.FA4_teacher || "",
            parentReview: row.FA4_parent || ""
          }
        };

        
        const student = await AssessmentReview.findOne({ rollNumber: rollNumber });

        if (student) {
          await AssessmentReview.updateOne({ rollNumber }, { $set: reviewData });
          updated++;
        } else {
          await AssessmentReview.create(reviewData);
          inserted++;
        }

      } catch (err) {
        errors.push({ row, error: err.message });
      }
    }

    return res.json({
      success: true,
      message: "Excel processed successfully",
      inserted,
      updated,
      errorsCount: errors.length,
      errors
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});




app.get("/student/:rollNumber", async (req, res) => {
  try {
    const rollNumber = Number(req.params.rollNumber);

    const student = await AssessmentReview.findOne({ rollNumber });

    if (!student) {
      return res.json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      student
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
// PUT parent review
app.put("/parent-review", async (req, res) => {
  try {
    const { rollNumber, fa, parentReview } = req.body;

    if (!rollNumber || !fa || !parentReview) {
      return res.status(400).json({
        success: false,
        message: "rollNumber, fa and parentReview are required"
      });
    }
    const updateField = {};
    updateField[`${fa}.parentReview`] = parentReview;

    const updated = await AssessmentReview.findOneAndUpdate(
      { rollNumber },
      { $set: updateField },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: `${fa} Parent Review saved successfully`,
      student: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get("/students/:className", async (req, res) => {
  try {
    const className = req.params.className;

    const students = await AssessmentReview.find({ class: className });

    if (!students.length) {
      return res.status(404).json({ message: "No students found for this class" });
    }

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST teacher review
app.post("/teacher/review", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { rollNumber, fa, teacherReview } = req.body;

    if (!rollNumber || !fa || !teacherReview) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Dynamically build field
    const updateQuery = {};
    updateQuery[`${fa}.teacherReview`] = teacherReview;

    const updatedStudent = await AssessmentReview.findOneAndUpdate(
      { rollNumber: rollNumber },   // ✅ using rollNumber
      { $set: updateQuery },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Teacher review added successfully ✅",
      student: updatedStudent,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});



const port = process.env.port || 5000
app.listen(port, () => console.log("Server running on port",port));
