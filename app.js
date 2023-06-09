const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
// const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const bookingController = require("./controllers/bookingController");
const viewRouter = require("./routes/viewRoutes");

// Start express app
const app = express();

app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 1) GLOGAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin
app.options("*", cors());

// serving static files
app.use(express.static(path.join(__dirname, "public")));

// set security HTTP headers
app.use(helmet());

// console.log(process.env.NODE_ENV);
// development loggin
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  "/webhook-checkout",
  bodyParser.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);

// body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

//  prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ROUTES
/* solved the problem: Refused to load the script 'https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js' 
because it violates the following Content Security Policy directive: "script-src 'self'". 
Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback. */
app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://api.mapbox.com https://cdnjs.cloudflare.com https://js.stripe.com; worker-src 'self' blob:"
  );
  next();
});
////////////////////////////////////////////////////////////////

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  res.status(400).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
  // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); - false...
});

app.use(globalErrorHandler);

module.exports = app;
