import { verifyToken } from "@clerk/backend";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  throw new Error("Missing CLERK_SECRET_KEY");
}

export async function requireClerkUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("Missing authorization token");

  const verified = await verifyToken(token, {
    secretKey: clerkSecretKey,
  });

  if (!verified?.sub) throw new Error("Invalid token");
  return verified.sub;
}
