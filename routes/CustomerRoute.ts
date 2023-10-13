import express from "express";

import {
  CustomerLogin,
  CustomerSignup,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  RequestOtp,
  addCart,
  createOrder,
  deleteCart,
  getCart,
  getOrderById,
  getOrders,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

// signup
router.post("/signup", CustomerSignup);

// login
router.post("/login", CustomerLogin);

//authenticate routes
router.use(Authenticate);

// verify customer account
router.patch("/verify", CustomerVerify);

// OTP/ Requesting OTP
router.get("/otp", RequestOtp);

// Profile
router.get("/profile", GetCustomerProfile);

router.patch("/profile", EditCustomerProfile);

// cart
router.post("/cart", addCart);
router.get("/cart", getCart);
router.delete("/cart", deleteCart);

// order
router.post("/create-order", createOrder);
router.get("/orders", getOrders);
router.get("/order/:id", getOrderById);

// payment

export { router as CustomerRoute };
