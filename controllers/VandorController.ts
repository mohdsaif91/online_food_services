import { Request, Response, NextFunction } from "express";
import {
  CreateOfferInput,
  VandorLoginInputs,
  editVandorInput,
} from "../dto/vandor.dto";
import { FindVandor } from "./AdminController";
import { ValidatePassword, generateSignature } from "../utility";
import { CreateFoodInput } from "../dto/Food.dto";
import { Offer, Vandor, food } from "../modles";
import { Order, OrderDoc } from "../modles/Order";

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
      const result = generateSignature({
        _id: existingVandor.id,
        email: existingVandor.email,
        foodType: existingVandor.foodType,
        name: existingVandor.name,
      });

      return res.json(result);
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
  const { lat, lng } = req.body;
  if (user) {
    const existingVandor = await FindVandor(user._id);
    if (existingVandor !== null) {
      existingVandor.serviceAvailable = !existingVandor.serviceAvailable;

      if (lat && lng) {
        existingVandor.lat = lat;
        existingVandor.lng = lng;
      }

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
    const vandor = await FindVandor(user._id);
    if (vandor !== null) {
      const files = req.files as [Express.Multer.File];
      const image = files.map((file: Express.Multer.File) => file.filename);
      vandor.coverImage.push(...image);
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

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );
    if (orders !== null) {
      return res.status(200).json(orders);
    }
  }
  return res.json({ message: "Order not found" });
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    if (order !== null) {
      return res.status(200).json(order);
    }
  }
  return res.json({ message: "Order not found" });
};

export const processOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  const { status, remark, time } = req.body;
  if (orderId) {
    const order = <OrderDoc>(
      await Order.findById(orderId).populate("items.food")
    );
    console.log(order, " <><>");

    order.orderStatus = status;
    order.remarks = remark;
    if (time) {
      order.readyTime = time;
    }
    const orderResult = await order.save();
    if (orderResult !== null) {
      return res.status(200).json(orderResult);
    }
  }
  return res.status(400).json({ message: "Unable to process order !" });
};

export const getOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    let currentOffers = Array();
    const offers = await Offer.find().populate("vendors");
    console.log(offers, " <>");

    if (offers) {
      offers.map((item) => {
        if (item.vendors) {
          item.vendors.map((vendor) => {
            if (vendor._id.toString() === user._id) {
              currentOffers.push(item);
            }
          });
        }
        if (item.offerType === "GENERIC") {
          currentOffers.push(item);
        }
      });
    }
    return res.json(currentOffers);
  }
  return res.status(400).json({ message: "Offer not abailable" });
};

export const addOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const {
      bank,
      bins,
      description,
      endValidity,
      startValidity,
      isActive,
      minValue,
      offerAmount,
      offerType,
      pincode,
      promoType,
      promocode,
      title,
      vendors,
    } = <CreateOfferInput>req.body;

    const vendor = await FindVandor(user._id);

    if (vendor) {
      const offer = await Offer.create({
        bank,
        bins,
        description,
        endValidity,
        startValidity,
        isActive,
        minValue,
        offerAmount,
        offerType,
        pincode,
        promoType,
        promocode,
        title,
        vendors: [vendor],
      });
      return res.status(200).json(offer);
    }
  }
  return res.status(400).json({ message: "Unable to Add Offer !" });
};
export const editOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const offerId = req.params.id;
  if (user) {
    const {
      bank,
      bins,
      description,
      endValidity,
      startValidity,
      isActive,
      minValue,
      offerAmount,
      offerType,
      pincode,
      promoType,
      promocode,
      title,
    } = <CreateOfferInput>req.body;

    const currentOffer = await Offer.findById(offerId);

    if (currentOffer) {
      const vendor = await FindVandor(user._id);
      if (vendor) {
        currentOffer.title = title;
        currentOffer.description = description;
        currentOffer.offerType = offerType;
        currentOffer.offerAmount = offerAmount;
        currentOffer.pincode = pincode;
        currentOffer.promocode = promocode;
        currentOffer.promoType = promoType;
        currentOffer.startValidity = startValidity;
        currentOffer.endValidity = endValidity;
        currentOffer.bank = bank;
        currentOffer.bins = bins;
        currentOffer.isActive = isActive;
        currentOffer.minValue = minValue;

        const result = await currentOffer.save();
        return res.json(result);
      }
    }
  }
  return res.status(400).json({ message: "Unable to Add Offer !" });
};
