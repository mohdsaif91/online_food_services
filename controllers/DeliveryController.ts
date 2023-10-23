import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import {
  CreateCustomerInput,
  UserLoginInputs,
  EditCustomerProfileInput,
  CreateDeliveryUserInput,
} from "../dto/CustomerDetails.dto";
import { genSalt } from "bcrypt";
import {
  GenerateOtp,
  ValidatePassword,
  genPassword,
  generateSignature,
  onRequestOtp,
} from "../utility";
import { Customer } from "../modles/Customer";
import { DeliveryUser } from "../modles";

export const deliveryUserSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUserInput = plainToClass(CreateDeliveryUserInput, req.body);
  const inputError = await validate(deliveryUserInput, {
    validationError: { target: true },
  });
  if (inputError.length > 0) {
    return res.status(400).json(inputError);
  }

  const { email, phone, password, lastName, firstName, address, pincode } =
    deliveryUserInput;

  const salt = await genSalt();
  const userPassword = await genPassword(password, salt);
  const existingDeliveryUser = await DeliveryUser.findOne({ email: email });

  if (existingDeliveryUser !== null) {
    return res
      .status(409)
      .json({ message: "AN Delivery user exist with the given email id" });
  }

  const result = await DeliveryUser.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    firstName: firstName,
    lastName: lastName,
    address: address,
    verified: false,
    pincode: pincode,
    lat: 0,
    lng: 0,
    isAvailable: false,
  });

  if (result) {
    // generate signature
    const signature = generateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    return res.status(201).json({
      signature: signature,
      email: result.email,
      verified: result.verified,
    });
  }
  return res.status(400).json({ message: "Error for user signUp" });
};

export const deliveryUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);
  const loginErrors = await validate(loginInputs, {
    validationError: { target: false },
  });
  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }
  const { email, password } = loginInputs;
  const deliverUser = await DeliveryUser.findOne({ email: email });
  if (deliverUser) {
    const validation = await ValidatePassword(
      password,
      deliverUser.password,
      deliverUser.salt
    );
    if (validation) {
      const signature = generateSignature({
        _id: deliverUser._id,
        email: deliverUser.email,
        verified: deliverUser.verified,
      });
      return res.status(200).json({
        signature: signature,
        email: deliverUser.email,
        verified: deliverUser.verified,
      });
    }
  }
  return res.status(404).json({
    message: "Login Error",
  });
};

export const GetDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;
  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);
    if (profile) {
      return res.status(200).json(profile);
    }
  }
  return res.status(400).json({ message: "Error with Fetching profile" });
};

export const EditDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInput, req.body);
  const profileValidationErrors = await validate(profileInputs, {
    validationError: { target: true },
  });
  if (profileValidationErrors.length > 0) {
    return res.status(400).json(profileValidationErrors);
  }
  const { firstName, lastName, address } = profileInputs;
  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);
    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;
      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: "Error with Editing profile" });
};

export const updateDeliveryUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;
  if (deliveryUser) {
    const { lat, lng } = req.body;
    const profile = await DeliveryUser.findById(deliveryUser._id);
    if (profile) {
      if (lat && lng) {
        profile.lat = lat;
        profile.lng = lng;
      }
      profile.isAvailable = !profile.isAvailable;
      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: "Error with updating status" });
};
