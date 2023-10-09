import express, { NextFunction, Request, Response } from "express";
import {
  VandorLogin,
  getVandorProfile,
  updateVandorProfile,
  updateVandorService,
} from "../controllers/VandorController";

const router = express.Router();

router.post("/login", VandorLogin);
router.get("/profile", getVandorProfile);
router.patch("/profile", updateVandorProfile);
router.patch("/service", updateVandorService);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from vandor Route" });
});

export { router as VandorRoutes };
