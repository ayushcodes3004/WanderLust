const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const listingRouter= require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//Database
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    try {
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 60000
        });
        console.log("Connected to MongoDB Atlas successfully!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

main().catch(err => console.error("Initial connection error:", err));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(cookieParser(process.env.SECRET));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET,
    }
})

const sessionConfig = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE")
})

// Middleware for flash message and session management
app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and currentUser middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user; 
    next();
});

// Route handlers - Move user routes before listing routes
app.use("/", userRouter);  // This should come first
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings", listingRouter);  // This should come after user routes

// 404 handler - place this after all your routes
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Error handling middleware - keep this as the last middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    if (!err.message) err.message = message;
    
    res.status(statusCode).render("error", { 
        err: {
            statusCode,
            message: err.message,
            stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
        },
        layout: false
    });
});

// Server startup
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});