import connectDB from "@/lib/db";
import Product from "@/models/product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find()
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(48)
      .lean();

    return Response.json(products);
  } catch (error) {
    console.error("Could not load the product catalog.", error);
    return Response.json(
      { message: "The product catalog could not be loaded." },
      { status: 500 },
    );
  }
}