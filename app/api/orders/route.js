import mongoose from "mongoose";
import { readSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/order";
import Product from "@/models/product";

function invalid(message, status = 400) {
  return Response.json({ message }, { status });
}

export async function GET(request) {
  const session = readSession(request);
  if (!session) return invalid("Please sign in to view your orders.", 401);

  try {
    await connectDB();
    const orders = await Order.find({ user: session.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("items totalAmount status paymentStatus createdAt")
      .lean();
    return Response.json({ orders });
  } catch (error) {
    console.error("Could not load customer orders.", error);
    return invalid("Your orders could not be loaded.", 500);
  }
}

export async function POST(request) {
  const session = readSession(request);
  if (!session) return invalid("Sign in before placing an order.", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return invalid("Enter a valid order.");
  }

  const items = body?.items;
  const address = body?.shippingAddress;
  const paymentMethod = body?.paymentMethod;
  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 30 ||
    !address ||
    !["upi", "card", "cod"].includes(paymentMethod)
  ) {
    return invalid("Your cart, address, or payment method is invalid.");
  }

  const quantities = new Map();
  for (const item of items) {
    if (
      typeof item?.productId !== "string" ||
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    ) {
      return invalid("One or more cart items are invalid.");
    }
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const requiredAddressFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
  ];
  if (
    requiredAddressFields.some(
      (field) =>
        typeof address[field] !== "string" ||
        address[field].trim().length === 0 ||
        address[field].trim().length > 200,
    )
  ) {
    return invalid("Complete all required shipping address fields.");
  }

  try {
    await connectDB();
    const productIds = [...quantities.keys()];
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    if (products.length !== productIds.length) {
      return invalid("A product in your cart is no longer available.", 409);
    }

    const productsById = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    const orderItems = [];
    let subtotal = 0;

    for (const [productId, quantity] of quantities) {
      const product = productsById.get(productId);
      if (typeof product.stock === "number" && product.stock < quantity) {
        return invalid(`${product.title} does not have enough stock.`, 409);
      }
      const unitPrice = Number(product.price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return invalid(`${product.title} has an invalid price.`, 409);
      }
      subtotal += unitPrice * quantity;
      orderItems.push({
        product: product._id,
        title: product.title,
        image: product.image,
        unitPrice,
        quantity,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const shipping = subtotal >= 1499 ? 0 : 99;
    const totalAmount = Math.round((subtotal + tax + shipping) * 100) / 100;
    const mongoSession = await mongoose.startSession();
    let createdOrder;

    try {
      await mongoSession.withTransaction(async () => {
        for (const [productId, quantity] of quantities) {
          const product = productsById.get(productId);
          if (typeof product.stock === "number") {
            const updated = await Product.updateOne(
              { _id: productId, stock: { $gte: quantity } },
              { $inc: { stock: -quantity } },
              { session: mongoSession },
            );
            if (updated.modifiedCount !== 1) {
              throw new Error(`STOCK_CONFLICT:${product.title}`);
            }
          }
        }

        const [order] = await Order.create(
          [
            {
              user: session.userId,
              items: orderItems,
              subtotal,
              tax,
              shipping,
              totalAmount,
              shippingAddress: {
                fullName: address.fullName.trim(),
                phone: address.phone.trim(),
                addressLine1: address.addressLine1.trim(),
                addressLine2:
                  typeof address.addressLine2 === "string"
                    ? address.addressLine2.trim()
                    : "",
                city: address.city.trim(),
                state: address.state.trim(),
                postalCode: address.postalCode.trim(),
                country:
                  typeof address.country === "string"
                    ? address.country.trim()
                    : "India",
              },
              paymentMethod,
              paymentStatus: "pending",
            },
          ],
          { session: mongoSession },
        );
        createdOrder = order;
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("STOCK_CONFLICT:")) {
        return invalid(`${error.message.slice("STOCK_CONFLICT:".length)} just sold out.`, 409);
      }
      throw error;
    } finally {
      await mongoSession.endSession();
    }

    return Response.json(
      {
        message: "Your order has been saved.",
        order: {
          id: createdOrder._id.toString(),
          totalAmount: createdOrder.totalAmount,
          status: createdOrder.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not save customer order.", error);
    return invalid("Your order could not be saved. Please try again.", 500);
  }
}
