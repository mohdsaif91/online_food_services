import express, { NextFunction, Request, Response } from "express";
import {
  VandorLogin,
  addFood,
  addOffer,
  editOffer,
  getFoods,
  getOffers,
  getOrderDetails,
  getOrders,
  getVandorProfile,
  processOrder,
  updateCoverImage,
  updateVandorProfile,
  updateVandorService,
} from "../controllers/VandorController";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    console.log(
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );

    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );
  },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", VandorLogin);

router.use(Authenticate);
router.get("/profile", getVandorProfile);
router.patch("/profile", updateVandorProfile);
router.patch("/coverImage", images, updateCoverImage);
router.patch("/service", updateVandorService);
router.post("/food", images, addFood);
router.get("/foods", getFoods);

//order
router.get("/orders", getOrders);
router.put("/order/:id/process", processOrder);
router.get("/order/:id", getOrderDetails);

//offers
router.get("/offers", getOffers);
router.post("/offer", addOffer);
router.put("/offer/:id", editOffer);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from vandor Route" });
});

export { router as VandorRoutes };
