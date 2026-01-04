const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");



// async function userIdentification(req, res, next) {
//     const token = req.cookies.token;
//     if (token) {
//         const decoded = jwt.verify(token, "heyyehheyyeh"); // security key  needs to be private later
//         const user = await userModel.findById(decoded.id);

//         if (!user) {
//             return res.status(401).json({ message: "User not found" });
//         }

//         req.user = user; // attach user to req 
        
//     }
//     next();
// }



async function userIdentification(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        // No token → treat as guest
        return next();
    }else{
        try {
        const decoded = jwt.verify(token, "heyyehheyyeh"); // move secret to env later
        const user = await userModel.findById(decoded.id);

        if (user) {
            req.user = user; // attach user to req
        } else {
            console.warn("User not found for token:", decoded);
        }
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        // Token is invalid/malformed/expired → continue as guest
    }
    }

    

    next(); // always proceed
}

module.exports = {
    userIdentification
}