import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";

import { AdminRoutes, VandorRoutes } from "./routes";
import { Mongo_Uri } from "./config";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/admin", AdminRoutes);
app.use("/vandor", VandorRoutes);

mongoose
  .connect(Mongo_Uri)
  .then((result) => {
    console.log("connection Sucessfull");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", (req, res) => {
  return res.json("Hello from food order online Backend ");
});

app.listen(8000, () => {
  console.clear();
  console.log("App listening on 8000");
});
