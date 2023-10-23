import express from "express";

import {
  EditDeliveryUserProfile,
  GetDeliveryUserProfile,
  deliveryUserLogin,
  deliveryUserSignup,
  updateDeliveryUserStatus,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

// signup
router.post("/signup", deliveryUserSignup);

// login
router.post("/login", deliveryUserLogin);

//authenticate routes
router.use(Authenticate);

//change service status
router.put("/change-status", updateDeliveryUserStatus);

// Profile
router.get("/profile", GetDeliveryUserProfile);

router.patch("/profile", EditDeliveryUserProfile);

export { router as DeliveryRoute };
