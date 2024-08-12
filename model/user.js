const mongoose = require("mongoose");

// schema for user
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    creditpoints:{
        type: Number,
        default: 10000
    }
},{
    timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;