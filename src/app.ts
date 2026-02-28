import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { ENV } from "./config/env";

const app: Application = express();

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
  });
});

app.use("/api/v1", routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(globalErrorHandler);

export default app;
