import express, { Request, Response, NextFunction } from "express";
import { FoodDoc, Offer, OfferDoc, Transaction, Vandor } from "../modles";
import { Customer } from "../modles/Customer";

export const getFoodAvailablity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: true,
  })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json({ message: "Data not found !" });
};
export const getTopResturant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: true,
  })
    .sort([["rating", "descending"]])
    .limit(10);

  if (result.length > 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json({ message: "Data not found !" });
};

export const getFoodIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: true,
  }).populate("foods");

  if (result.length > 0) {
    let foodResult: any = [];

    result.map((vandor) => {
      const foods = vandor.foods as [FoodDoc];
      foodResult.push(...foods.filter((food) => food.readyTime <= 30));
    });

    return res.status(200).json(foodResult);
  }
  return res.status(400).json({ message: "Data not found !" });
};

export const searchFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: true,
  }).populate("foods");

  if (result.length > 0) {
    let foodResult: any = [];

    result.map((item) => {
      foodResult.push(...item.foods);
    });
    return res.status(200).json(foodResult);
  }
  return res.status(400).json({ message: "Data not found !" });
};

export const resturantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const result = await Vandor.findById(id).populate("foods");

  if (result) {
    return res.status(200).json(result);
  }
  return res.status(400).json({ message: "Data not found !" });
};

export const getAvailabelOffersByPincode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const offers = await Offer.find({ pincode, isActive: true });
  console.log(offers, " <>");

  if (offers) {
    return res.status(200).json(offers);
  }
  return res.status(400).json({ message: "Offers not found" });
};

export const verifyOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const offerId = req.params.id;
  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);
    console.log(appliedOffer, " <>");

    if (appliedOffer && appliedOffer.isActive) {
      if (appliedOffer.promoType === "USER") {
        //can be applied once per User
      } else {
        return res.json({ message: "Offer is valid ", Offer: appliedOffer });
      }
    }
  }
  return res.status(400).json({ message: "Offer is not Valid" });
};

// export const createPayment = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const user = req.user;
//   const { amount, paymentMode, offerId } = req.body;
//   let payableAmount = Number(amount);
//   if (user) {
//     const appliedOffer = <OfferDoc>await Offer.findById(offerId);
//     if (appliedOffer && appliedOffer.isActive) {
//       payableAmount = payableAmount - appliedOffer.offerAmount;
//     }

//     //

//     //Create recorde in Transaction
//     const transaction = await Transaction.create({
//       customer: user._id,
//       vendorId: "",
//       orderId: "",
//       orderValue: payableAmount,
//       offerUsed: offerId || "NA",
//       status: "OPEN",
//       paymentMode: paymentMode,
//       paymentResponse: "Payment is Cash on Delivery",
//     });
//     return res.json(transaction);
//   }
//   return res.status(400).json({ message: "Offer is not Valid" });
// };
