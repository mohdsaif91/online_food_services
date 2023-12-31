import mongoose, { Document, Schema } from "mongoose";

export interface OrderDoc extends Document {
  orderId: string;
  vendorId: string;
  items: [any];
  totalAmount: number;
  paidAmount: number;
  orderDate: Date;
  // paidThrough: string;
  // paymentResponse: string;
  orderStatus: string;
  remarks: string;
  deliveryId: string;
  // appliedOffer: boolean;
  // offerId: string;
  readyTime: number;
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    vendorId: { type: String, required: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    orderDate: { type: Date },
    // paidThrough: { type: String },
    // paymentResponse: { type: String },
    orderStatus: { type: String },
    remarks: { type: String },
    deliveryId: { type: String },
    // appliedOffer: { type: Boolean },
    // offerId: { type: String },
    readyTime: { type: Number },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model("order", OrderSchema);

export { Order };
