const mongoose = require("mongoose");

// Schema for the assets
const assetSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    image:{
        type: String
    },
    status:{
        type: String,
        enum: ['draft', 'publish'],
        default: 'draft'
    },
    creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    currentHolder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tradingJourney:[
        {
            holder:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            date:{
                type: Date,
                default: Date.now()
            },
            price:{
                type: Number
            }
        }
    ],
    averageTradingPrice:{
        type: Number,
        default: 0
    },
    lastTradingPrice:{
        type: Number,
        default: 0
    },
    numberOfTransfers:{
        type: Number,
        default: 0
    },
    proposals:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request'
        }
    ]
},{
    timestamps: true
});

const Assests = mongoose.model("Asset", assetSchema);
module.exports = Assests;