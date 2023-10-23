import express, { NextFunction, Request, Response } from "express";

import {
  CreateVandor,
  GetVandor,
  GetVandorById,
  deliveryUserVerify,
  getDeliveryUser,
  getTransactions,
  getTransactionsById,
} from "../controllers";

const router = express.Router();

router.post("/vandor", CreateVandor);
router.get("/vandors", GetVandor);
router.get("/vandor/:id", GetVandorById);
//transaction
router.get("/transactions", getTransactions);
router.get("/transactions/:id", getTransactionsById);

//delivery user verify
router.put("/delivery/verify", deliveryUserVerify);
router.get("/delivery/users", getDeliveryUser);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Admin Route" });
});

export { router as AdminRoutes };
