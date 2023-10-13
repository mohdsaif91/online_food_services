import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import {
  CreateCustomerInput,
  UserLoginInputs,
  EditCustomerProfileInput,
  OrderInputs,
} from "../dto/CustomerDetails.dto";
import { genSalt } from "bcrypt";
import {
  GenerateOtp,
  ValidatePassword,
  genPassword,
  generateSignature,
  onRequestOtp,
} from "../utility";
import { Customer, CustomerDoc } from "../modles/Customer";
import { food } from "../modles";
import { Order } from "../modles/Order";

export const CustomerSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInput = plainToClass(CreateCustomerInput, req.body);
  const inputError = await validate(customerInput, {
    validationError: { target: true },
  });
  if (inputError.length > 0) {
    return res.status(400).json(inputError);
  }

  const { email, phone, password } = customerInput;

  const salt = await genSalt();
  const userPassword = await genPassword(password, salt);
  console.log(userPassword, " <><><>");

  const { otp, expiry } = GenerateOtp();
  console.log("<><><> 1");

  const existingUser = await Customer.findOne({ email: email });

  console.log(existingUser, "<>");

  if (existingUser !== null) {
    return res
      .status(409)
      .json({ message: "AN user exist with the given email id" });
  }

  const result = await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    otp: otp,
    otp_expiry: expiry,
    firstName: "",
    lastName: "",
    address: "",
    verified: false,
    lat: 0,
    lng: 0,
    orders: [],
  });
  console.log("<><><> 2");

  if (result) {
    // send OTP  to customer
    await onRequestOtp(otp, phone)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));

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

export const CustomerLogin = async (
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
  const customer = await Customer.findOne({ email: email });
  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );
    if (validation) {
      const signature = generateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });
      return res.status(200).json({
        signature: signature,
        email: customer.email,
        verified: customer.verified,
      });
    }
  }
  return res.status(404).json({
    message: "Login Error",
  });
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        const updateCustomerResponse = await profile.save();
        const signature = generateSignature({
          _id: updateCustomerResponse._id,
          email: updateCustomerResponse.email,
          verified: updateCustomerResponse.verified,
        });

        return res.status(201).json({
          signature: signature,
          verified: updateCustomerResponse.verified,
          email: updateCustomerResponse.email,
        });
      }
    }
  }
  return res.status(400).json({ message: "Error with OTP Validation" });
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      const { otp, expiry } = GenerateOtp();
      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOtp(otp, profile.phone);
      res
        .status(200)
        .json({ message: "OTP sent to your registerd phone number" });
    }
  }
  return res.status(400).json({ message: "Error with OTP generation" });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      return res.status(200).json(profile);
    }
  }
  return res.status(400).json({ message: "Error with Fetching profile" });
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInput, req.body);
  const profileValidationErrors = await validate(profileInputs, {
    validationError: { target: true },
  });
  if (profileValidationErrors.length > 0) {
    return res.status(400).json(profileValidationErrors);
  }

  const { firstName, lastName, address } = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: "Error with OTP generation" });
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //grab current login customer
  const customer = req.user;
  if (customer) {
    //create order ID
    const orderId = `${Math.floor(Math.random() * 89999) + 100}`;
    const profile = <CustomerDoc>await Customer.findById(customer._id);
    // console.log(profile, "<><>");

    const cart = <[OrderInputs]>req.body;
    let cartItem = Array();
    let netAmount = 0.0;
    //calculate order amount
    const foods = await food
      .find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    // console.log(foods, " <> ");

    foods.map((f: any) => {
      cart.map(({ _id, unit }) => {
        if (f._id == _id) {
          netAmount += f.price * unit;
          cartItem.push({ food: f, unit });
        }
      });
    });

    if (cartItem) {
      const currentOrder = <any>await Order.create({
        orderId: orderId,
        items: cartItem,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: "COD",
        paymentResponse: "",
        orderStatus: "waiting",
      });

      if (currentOrder) {
        profile.orders.push(currentOrder);
        await profile.save();
        return res.status(200).json(currentOrder);
      }
    }
  }
  return res.status(400).json({ message: "Error With creating Order" });
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");
    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }
  return res.status(400).json({ message: "Error With getting Order" });
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    return res.status(200).json(order);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    let cartItem = Array();
    const { _id, unit } = <OrderInputs>req.body;
    const foods = await food.findById(_id);
    if (profile !== null && food) {
      cartItem = profile.cart;
      if (cartItem.length > 0) {
      } else {
        cartItem.push({ food, unit });
      }
    }
  }
  return res.status(400).json({ message: "Error With getting Cart Data" });
};

export const addCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    let cartItem = Array();
    const { _id, unit } = <OrderInputs>req.body;
    const foods = await food.findById(_id);
    if (foods && profile !== null) {
      cartItem = profile.cart;
      if (cartItem.length > 0) {
        let existingFoodItem = cartItem.filter(
          (item) => item.food._id.toStinrg() === _id
        );
        if (existingFoodItem.length > 0) {
          const index = cartItem.indexOf(existingFoodItem[0]);
          if (unit > 0) {
            cartItem[index] = { foods, unit };
          } else {
            cartItem.splice(index, 1);
          }
        } else {
          cartItem.push({ foods, unit });
        }
      } else {
        cartItem.push({ foods, unit });
      }
      if (cartItem) {
        profile.cart = cartItem as any;
        const cartResult = await profile.save();
        res.status(200).json(cartResult.cart);
      }
    }
  }
};

export const deleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
