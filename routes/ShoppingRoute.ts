import express, { Request, Response, NextFunction } from "express";
import {
  getFoodAvailablity,
  getFoodIn30Min,
  getTopResturant,
  resturantById,
  searchFood,
} from "../controllers";

const router = express.Router();

// Food Availableity
router.get("/:pincode", getFoodAvailablity);

// top resturant
router.get("/topResturant/:pincode", getTopResturant);

// food available in 30 mins\
router.get("/food-in-30-min/:pincode", getFoodIn30Min);

// search food
router.get("/search/:pincode", searchFood);

//search Offer by pincode
router.get("/offers/:pincode");

// find resturant by id
router.get("/resturant/:id", resturantById);

export { router as ShoppingRoute };
