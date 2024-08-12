const Assests = require("../model/assest");
const Request = require("../model/request");

// sending the proposal for assets
module.exports.setProposal = async (req, res)=>{
    try {
        const assets = await Assests.findById(req.params.id);
        if(!assets){
            return res.status(400).json({
                message: "Assets not available or not found!",
                success: false
            }); 
        }

        // condition for owner will not send proposal for their own assets
        if(assets.currentHolder._id.toString() === req.user._id.toString()){
            return res.status(402).json({
                message: "You can't send proposal for your own assests",
                success: false
            })

        }

        // here checking only user can send proposal for publish assets
        if(assets.status === "draft"){
            return res.status(401).json({
                message: "asset is not published!",
                success: false
            })
        }
        // here checking user can send proposal only one time for every assets
        const request = await Request.findOne({asset: assets._id, user: req.user._id});
        if(request){
            return res.status(403).json({
                message: "You have already sent an request for same assets!",
                success: false
            })
        }
        // creating the proposal
        const setProposedPrice = req.body.proposedPrice;
        const newRequest = await Request.create({
            asset: assets._id,
            user: req.user._id,
            proposedPrice: setProposedPrice,
            negotitationHistory:[
                {
                    proposedPrice: setProposedPrice
                }
            ]
        });
        // updating the proposol array
        assets.proposals.push(newRequest.user);
        await assets.save();
        return res.status(200).json({
            message: "Purchase Request sent!",
            success: true,
            purchaseRequest: newRequest
        })
    } catch (error) {
        console.error("Error creating request:", error.message);
        return res.status(500).json({
            message: "Internal server error in creating the request!",
            error: error.message
        });
    }
}

// code for negotiation
module.exports.negotiation = async (req, res)=>{
    try {
        const request = await Request.findById(req.params.id);
        if(!request){
            return res.status(400).json({
                message: "request not available or not found!",
                success: false
            })
        }
        // here we are checking that only proposal creater can negotiate
        if(request.user._id.toString() !== req.user._id.toString()){
            return res.status(401).json({
                message: "You can't negotiate!",
                success: false
            })
        }

        // creating the negotiation history
        const newProposedPrice = req.body.proposedPrice;
        request.proposedPrice = newProposedPrice;
        request.negotitationHistory.push({proposedPrice: newProposedPrice});
        await request.save();
        return res.status(200).json({
            message: "Negotiation updated",
            request
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error in updating the request!",
            error: error.message
        })
    }
}

// code for acepting the proposal
module.exports.acceptPrice = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(400).json({
                message: "Request not available or not found!",
                success: false
            });
        }
        request.status = "accepted";
        await request.save();

        const assets = await Assests.findById(request.asset._id);
        if (!assets) {
            return res.status(401).json({
                message: "Asset not found!",
                success: false
            });
        }

        // here we giving the condition that assets owner will not purchase their own assets
        if (assets.currentHolder._id.toString() === request.user._id.toString()) {
            return res.status(403).json({
                message: "You have already purchased this asset!",
                success: false
            });
        }

        // here is the condition for only holder owner can sale their assets
        if (assets.currentHolder._id.toString() !== req.user._id.toString()) {
            return res.status(402).json({
                message: "You are not the holder!",
                success: false
            });
        }

        // here updating the assets
        assets.currentHolder = request.user._id;
        assets.tradingJourney.push({
            holder: request.user._id,
            price: request.proposedPrice
        });
        assets.lastTradingPrice = request.proposedPrice;
        assets.numberOfTransfers += 1;

        const validPrices = assets.tradingJourney
            .map(journey => journey.price)
            .filter(price => !isNaN(price));

        if (validPrices.length > 0) {
            const total = validPrices.reduce((acc, price) => acc + price, 0);
            assets.averageTradingPrice = total / validPrices.length;
        } else {
            assets.averageTradingPrice = 0;
        }

        await assets.save();

        return res.status(200).json({
            message: "Request accepted, holder updated",
            success: true,
            request,
            assets
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error in accepting the price!",
            error: error.message
        });
    }
}

// here code for deny the proposal requests
module.exports.denyPurchaseRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(400).json({
                message: "Request not available or not found!",
                success: false
            });
        }

        const assets = await Assests.findById(request.asset._id);
        if (!assets) {
            return res.status(401).json({
                message: "Asset not found!",
                success: false
            });
        }
        request.status = "denied"
        assets.proposals = assets.proposals.filter(proposal => proposal._id.toString() !== request.user._id.toString());
        await assets.save();

        return res.status(200).json({
            message: "Request denied",
            success: true,
            request,
            assets
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error in denying the request!",
            error: error.message
        });
    }
}

// retrieving all the proposal requests
module.exports.getRequests = async (req, res)=>{
    try {
        const request = await Request.find({user: req.params.id});
        if(!request){
            return res.status(400).json({
                message: "request not available or not found!",
                success: false
            })
        }
        return res.status(200).json({
            message: "here is the lists of request",
            success: true,
            request
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error in getting the request!",
            error: error.message
        })
    }
}