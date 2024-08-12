const User = require("../model/user");
const bcrypt = require("bcrypt");
const { createToken } = require("../middleware/token");

// registering the user
module.exports.create = async (req, res)=>{
    try {
        const {username, email, password} = req.body;
        let user = await User.findOne({email: email});
        if(user){
            return res.status(401).json({
                message: "user already exist!",
                success: false
            })
        }
        // giving the condition for entering the password
        const passwordRegx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@!#$%^&*_+=]).{6,}$/;
        if(!passwordRegx.test(password)){
            return res.status(403).json({
                message: "Password should contain atleast one number, one capital letter, one small letter and length of password should be 6",
                success: false
            })
        }

        // encrypting the password
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            username: username,
            email: email,
            password: hashedPassword
        })
        const token = createToken(user)
        return res.status(200).json({
            message: "User created successfully",
            success: true,
            token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error creating the user!",
            error: error.message
        })
    }
}

// signing the user
module.exports.signin = async (req, res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        // comparing the password
        const checkPassword = await bcrypt.compare(password, user.password);
        if(!user || !checkPassword){
            return res.status(400).json({
                message:"incorrect email or password!",
                success: false
            })
        }
        const token = createToken(user);
        return res.status(200).json({
            message: "Login successful",
            token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error in signin the user!",
            error: error.message
        })
    }
}