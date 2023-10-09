import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto/vandor.dto";
import { Vandor } from "../modles";
import { genSalt } from "bcrypt";
import { genPassword } from "../utility";

export const FindVandor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vandor.findOne({ email });
  } else {
    return await Vandor.findById(id);
  }
};

export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    address,
    email,
    foodType,
    name,
    ownerName,
    password,
    phone,
    pincode,
  } = <CreateVandorInput>req.body;

  const existingVandor = await FindVandor("", email);

  const resturantExisted = await Vandor.findOne({ email: email });
  if (resturantExisted !== null) {
    return res.json({ message: "A vendor exist with the email ID" });
  }

  //salt generation

  const salt = await genSalt();
  const hashPassword = await genPassword(password, salt);

  const createdVandor = await Vandor.create({
    address,
    email,
    foodType,
    name,
    ownerName,
    password: hashPassword,
    phone,
    pincode,
    salt: salt,
    rating: 0,
    serviceAvailable: false,
    coverImage: [],
  });
  return res.json(createdVandor);
};

export const GetVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vandor = await Vandor.find();
  if (vandor !== null) {
    return res.json(vandor);
  }

  return res.json({ message: "Vandor Data is not available" });
};

export const GetVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vandorId = req.params.id;

  const vandor = await FindVandor(vandorId);

  if (vandor !== null) {
    return res.json(vandor);
  }
  return res.json({ message: "Vandor Data not availabel" });
};
