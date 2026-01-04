
const express = require('express')
const router = express.Router();


const{postRegisterAdmin, getLogIn, postLogIn, getAdminPanel, postCreatePost,postLogout , postDeletePost , postDeleteAllPost , postEditPost , getEditPost} = require('../controllers/adminControllers')
const { adminAuth } = require('../Midllewares/authentication')






if (process.env.NODE_ENV === "development") {
    console.log("environment : development")
    router.route('/register')
        .post(postRegisterAdmin)
}
else {
    console.log("sorry , you cannot register admin..")
}


router.route('/adminPanel').get(adminAuth, getAdminPanel)
router.route('/login').get(getLogIn).post(postLogIn)
router.route('/logout').post(postLogout)
router.route('/createPost').post(adminAuth, postCreatePost)
router.route('/deletePost/:id').post(adminAuth,postDeletePost )
router.route('/editPost/:id').get(adminAuth , getEditPost).post(adminAuth,postEditPost)





module.exports = router;