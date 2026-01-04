const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const userModel = require('../models/userModel')
const postModel = require('../models/postModel')
const likeModel = require('../models/likeModel')
const {userRegistrationSchema} = require('../validators/formsValidation')
 

function getRegisterUser(req, res) {
    res.render('registerPage')

}




async function postRegisterUser(req, res) {
  // 1. Validate input
  const result = userRegistrationSchema.safeParse(req.body);

  if (!result.success) {
    req.flash("error", result.error.issues[0].message);
    req.flash("oldInput", req.body);
    return res.redirect("/user/register");
  }

  let { username, email, password } = result.data;

  // Optional but recommended: normalize
  username = username.toLowerCase();
  email = email.toLowerCase();

  try {
    // 2. Check uniqueness (email OR username)
    const userExists = await userModel.findOne({
      $or: [{ email }, { name: username }]
    });

    if (userExists) {
      req.flash("error", "Email or username already exists");
      return res.redirect("/user/register");
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    await userModel.create({
      name: username,
      email,
      password: hashedPassword
    });

    // 5. Success
    req.flash("success", "Account created successfully. Please log in.");
    return res.redirect("/user/login");

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/user/register");
  }
}






function getLogInUser(req, res) {
    res.render('loginPage')

}



async function postLogInUser(req, res) {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email })

    if (!user) {
        req.flash('error', 'Invalid email or password');
        req.flash("oldInput", req.body);
        return res.redirect('/user/login');
    } else {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY_USER , (err, token) => {   
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
                        
                        return res.redirect('/home');
                    }
                });

            } else {
                req.flash('error', 'Invalid email or password');
                req.flash("oldInput", req.body);
                return res.redirect('/user/login');

            }
        })

    }


}


async function getUserProfile(req, res) {
    const posts = await postModel.find().lean();
    let userId = req.user._id
    const likedPosts = await likeModel.aggregate([
        { $match: { userId: userId } },
        {
            $lookup: {
                from: "posts",
                localField: "postId",
                foreignField: "_id",
                as: "postData"
            }
        },
        { $unwind: "$postData" },
        {
            $project: {
                _id: 0,              // hide the default _id if you want
                userId: 1,
                postId: 1,
                title: "$postData.title",
                content: "$postData.content",
                formattedDate: {
                    $dateToString: { format: "%B %d, %Y", date: "$postData.createdAt" }
                }
            }
        }
    ]);

    return res.render('userProfilePage', { likedPosts, user: req.user })

}


function postLogout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,      // true in production (HTTPS)
        sameSite: 'strict'
    })
    
    return res.redirect('/home')
}






module.exports = {
    postRegisterUser,
    getRegisterUser,
    getLogInUser,
    postLogInUser,
    getUserProfile,
    postLogout

}