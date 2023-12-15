import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./api/routes.js";
import csrfMiddleware from "./api/middleware/csrf.js";
import security from "./api/middleware/security.js";
import compression from "compression";

dotenv.config();

const app = express();

app.use(compression());
security(app);
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.ildidev.com",
      "https://desolate-river-30096-d4bafee74101.herokuapp.com/",
    ],
    credentials: true,
  })
);

// csrfMiddleware(app);

app.use("/", routes);

export default app;
