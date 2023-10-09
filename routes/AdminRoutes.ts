import express, { NextFunction, Request, Response } from "express";

import { CreateVandor, GetVandor, GetVandorById } from "../controllers";

const router = express.Router();

router.post("/vandor", CreateVandor);
router.get("/vandors", GetVandor);
router.get("/vandor/:id", GetVandorById);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Admin Route" });
});

export { router as AdminRoutes };
