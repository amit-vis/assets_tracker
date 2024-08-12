const cloudinary = require("../config/cloudinary");
const Assests = require("../model/assest");

// code for creating the assets
module.exports.createAssests = async (req, res)=>{
    try {
        // checking the if same name assets.
        let assests = await Assests.findOne({name: req.body.name});
        if(assests){
            return res.status(400).json({
                message: "same name assests already exist!!",
                success: false
            })
        }
        // uploading the image in the cloudinary
        const file = req.files?req.files.file:null;
        const result = await cloudinary.uploader.upload(file.tempFilePath,{
            folder: "softloft"
        })
        
        // creating the new assets
        assests = await Assests.create({
            name: req.body.name,
            description: req.body.description,
            image: result?result.secure_url:req.body.image,
            creator: req.user._id,
            currentHolder: req.user._id
        })
        return res.status(200).json({
            message: "assest created successfully!",
            success: true,
            assests
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error in creating the assests!",
            error: error.message
        })
    }
}

// code for updatation of assets
module.exports.updateAssest = async (req, res)=>{
    try {
        const assest = await Assests.findById(req.params.id);
        if(!assest){
            return res.status(400).json({
                message: "assest not available or not found!",
                success: false
            })
        }
        const file = req.files?req.files.file:null;
        let imageUrl = req.body.image || assest.image
        if(file){
            const result = await cloudinary.uploader.upload(file.tempFilePath,{
                folder: "softloft"
            });
            imageUrl = result.secure_url
        }
        assest.name = req.body.name || assest.name;
        assest.description = req.body.description || assest.description;
        assest.image = imageUrl
        await assest.save();
        return res.status(200).json({
            message: "Asset updated successfully!",
            success: true
        }) 
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error updating the assets",
            error: error.message
        })
    }
}

// code for publishing the assets
module.exports.publish = async (req, res)=>{
    try {
        const assets = await Assests.findById(req.params.id);
        if(!assets){
            return res.status(400).json({
                message: "assest not available or not found!",
                success: false
            })
        }
        assets.status = "publish";
        await assets.save();
        return res.status(200).json({
            message: "asset publish on market place!",
            success: true,
            assets
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error publishing the assets",
            error: error.message
        })
    }
}

// code for checking the details of the assets
module.exports.getAssestDetails = async (req, res)=>{
    try {
        const assest = await Assests.findById(req.params.id);
        if(!assest){
            return res.status(400).json({
                message: "assest not available or not found!",
                success: false
            })
        }
        // Sort the tradingJourney for each asset
            if (assest.tradingJourney && assest.tradingJourney.length > 0) {
                assest.tradingJourney.sort((a, b) => b.date - a.date);
            }
        return res.status(200).json({
            message: "check details of assets!",
            success: true,
            assest
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error publishing the assets",
            error: error.message
        })
    }
}

// checking the assets by the logged in user
module.exports.usersAssests = async (req, res)=>{
    try {
        const assets = await Assests.find({creator: req.user._id});
        if(!assets || assets.length === 0){
            return res.status(400).json({
                message: "assest not available or not found!",
                success: false
            })
        }
        // Sort the tradingJourney for each asset
        assets.forEach(asset => {
            if (asset.tradingJourney && asset.tradingJourney.length > 0) {
                asset.tradingJourney.sort((a, b) => b.date - a.date);
            }
        });
        return res.status(200).json({
            message: "user assests lists!",
            success: true,
            assets
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error getting the users assets",
            error: error.message
        })
    }
}

// getting the assets by the user id
module.exports.usersAssestsById = async (req, res) => {
    try {
        const assets = await Assests.find({ creator: req.params.id });

        if (!assets || assets.length === 0) {
            return res.status(400).json({
                message: "Assets not available or not found!",
                success: false
            });
        }

        // Sort the tradingJourney for each asset
        assets.forEach(asset => {
            if (asset.tradingJourney && asset.tradingJourney.length > 0) {
                asset.tradingJourney.sort((a, b) => b.date - a.date);
            }
        });

        return res.status(200).json({
            message: "User assets list!",
            success: true,
            assets
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error getting the users' assets",
            error: error.message
        });
    }
}

// getting the list of only publish assets
module.exports.getAssetsOnMarketPlace = async (req, res)=>{
    try {
        const assets = await Assests.find({status: "publish"});
        if (!assets || assets.length === 0) {
            return res.status(400).json({
                message: "Assets not available or not found!",
                success: false
            });
        }

        assets.forEach(asset=>{
            if(asset.tradingJourney && asset.tradingJourney.length>0){
                asset.tradingJourney.sort((a,b)=>b.date - a.date);
            }
        })
        return res.status(200).json({
            message: "Marketplace assets list!",
            success: true,
            assets
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error getting the users' assets",
            error: error.message
        });
    }
}
