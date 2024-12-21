import express from "express";
import GeneralFeedback from "../models/GeneralFeedback.js";

const router = express.Router();

// Create feedback
router.post("/", async (req, res) => {
  const { feedback, rating, fullName } = req.body;

  // Validate input
  if (!feedback || !rating || !fullName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newFeedback = new GeneralFeedback({ feedback, rating, fullName });
    const savedFeedback = await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback: savedFeedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// Get all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await GeneralFeedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});

// Get feedback by fullName
router.get("/:fullName", async (req, res) => {
  const { fullName } = req.params;

  try {
    const feedbacks = await GeneralFeedback.find({ fullName });
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({ error: "No feedback found for this user" });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

export default router;