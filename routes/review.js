const express = require('express');
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateReview, isAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// Create Review
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

// Delete Review
router.delete("/:reviewId",isLoggedIn, isAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;

