import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error.util";
import { User } from "../models/user.model";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized", 401));
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    (req as any).user = user;

    next();
  } catch {
    return next(new AppError("Token expired or invalid", 401));
  }
};
