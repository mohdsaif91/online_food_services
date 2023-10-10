import express, { NextFunction, Request, Response } from "express";
import {
  VandorLogin,
  addFood,
  getFoods,
  getVandorProfile,
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
router.patch("/service", updateVandorService);
router.post("/food", images, addFood);
router.get("/foods", getFoods);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from vandor Route" });
});

export { router as VandorRoutes };
