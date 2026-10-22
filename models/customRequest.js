import mongoose from "mongoose";

const customRequestSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    itemDetails: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    budget: { type: Number, min: 0, default: null },
    status: {
      type: String,
      enum: ["new", "in_review", "contacted", "completed", "declined"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.CustomRequest ||
  mongoose.model("CustomRequest", customRequestSchema);
