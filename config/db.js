// code for stablishing the connection to our database

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.mongoURL);
        console.log("Mongodb connected!")
    } catch (error) {
        console.error(err.message);
        process.exit(1);
    }
}

connectDB();
module.exports = mongoose.connection;