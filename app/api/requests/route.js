import connectDB from "@/lib/db";
import CustomRequest from "@/models/customRequest";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Enter a valid request." }, { status: 400 });
  }

  const userName = typeof body?.userName === "string" ? body.userName.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const itemDetails =
    typeof body?.itemDetails === "string" ? body.itemDetails.trim() : "";
  const budget =
    body?.budget === "" || body?.budget === null || body?.budget === undefined
      ? null
      : Number(body.budget);

  if (userName.length < 2 || userName.length > 100) {
    return Response.json({ message: "Enter your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  if (itemDetails.length < 10 || itemDetails.length > 3000) {
    return Response.json(
      { message: "Describe what you are looking for (10–3,000 characters)." },
      { status: 400 },
    );
  }
  if (budget !== null && (!Number.isFinite(budget) || budget < 0 || budget > 10000000)) {
    return Response.json({ message: "Enter a valid budget." }, { status: 400 });
  }

  try {
    await connectDB();
    const customRequest = await CustomRequest.create({
      userName,
      email,
      itemDetails,
      budget,
    });
    return Response.json(
      {
        message: "Your request has been saved.",
        requestId: customRequest._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not save custom product request.", error);
    return Response.json(
      { message: "Your request could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
