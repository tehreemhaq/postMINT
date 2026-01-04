//env config
require('dotenv').config()

// packages imports
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()
const port = process.env.PORT || 8000


// local imports
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const postRoutes = require('./routes/postRoutes')
const postModel = require("./models/postModel")
const likeModel = require('./models/likeModel');
const { userIdentification } = require('./Midllewares/userIdentification');
const {limiter} = require('./Midllewares/rateLimiter');



// middlewares
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET_KEY, // Used to sign the session ID cookie
  resave: false, // Prevents saving session back to store if unmodified
  saveUninitialized: false // Forces a session that is "uninitialized" to be saved to the store
  
}))
app.use(flash())

app.use(express.static(path.join(__dirname, 'public')));

// local middlewares
app.use((req, res, next) => {
  if (!req.path.startsWith('/admin')) {
    return userIdentification(req, res, next);
  }
  next();
});
app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  res.locals.warning = req.flash('warning')
  res.locals.oldInput = req.flash('oldInput')[0] || {};
  next();
})

app.use(limiter);









// Database Connection
mongoose.connect( process.env.MONGO_URL) 
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// routes
app.use('/admin', adminRoutes)
app.use('/user', userRoutes)
app.use('/post', postRoutes)



app.get('/home', async (req, res) => { 
// need to refactor this controller later , for now working fine but not a good solution , can be done in a better way using aggregate
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

  res.render('homePage', { posts, user: req.user });
});



app.get('/about', async (req, res) => {

  res.render('aboutPage', { user: req.user })
})












const server = app.listen(port, () => {
  console.log(`server is listening at ${port}`);
});

server.on("error", (err) => {
  console.log("Server failed:", err.message);
});
