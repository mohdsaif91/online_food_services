import mongoose, { Document, Schema } from "mongoose";

export interface OfferDoc extends Document {
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

const OfferSchema = new Schema(
  {
    offerType: { type: String },
    vendors: [{ type: Schema.Types.ObjectId, ref: "vandor" }],
    title: { type: String },
    description: { type: String },
    minValue: Number,
    offerAmount: Number,
    startValidity: Date,
    endValidity: Date,
    promocode: { type: String },
    promoType: { type: String },
    bank: [{ type: String }],
    bins: [{ type: String }],
    pincode: { type: String },
    isActive: Boolean,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret._v, delete ret.createdAt, delete ret.updatedAt;
      },
    },
  }
);

const Offer = mongoose.model("offer", OfferSchema);

export { Offer };
