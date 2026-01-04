const likeModel = require("../models/likeModel");
const postModel = require("../models/postModel");



async function getAllPost(req,res){
    const posts = await postModel.find().sort({ createdAt: -1 }).lean();

  
    posts.forEach(post => {
      if (post.createdAt) {
        post.formattedDate = post.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        post.formattedDate = '';
      }
  
      post.isLiked = false;  // at default each post is not liked 
  
    });
  
    if (req.user) {
      const likes = await likeModel.find(
        { userId: req.user._id },
        { postId: 1, _id: 0 }
      );
  
      const likedPostIds = likes.map(like =>
        like.postId.toString()
        // map it so that we get [ postId , postId , ..] and not this [ {objectID}, {objectID}]
      );
  
      posts.forEach(post => {
        post.isLiked = likedPostIds.includes(post._id.toString());
        // converted to string  so that it could works properly because includes() is strict to ===
  
      });
    }
  
  
    const likeCounts = await likeModel.aggregate([
      {
        $group: {
          _id: "$postId",
          count: { $sum: 1 }
        }
      }
    ])
  
  
    const likeCountMap = {}
    likeCounts.forEach(item => {
      likeCountMap[item._id.toString()] = item.count
    })
  
  
    posts.forEach(post => {
      post.likeCount = likeCountMap[post._id.toString()] || 0
    })

  

  
  res.render('allPostsPage' , {posts , user : req.user})
   
}


async function postlikeUnlikePost(req,res){
    try{
    let postId = req.params.id
    let userId = req.user._id

    let likeExists = await likeModel.findOne({postId , userId})
    if(likeExists){
        let deleteLike = await likeModel.findOneAndDelete({postId , userId})
      
    }else{
        let createLike = await likeModel.create({postId,userId})
         console.log(createLike)
       
       
    }

    return res.redirect(req.get('referer'));
    }catch(err){
        console.error("Error in like/unlike:", err);
        return res.status(500).json({ error: "Could not process your request. Please try again later." });
    }
}

module.exports = {
    getAllPost,
    postlikeUnlikePost
}