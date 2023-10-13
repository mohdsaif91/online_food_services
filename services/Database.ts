import mongoose from "mongoose";

import { Mongo_Uri } from "../config";

export default async () => {
  mongoose
    .connect(Mongo_Uri)
    .then((result) => {
      console.log("connection Sucessfull");
    })
    .catch((err) => {
      console.log(err);
    });
};
