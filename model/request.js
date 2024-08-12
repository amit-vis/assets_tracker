const mongoose = require("mongoose");

// schema for request
const requestSchema = new mongoose.Schema({
    asset:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    proposedPrice:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'accepted', 'denied'],
        default: 'pending'
    },
    negotitationHistory:[
        {
            proposedPrice:{
                type: Number
            },
            date:{
                type: Date,
                default: Date.now
            }
        }
    ]
},{
    timestamps: true
})

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;