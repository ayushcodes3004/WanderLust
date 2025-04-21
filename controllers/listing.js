const Listing = require("../models/listing.js");

module.exports.index=async  (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new");
}

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({path: "reviews", populate: { path: "author" }});
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
}

module.exports.createListing =async (req, res) => {
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let orignalImageUrl=listing.image.url;
    orignalImageUrl=orignalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit", { listing,orignalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
    if(typeof req.file !== "undefined"){
        listing.image.filename=req.file.filename;
        listing.image.url=req.file.path;
        await listing.save();
    }
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}