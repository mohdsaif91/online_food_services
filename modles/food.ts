import mongoose, { Document, Schema } from "mongoose";

interface FoodDoc extends Document {
  vandorId: string;
  name: string;
  description: string;
  category: string;
  foodType: string;
  readyTime: string;
  price: string;
  rating: number;
  images: [string];
}

const FoodSchema = new Schema(
  {
    vandorId: { type: String },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    foodType: { type: String, required: true },
    readyTime: { type: Number },
    price: { type: String },
    rating: { type: Number, required: true },
    images: { type: [String] },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret._v, delete ret.createdAt, delete ret.updatedAt;
      },
    },
  }
);

const food = mongoose.model("food", FoodSchema);

export { food };
