const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const adminModel = require('../models/adminModel')
const postModel = require('../models/postModel')
const {postCreationSchema} = require('../validators/formsValidation')



// function GetRegister(req,res){
//     res.render('register')
// }  NOTE : we don't need register option for admin because admin will be register in development environment only once



// NOTE : I had named controllers in term of post and get like this handle is for post and  get method
// NOTE : For methods like PUT , PATCH , DELETE etc in views form only support GET  and POST so we need to handle this on server side before it reaches the controller we will add a kind of middleware who will handle this transformation of method but for now we are using thunder so we'll face no problem as such , need to handle this when integrate ejs pages with backend APIs




function postRegisterAdmin(req, res) {
    let { username, email, password } = req.body;
    // we need to add a checkpoint here to check wether admin entered valid credentials or some random irrelevant data
    bcrypt.genSalt(12, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let admin = await adminModel.create({
                name: username,
                email,
                password: hash
            }) // admin created but we will only create admin on development level and admin can log in only on production level 

            jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY_ADMIN, (err, token) => {  // for now security key is public we will make it secure later
                if (err) {
                    console.error('Error signing token:', err);
                } else {
                    console.log(token)
                    res.cookie("token", token, {
                        httpOnly: true,           //  JS cannot access it → prevents XSS from stealing token
                        secure: false,             //  send only over HTTPS → prevents man-in-the-middle attacks
                        sameSite: 'strict',       //  blocks cross-site requests → CSRF protection
                        maxAge: 1000 * 60 * 30,   //  token expires in 30 minutes
                        // signed: false

                    })
                    // res.redirect('/adminPanel')  --- for now we are not integrating frontend , using thunder for testing api working fine or not
                    res.send("Congratulations! , admin registered successfully...")
                }
            });



        });


    })
}



function getLogIn(req, res) {
    res.render('adminLoginPage')

}

async function postLogIn(req, res) {
    let { email, password } = req.body;
    let admin = await adminModel.findOne({ email })


    if (!admin) {
        req.flash('error', 'Invalid email or password');
        req.flash("oldInput", req.body);
        return res.redirect('/admin/login');
    } else {
        bcrypt.compare(password, admin.password, (err, result) => {
            if (result) {
                jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY_ADMIN , (err, token) => {   // for now security key is public we will make it secure later
                    if (err) {
                        console.error('Error signing token:', err);
                    } else {
                      
                        res.cookie("token", token, {
                            httpOnly: true,           //  JS cannot access it → prevents XSS from stealing token
                            secure: false,             //  ture in production HTTPS
                            sameSite: 'strict',       //  blocks cross-site requests → CSRF protection
                            maxAge: 1000 * 60 * 30,   //  token expires in 30 minutes
                            // signed: false

                        })
                        req.flash('success', `Welcome back, ${admin.name}`);
                        res.redirect('/admin/adminPanel') ///--- for now we are not integrating frontend , using thunder for testing api working fine or not
                        // res.send(`Congratulations! ${admin.name}  logged in successfully...`)
                    }
                });

            } else {
                req.flash('error', 'Invalid email or password');
                req.flash("oldInput", req.body);
                return res.redirect('/admin/login');

            }
        })

    }


}


async function getAdminPanel(req, res) {
   const posts = await postModel.find().sort({ createdAt: -1 }).lean();


    posts.forEach(post => {
        if (post.createdAt) {
            post.formattedDate = post.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } else {
            post.formattedDate = '';
        }
    });

    res.render('adminPanel', { posts })
}






async function postCreatePost(req, res) {
  const result = postCreationSchema.safeParse(req.body);

  if (!result.success) {
    req.flash("error", result.error.issues[0].message);
    req.flash("oldInput", req.body);
    return res.redirect("/admin/adminPanel");
  }

  const { title, content } = result.data;

  try {
    await postModel.create({
      title,
      content,
      author: req.admin.id
    });

    req.flash("success", "Post created successfully");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create post");
  }

  return res.redirect("/admin/adminPanel");
}




async function postDeletePost(req, res) {
    let postId = req.params.id;
    let deletedPost = await postModel.findByIdAndDelete(postId, { projection: 'title' })
    if (!deletedPost) {
        req.flash('error', 'Post not found or already deleted')
        return res.redirect('/admin/adminPanel')
    }
    req.flash('success', 'Post deleted')
    return res.redirect('/admin/adminPanel')

}




async function getEditPost(req, res) {
    let postId = req.params.id
    let editPost = await postModel.findById({ _id: postId })
    console.log(editPost)

    res.render('editPostPage', { editPost })
}

async function postEditPost(req, res) {
    let postID = req.params.id
    let { title, content } = req.body
    let updatedPost = await postModel.findByIdAndUpdate(postID, { title, content }, { new: true })
    if (!updatedPost) {
        req.flash('error', 'Post not found or could not be updated')
        return res.redirect('/admin/adminPanel')
    }

    req.flash('success', 'Post updated')
    return res.redirect('/admin/adminPanel')
}


function postLogout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,      // true in production (HTTPS)
        sameSite: 'strict'
    })

    req.flash('success', 'You have been logged out')
    return res.redirect('/admin/login')
}







module.exports = {
    postRegisterAdmin,
    getLogIn,
    postLogIn,
    getAdminPanel,
    postCreatePost,
    postLogout,
    postDeletePost,
    postEditPost,
    getEditPost
}