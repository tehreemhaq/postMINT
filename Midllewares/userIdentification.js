const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");



async function userIdentification(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        // No token → treat as guest
        return next();
    }else{
        try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_USER); 
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