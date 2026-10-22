import { hashPassword, verifyPassword, createSessionCookie, clearSessionCookie, readSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/user";

function jsonError(message, status) {
  return Response.json({ message }, { status });
}

export async function GET(request) {
  const session = readSession(request);
  if (!session) return jsonError("Please sign in to continue.", 401);

  return Response.json({
    user: { id: session.userId, name: session.name, email: session.email },
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Enter valid sign-in details.", 400);
  }

  const action = body?.action;
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!["login", "signup"].includes(action)) {
    return jsonError("Choose sign in or create an account.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return jsonError("Enter a valid email address.", 400);
  }
  if (password.length < 8 || password.length > 128) {
    return jsonError("Password must be between 8 and 128 characters.", 400);
  }
  if (action === "signup" && (name.length < 2 || name.length > 100)) {
    return jsonError("Enter your name (2–100 characters).", 400);
  }

  try {
    await connectDB();
    let user;

    if (action === "signup") {
      const existingUser = await User.exists({ email });
      if (existingUser) return jsonError("An account with this email already exists.", 409);
      user = await User.create({
        name,
        email,
        passwordHash: await hashPassword(password),
      });
    } else {
      user = await User.findOne({ email }).select("+passwordHash");
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return jsonError("Email or password is incorrect.", 401);
      }
    }

    const response = Response.json({
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
    response.headers.append("Set-Cookie", createSessionCookie(user));
    return response;
  } catch (error) {
    if (error?.code === 11000) {
      return jsonError("An account with this email already exists.", 409);
    }
    console.error("Authentication request failed.", error);
    return jsonError(
      error instanceof Error && error.message.includes("AUTH_SECRET")
        ? error.message
        : "We could not complete sign in. Please try again.",
      500,
    );
  }
}

export async function DELETE() {
  const response = Response.json({ message: "You have been signed out." });
  response.headers.append("Set-Cookie", clearSessionCookie());
  return response;
}
