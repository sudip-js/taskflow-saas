import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error.util";
import { ENV } from "../config/env";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (ENV.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  // Production
  if (err instanceof AppError && err.isOperational) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Unknown error
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};
