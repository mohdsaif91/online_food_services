import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto/vandor.dto";
import { DeliveryUser, Transaction, Vandor } from "../modles";
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
    foods: [],
    lat: 0,
    lng: 0,
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

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transaction = await Transaction.find();

  if (transaction) {
    return res.status(200).json(transaction);
  }
  return res.json({ message: "Transaction data not availabel" });
};

export const getTransactionsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const transaction = await Transaction.findById(id);

  if (transaction) {
    return res.status(200).json(transaction);
  }
  return res.json({ message: "Transaction data not availabel" });
};

export const deliveryUserVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id, status } = req.body;
  if (_id) {
    const profile = await DeliveryUser.findById(_id);
    if (profile) {
      profile.verified = status;
      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
  return res.json({ message: "Unable to verify Delivery user" });
};

export const getDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryuser = await DeliveryUser.find();
  console.log(deliveryuser, " <>");

  if (deliveryuser) {
    return res.status(200).json(deliveryuser);
  }
  return res.status(400).json({ message: "unable to get delivery user" });
};
