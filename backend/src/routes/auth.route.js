import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", (req, res) => {
  signup(req, res);
});

router.post("/login", (req, res) => {
  login(req, res);
});

router.post("/logout", (req, res) => {
  logout(req, res);
});

export default router;
