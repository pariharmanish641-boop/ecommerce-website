import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    image: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    badge: { type: String, trim: true, default: "" },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
