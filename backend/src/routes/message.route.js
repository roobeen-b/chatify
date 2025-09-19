import express from "express";

const router = express.Router();

router.get("/send", (req, res) => {
  res.send("Send Message");
});

router.get("/receive", (req, res) => {
  res.send("Receive Message");
});

export default router;
