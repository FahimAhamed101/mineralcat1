if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("node:path");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const cors = require("cors");

require("./passport");

const authRoutes = require("./routes/userRoutes/auth.routes");
const userRoutes = require("./routes/userRoutes/user.routes");
const paymentRoutes = require("./routes/userRoutes/payment.routes");
const readingRoutes = require("./routes/questionsRoutes/reading_test.routes");
const writingRoutes = require("./routes/questionsRoutes/writing_test.routes");
const listeningRoutes = require("./routes/questionsRoutes/listening.routes");
const speakingRoutes = require("./routes/questionsRoutes/speaking.routes");
const adminBasicRoutes = require("./routes/adminRoutes/adminBasic.routes");
const faqsRoutes = require("./routes/adminRoutes/faqs.routes");
const stripeRoutes = require("./routes/payments/stripe.routes");
const fullMockTestRoutes = require("./routes/mockTestRoutes/FullmockTest.routes");
const sectionalMockTestRoutes = require("./routes/mockTestRoutes/SectionalMockTest.routes");
const termsAndConditions = require("./routes/adminRoutes/terms.routes");
const aboutUs = require("./routes/adminRoutes/aboutUs.routes");
const privacy = require("./routes/adminRoutes/privacypolicy.routes");
const templateRoutes = require("./routes/template.routes");
const predictionRoutes = require("./routes/prediction.routes");
const ExpressError = require("./utils/ExpressError");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3002",
  "http://209.142.65.188:3000",
  "https://mineralcat1.vercel.app",
  "209.142.65.188:3000","https://mineralcat1-mjdh.vercel.app",
  "https://mineral-cat-pte-frontend-latest.vercel.app",
  "https://mineral-cat-pte-admin-dashboard.vercel.app",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

if (process.env.FRONTEND_URLS) {
  const extraOrigins = process.env.FRONTEND_URLS.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  allowedOrigins.push(...extraOrigins);
}

const jsonParser = express.json({ limit: "50kb" });
const urlencodedParser = express.urlencoded({ extended: true, limit: "50kb" });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { message: "Too many requests..." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-reset-token",
      "x-refresh-token",
    ],
  })
);

app.use(limiter);
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/webhook") {
    next();
  } else {
    jsonParser(req, res, next);
  }
});

app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/webhook") {
    next();
  } else {
    urlencodedParser(req, res, next);
  }
});

app.use(cookieParser());
app.use(passport.initialize());

app.set("trust proxy", 1);

if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/payment", paymentRoutes);
app.use("/test/reading", readingRoutes);
app.use("/test/writing", writingRoutes);
app.use("/test/listening", listeningRoutes);
app.use("/test/speaking", speakingRoutes);
app.use("/admin", adminBasicRoutes);
app.use("/faqs", faqsRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/full-mock-test", fullMockTestRoutes);
app.use("/sectional-mock-test", sectionalMockTestRoutes);
app.use("/terms", termsAndConditions);
app.use("/about-us", aboutUs);
app.use("/privacy-policy", privacy);
app.use("/templates", templateRoutes);
app.use("/predictions", predictionRoutes);

app.get("/success", (req, res) => {
  res.send("Payment Successfull");
});

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Uploaded file is too large. Maximum file size is 25MB.",
    });
  }

  const { status = 500, message = "Some error happend" } = err;
  res.status(status).json({ message });
});

module.exports = app;
