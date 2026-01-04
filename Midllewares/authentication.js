const jwt = require("jsonwebtoken");
const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");

 
 
 
 
async function adminAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.flash('error', 'Please log in as admin')
      return res.redirect('/admin/login')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN);

    const admin = await adminModel.findById(decoded.id);
    if (!admin) {
      req.flash('error', 'Please log in again')
      return res.redirect('/admin/login')
    }

    req.admin = admin;
    next();
  } catch (err) {
    req.flash('error', 'Session expired. Please log in again')
    return res.redirect('/admin/login')
  }
}



async function userAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.flash('error', 'You must be logged in to continue')
      return res.redirect('/user/login')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_USER);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      req.flash('error', 'Please log in again')
      return res.redirect('/user/login')
    }

    req.user = user;
    next();
  } catch (err) {
    req.flash('error', 'Session expired. Please log in again')
    return res.redirect('/user/login')
  }
}





module.exports = {
    adminAuth,
    userAuth
}
