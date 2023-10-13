import express from "express";

import App from "./services/ExpressApp";
import dbConnection from "./services/Database";

const StartService = async () => {
  const app = express();
  await dbConnection();
  await App(app);
  app.listen(8000, () => {
    console.clear();
    console.log("listening on 8000");
  });
};

StartService();
