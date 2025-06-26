import express from "express";
import { ChatRequest } from "../models/chatRequest.model.js";

const router = express.Router();

// ✅ Send a chat request
router.post("/send", async (req, res) => {
  const { sender, receiver } = req.body;

  if (!sender || !receiver) {
    return res.status(400).json({ error: "Sender and receiver are required." });
  }

  try {
    const existing = await ChatRequest.findOne({ sender, receiver });

    if (existing) {
      return res.status(409).json({ message: "Request already sent." });
    }

    const newRequest = new ChatRequest({ sender, receiver });
    await newRequest.save();

    res.status(201).json({ message: "Chat request sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ✅ Respond to a request (accept or reject)
router.post("/respond", async (req, res) => {
  const { sender, receiver, response } = req.body;

  if (!["accepted", "rejected"].includes(response)) {
    return res.status(400).json({ error: "Invalid response value." });
  }

  try {
    const chatRequest = await ChatRequest.findOne({ sender, receiver });

    if (!chatRequest) {
      return res.status(404).json({ error: "Chat request not found." });
    }

    chatRequest.status = response;
    await chatRequest.save();

    res.status(200).json({ message: `Request ${response}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ✅ Status check — now includes isSender for frontend logic
router.post("/status", async (req, res) => {
  const { sender, receiver } = req.body;

  try {
    const request = await ChatRequest.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (!request) {
      return res.json({ status: null, isSender: false });
    }

    const isSender = request.sender === sender;
    res.json({ status: request.status, isSender });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error checking request status" });
  }
});

export default router;
