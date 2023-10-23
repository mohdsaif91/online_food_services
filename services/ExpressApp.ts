import express, { Application } from "express";
import bodyParser from "body-parser";
import path from "path";

import {
  AdminRoutes,
  ShoppingRoute,
  VandorRoutes,
  CustomerRoute,
  DeliveryRoute,
} from "../routes";

export default async (app: Application) => {
  require("dotenv").config();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use("/images", express.static(path.join(__dirname, "images")));

  app.use("/admin", AdminRoutes);
  app.use("/vandor", VandorRoutes);
  app.use("/customer", CustomerRoute);
  app.use("/delivery", DeliveryRoute);
  app.use(ShoppingRoute);

  return app;
};
