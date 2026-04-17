import jwt from "jsonwebtoken";

type JWTPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

export function requireAdmin(req: Request) {
  const middlewareRole = req.headers.get("x-user-role");
  const middlewareUserId = req.headers.get("x-user-id");

  if (middlewareRole === "ADMIN" && middlewareUserId) {
    return {
      userId: middlewareUserId,
      role: "ADMIN" as const,
    };
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    throw new Error("No token provided");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("Server auth configuration is missing");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

  if (decoded.role !== "ADMIN") {
    throw new Error("Forbidden - Admins only");
  }

  return decoded;
}