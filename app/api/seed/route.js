import connectDB from "@/lib/db";
import { sampleProducts } from "@/lib/sample-products";
import Product from "@/models/product";

export async function POST() {
  try {
    await connectDB();
    const operations = sampleProducts.map((product) => {
      const seedProduct = { ...product };
      delete seedProduct._id;
      return {
        updateOne: {
          filter: { title: seedProduct.title },
          update: { $setOnInsert: seedProduct },
          upsert: true,
        },
      };
    });
    const result = await Product.bulkWrite(operations, { ordered: true });

    return Response.json(
      {
        message: "Sample products are ready in the catalog.",
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
      },
      { status: result.upsertedCount > 0 ? 201 : 200 },
    );
  } catch (error) {
    console.error("Could not seed the product catalog.", error);
    return Response.json(
      { message: "The product catalog could not be seeded." },
      { status: 500 },
    );
  }
}
