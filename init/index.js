const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
.then(()=>{
    console.log("Connected to MongoDB successfully!");
})
.catch(err=>console.log(err));
async function main(){
    await mongoose.connect(MONGO_URL);
}


const initDB = async() => {
    try {
        // Delete previous data
        await Listing.deleteMany({});
        
        // Create a valid ObjectId for owner
        const sampleOwnerId = new mongoose.Types.ObjectId();
        
        // Insert new data with valid owner ID
        const listingsWithOwner = initData.data.map((obj) => ({
            ...obj, 
            owner: "680423db3b5169dffb66d5a7"
        }));
        
        await Listing.insertMany(listingsWithOwner);
        console.log("Data initialized with owner:", sampleOwnerId);
    } catch(err) {
        console.log("Error initializing database:", err);
    }
}

initDB();
