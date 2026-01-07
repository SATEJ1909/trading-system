import jwt from "jsonwebtoken";
import JWT_SECRET from "../config.js";
import { Socket } from "socket.io";

export interface CustomSocket extends Socket {
  userId?: string;
}

export const socketAuth = (
  socket: CustomSocket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("AUTH_ERROR: Token missing"));
    }

    if (!JWT_SECRET) {
      return next(new Error("AUTH_ERROR: Server misconfigured"));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded?.id) {
      return next(new Error("AUTH_ERROR: Invalid token"));
    }

    socket.userId = decoded.id;

    next();
  } catch (err) {
    return next(new Error("AUTH_ERROR: Token invalid or expired"));
  }
};
