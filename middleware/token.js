const jwt = require("jsonwebtoken");

// creating the token
module.exports.createToken = (user)=>{
    const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {expiresIn:"1h"});
    return token;
}