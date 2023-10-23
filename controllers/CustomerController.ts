import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import {
  CreateCustomerInput,
  UserLoginInputs,
  EditCustomerProfileInput,
  orderInputs,
  cartItem,
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
import {
  DeliveryUser,
  FoodDoc,
  Offer,
  OfferDoc,
  Transaction,
  TransactionDoc,
  Vandor,
  food,
} from "../modles";
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

  const { otp, expiry } = GenerateOtp();

  const existingUser = await Customer.findOne({ email: email });

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
//payment---------------------

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { amount, paymentMode, offerId } = req.body;
  let payableAmount = Number(amount);
  if (user) {
    const appliedOffer = <OfferDoc>await Offer.findById(offerId);
    if (appliedOffer && appliedOffer.isActive) {
      payableAmount = payableAmount - appliedOffer.offerAmount;
    }

    //

    //Create recorde in Transaction
    const transaction = await Transaction.create({
      customer: user._id,
      vendorId: "",
      orderId: "",
      orderValue: payableAmount,
      offerUsed: offerId || "NA",
      status: "OPEN",
      paymentMode: paymentMode,
      paymentResponse: "Payment is Cash on Delivery",
    });
    return res.json(transaction);
  }
  return res.status(400).json({ message: "Offer is not Valid" });
};

// Delivery Notification

const assigneOrderForDelivery = async (orderId: string, vendorId: string) => {
  // find the vendor
  const vendor = await Vandor.findById(vendorId);
  if (vendor) {
    const areaCode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;
    // find the available Delivery person

    const deliveryPerson = await DeliveryUser.find({
      pincode: areaCode,
      verified: true,
      isAvailable: true,
    });
    console.log(areaCode, " <> ", deliveryPerson);
    if (deliveryPerson && deliveryPerson.length > 0) {
      const currentOrder = await Order.findById(orderId);
      if (currentOrder) {
        console.log(currentOrder, " <> - ", deliveryPerson);

        currentOrder.deliveryId = deliveryPerson[0]._id;
        return await currentOrder.save();
      }
    }
    //check the nearest delivery person and assigne the order
    // update deliveryId
  }
};

//------------------------------

const validateTransaction = async (txnId: string) => {
  const currentTransaction = <TransactionDoc>await Transaction.findById(txnId);
  console.log(currentTransaction, "<>");

  if (currentTransaction.status.toLocaleLowerCase() !== "failed") {
    return {
      status: true,
      currentTransaction,
    };
  }
  return {
    status: false,
    currentTransaction,
  };
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //grab current login customer
  const customer = req.user;
  const { txnId, amount, items } = <orderInputs>req.body;
  if (customer) {
    const { status, currentTransaction } = await validateTransaction(txnId);

    if (!status) {
      return res.status(400).json({ message: "Error with Create Order" });
    }
    const orderId = `${Math.floor(Math.random() * 89999) + 100}`;
    const profile = <CustomerDoc>await Customer.findById(customer._id);

    // const cart = <[OrderInputs]>req.body;
    let cartItem = Array();
    let netAmount = 0.0;
    let vandorId = "";

    const foods = <any>await food
      .find()
      .where("_id")
      .in(items.map((item) => item._id))
      .exec();

    // console.log(foods, " <> ");

    foods.map((f: any) => {
      items.map(({ _id, unit }) => {
        if (f._id == _id) {
          vandorId = f.vandorId;
          netAmount += f.price * unit;
          cartItem.push({ food: f, unit });
        }
      });
    });

    if (cartItem) {
      const currentOrder = <any>await Order.create({
        orderId: orderId,
        vendorId: vandorId,
        items: cartItem,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: "waiting",
        remarks: "",
        deliveryId: "",
        readyTime: 45,
      });

      if (currentOrder) {
        profile.cart = [] as any;
        profile.orders.push(currentOrder);

        currentTransaction.vendorId = vandorId;
        currentTransaction.orderId = orderId;
        currentTransaction.status = "CONFIRMED";
        await currentTransaction.save();

        const currentOrederResponse = assigneOrderForDelivery(
          currentOrder._id,
          vandorId
        );

        const profileSavedResponse = await profile.save();
        return res.status(200).json(currentOrederResponse);
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
    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }
  return res.status(400).json({ message: "Cart is Empty" });
};

export const addCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    console.log(profile, " FIRST <>");

    let cartItem = Array();

    const { _id, unit } = <cartItem>req.body;

    const foods = await food.findById(_id);

    if (foods) {
      if (profile !== null) {
        cartItem = profile.cart;
        if (cartItem.length > 0) {
          let existingFoodItem = cartItem.filter(
            (item) => item.food._id.toString() === _id
          );

          if (existingFoodItem.length > 0) {
            const index = cartItem.indexOf(existingFoodItem[0]);

            if (unit > 0) {
              cartItem[index] = { food: foods, unit };
            } else {
              cartItem.splice(index, 1);
            }
          } else {
            console.log("6");
            cartItem.push({ food: foods, unit });
          }
        } else {
          console.log("7");
          cartItem.push({ food: foods, unit });
        }
        if (cartItem) {
          profile.cart = cartItem as any;
          const cartResult = await profile.save();
          res.status(200).json(cartItem);
        }
      }
    }
  }
};

export const deleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile !== null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();
      return res.status(200).json(cartResult);
    }
  }
  return res.status(400).json({ message: "Cart is Already Empty" });
};
