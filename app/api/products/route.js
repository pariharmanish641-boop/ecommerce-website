import connectDB from "@/lib/db";

import Product from "@/models/product";

export async function GET() {
    await connectDB();
    const products = await Product.find();
    return  Response.json(products);
}