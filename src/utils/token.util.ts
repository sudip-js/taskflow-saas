import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, ENV.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};
