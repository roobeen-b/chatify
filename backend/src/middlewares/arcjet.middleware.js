import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res
          .status(429)
          .json({ message: "Too many requests. Please try again later." });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Bot detected" });
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({ message: "Bot detected" });
    }
    next();
  } catch (error) {
    console.error("Arcjet error:", error);
    next();
  }
};
