import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/product";

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ message: "Product not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }
    return Response.json(product);
  } catch (error) {
    console.error("Could not load product details.", error);
    return Response.json(
      { message: "Product details could not be loaded." },
      { status: 500 },
    );
  }
}
