const express = require('express')
const router = express.Router();


const {getAllPost , postlikeUnlikePost} = require('../controllers/postControllers');
const { userAuth }  = require('../Midllewares/authentication');



router.route('/allPosts').get(getAllPost)
router.route('/:id/like').post(userAuth,postlikeUnlikePost)



module.exports= router