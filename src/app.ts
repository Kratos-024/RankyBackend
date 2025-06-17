import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";

const app = express();
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: ["http://localhost:5173"],
  })
);

app.use(express.json());
app.use("/api/v1/users", userRouter);

export default app;
