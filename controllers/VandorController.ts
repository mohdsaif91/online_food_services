import { Request, Response, NextFunction } from "express";
import { VandorLoginInputs } from "../dto/vandor.dto";
import { FindVandor } from "./AdminController";
import { ValidatePassword, generateSignature } from "../utility";

export const VandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VandorLoginInputs>req.body;
  const existingVandor = await FindVandor("", email);
  if (existingVandor !== null) {
    //validation and give access
    const validation = await ValidatePassword(
      password,
      existingVandor.password,
      existingVandor.salt
    );
    // console.log(existingVandor);

    if (validation) {
      return generateSignature({
        _id: existingVandor.id,
        email: existingVandor.email,
        foodType: existingVandor.foodType,
        name: existingVandor.name,
      })
        .then((result: any) => {
          return res.json(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return res.json({ message: "Password not valid" });
    }
  }

  return res.json({ message: "Login Crediantials not valid" });
};

export const getVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const updateVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const updateVandorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
