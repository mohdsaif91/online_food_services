export interface CreateVandorInput {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface editVandorInput {
  name: string;
  address: string;
  phone: string;
  foodType: [string];
}

export interface VandorLoginInputs {
  email: string;
  password: string;
}

export interface vandorPayload {
  _id: string;
  email: string;
  name: string;
  foodType: [string];
}

export interface CreateOfferInput {
  offerType: string;
  vendors: [string];
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}
