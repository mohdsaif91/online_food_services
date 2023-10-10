import { Request, Response, NextFunction } from "express";
import { VandorLoginInputs, editVandorInput } from "../dto/vandor.dto";
import { FindVandor } from "./AdminController";
import { ValidatePassword, generateSignature } from "../utility";
import { CreateFoodInput } from "../dto/Food.dto";
import { food } from "../modles";

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
) => {
  const user = req.user;
  if (user) {
    const existingVandor = await FindVandor(user._id);

    return res.json(existingVandor);
  }
  return res.json({ message: "Login Credentials are not valid" });
};

export const updateVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address, foodType, name, phone } = <editVandorInput>req.body;
  const user = req.user;
  if (user) {
    const existingVandor = await FindVandor(user._id);
    if (existingVandor !== null) {
      existingVandor.name = name;
      existingVandor.address = address;
      existingVandor.phone = phone;
      existingVandor.foodType = foodType;
      const savedResult = await existingVandor.save();
      return res.json(savedResult);
    }
    return res.json(existingVandor);
  }
  return res.json({ message: "Login Credentials are not valid" });
};

export const updateVandorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVandor = await FindVandor(user._id);
    if (existingVandor !== null) {
      existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
      const savedResult = await existingVandor.save();
      return res.json(savedResult);
    }
    return res.json(existingVandor);
  }
  return res.json({ message: "Login Credentials are not valid" });
};

export const updateCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const { name, category, description, price, readyTime, foodType } = <
      CreateFoodInput
    >req.body;
    const vandor = await FindVandor(user._id);
    if (vandor !== null) {
      const files = req.files as [Express.Multer.File];
      const image = files.map((file: Express.Multer.File) => file.filename);

      const createFood = await food.create({
        vandorId: vandor._id,
        name: name,
        description: description,
        category: category,
        foodType: foodType,
        images: image,
        readyTime: readyTime,
        price: price,
        rating: 0,
      });
      vandor.foods.push(createFood);
      const result = await vandor.save();
      return res.json(result);
    }
  }
  return res.json({ message: "Something went wrong with food add" });
};

export const addFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const { name, category, description, price, readyTime, foodType } = <
      CreateFoodInput
    >req.body;
    const vandor = await FindVandor(user._id);
    if (vandor !== null) {
      const files = req.files as [Express.Multer.File];
      const image = files.map((file: Express.Multer.File) => file.filename);

      const createFood = await food.create({
        vandorId: vandor._id,
        name: name,
        description: description,
        category: category,
        foodType: foodType,
        images: image,
        readyTime: readyTime,
        price: price,
        rating: 0,
      });
      vandor.foods.push(createFood);
      const result = await vandor.save();
      return res.json(result);
    }
  }
  return res.json({ message: "Something went wrong with food add" });
};

export const getFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const foods = await food.find({ vandorId: user._id });
    if (foods !== null) {
      return res.json(foods);
    }
  }
  return res.json({ message: "Food information is not available" });
};
