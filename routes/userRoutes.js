const express = require('express')
const router = express.Router();


const {getRegisterUser ,postRegisterUser , getLogInUser,postLogInUser,getUserProfile, postLogout}= require('../controllers/userControllers')
const {userAuth} = require('../Midllewares/authentication')





router.route('/register').get(getRegisterUser).post( postRegisterUser)
router.route('/login').get(getLogInUser).post(postLogInUser)
router.route('/profile').get(userAuth,getUserProfile)
router.route('/logout').post(postLogout)








module.exports = router;