var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();

var mongoose = require('mongoose');

var userModel = require('../models/users');
var blogModel = require('../models/blogs');
var postModel = require('../models/posts');
var reviewModel = require('../models/reviews');

var blogId = "";
var postId = "";
var reviewId = "";


router.post('/signup', function(req, res) {
  console.log(req.body);

  req.checkBody('name', 'Name Invalid!').notEmpty();
  req.checkBody('dob', 'D.O.B Invalid!').notEmpty();
  req.checkBody('password', 'Password Invalid!').notEmpty();

  req.checkBody('email', 'Email Invalid!').notEmpty().isEmail();
  req.checkBody('passwordConfirm', 'Passwords Do not Match!').notEmpty().equals(req.body.password);
  req.checkBody('contact', 'Contact Number Invalid!').notEmpty().isNumeric().isLength(10);
  if(req.validationErrors())
    res.json({errors: req.validationErrors()});
  else {
    console.log(req.body);
    var newUser = new userModel(req.body);
    userModel.createUser(newUser, function(err, doc) {
      if(err) throw err;
      console.log(doc);
      res.json(doc);
    });
  }
});


router.post('/login', function(req, res) {
  console.log(req.body);
  req.checkBody('password', 'Password Invalid!').notEmpty();
  req.checkBody('email', 'Email Invalid!').notEmpty().isEmail();
  if(req.validationErrors())
    res.json({errors: req.validationErrors()});
  else {
    userModel.findOne({ email: req.body.email }, function(err, doc) {
      if(err) throw err;
      if(!doc) {
        res.json({ msg: "User Not Found!", toLogin: false });
      } else {
        bcrypt.compare(req.body.password, doc.password, function(err, isMatch) {
            if(err) throw err;
            if( isMatch ) {
              req.session.user = doc;
              res.json({ msg: "Login Approved!", toLogin: true });
            } else {
              res.json({ msg: "Password Incorrect!", toLogin: false });
            }
        });
      }
    });
  }
});


router.get('/logout', function(req, res) {
  req.session.destroy();
  res.json({ msg: "Session Destroyed!" });
});

router.get('/checksession', function(req, res) {
  if(req.session.user) {
    res.json({ isLoggedIn: true });
  } else {
    res.json({ isLoggedIn: false });
  }
});

router.get('/getblogposts/:cat/:blog?/:post?', function(req, res) {
  var cat = req.params.cat;
  console.log(cat);
  if(req.params.blog === undefined) {
    blogModel.find({ category: cat })
    .populate({ path: 'posts', select: 'title body' })
    .populate('user', 'name')
    .exec(function(err, docs) {
      if(err) throw err;
      res.json(docs);
    });
  } else {
    var blogName = req.params.blog;
    var postName = req.params.post;
    console.log(blogName + '--' + postName);
    blogModel.findOne({ name: blogName }, { name: 1, user: 1 }).populate('user', 'name').exec( function(err, blogDoc) {
      if(err) throw err;
      console.log(blogDoc + '------------');
      postModel.findOne({ title: postName }).populate({ path: 'reviews', populate: { path: 'comments.userDetails', select: 'name' } }).exec( function(err, postDoc) {
        if(err) throw err;
        
        res.json({ post: postDoc, blog: blogDoc });
      });
    });
    console.log();
  }
});

router.post('/blogpostsviews', function(req, res) {
  console.log(req.body);
  blogModel.findOne({ name: req.body.blog }, function(err, blogDoc) {
    postModel.findOne({ title: req.body.post }, function(err, postDoc) {
      if(blogDoc.posts.indexOf(postDoc._id) === -1) {
        res.send("View Couldnt be updated!");
      } else {
        reviewModel.update({ _id:  mongoose.Types.ObjectId(postDoc.reviews)}, { $push: { views: mongoose.Types.ObjectId(req.session.user._id) } }, function(err, doc) {
          if(err) throw err;
          res.json(doc);
        });
      }
    });
  });
});



router.get('/blogs', function(req, res, next) {
  if(!req.session.user) {
    res.end();
  } else {
    console.log("User Id: ", req.session.user._id);
    blogModel.find({user: mongoose.Types.ObjectId(req.session.user._id)}).exec(function(err, doc) {
      if(err) throw err;
      res.json(doc);
    });
  }
});

router.post('/newblog', function(req, res) {
  console.log(req.body);
  var newBlog = new blogModel({ user: mongoose.Types.ObjectId(req.session.user._id), name: req.body.name, description: req.body.description, category: req.body.category});
  newBlog.save(function(err, doc) {
    if(err) throw err;
    res.json(doc);
  });
});

router.post('/saveId', function(req, res) {
  console.log(req.body.id);
  blogModel.findOne({ _id: mongoose.Types.ObjectId(req.body.id) }, function(err, doc) {
    if(err) throw err;
    req.session.user.blog = doc;
    res.end();
  });
});

router.get('/posts', function(req, res) {
  if(!req.session.user) {
    res.end();
  } else {
      console.log(req.session.user.blog._id);
      blogModel.findOne({ _id: mongoose.Types.ObjectId(req.session.user.blog._id) }).populate('posts', '_id title')
      .exec(function(err, docs) {
        if(err) throw err;
        res.json(docs);
      });
  }
});

router.get('/posts/:id', function(req, res) {
  console.log('ID to extract: ', req.params.id);
  postId = req.params.id;
  postModel.findOne({ _id: mongoose.Types.ObjectId(postId) }).populate({ path: 'reviews', populate: { path: 'comments.userDetails', select: 'name' } })
  .exec(function(err, doc) {
    if(err) throw err;
    req.session.user.blog.post = doc;
    res.json(doc);
  });
});

router.post('/newcomment', function(req, res) {
  console.log(req.body);
  reviewModel.update({_id: mongoose.Types.ObjectId(req.body.id) }, { $push: { comments: { userDetails: mongoose.Types.ObjectId(req.session.user._id), comment: req.body.comment } } }, function(err, doc) {
    if(err) throw err;
    console.log(doc);
    reviewModel.findOne({_id: mongoose.Types.ObjectId(req.body.id) }).populate('comments.userDetails', 'name')
     .exec(function(err, doc) {
      if(err) throw err;
      res.json({ comments:  doc.comments});
    });
  });
   
});

router.post('/vote', function(req, res) {
  var isMatch = updated = false;
  console.log(req.body);
  reviewModel.findOne({ _id: mongoose.Types.ObjectId(req.body.id) }, function(err, doc) {
    if(err) throw err;
    console.log("Doc : " ,doc);
    doc.votes.forEach(function(voteDetail, index) {
        if( doc.votes[index].userDetails.equals(mongoose.Types.ObjectId(req.session.user._id)) ) {
          console.log("Match Found");
          if( doc.votes[index].vote === req.body.vote)
            isMatch = true;
          else {
            doc.votes[index].vote = req.body.vote;
            updated = true;
          }
        }
    });
    if(!updated && !isMatch) {
      doc.votes.push({ userDetails: mongoose.Types.ObjectId(req.session.user._id), vote: req.body.vote });
    }
    doc.save();
    res.json({ isMatch: isMatch, updated: updated });
      
    
  });
});

var showdown = require('showdown'),
    converter = new showdown.Converter();

router.post('/newpost', function(req, res) {
  var postDoc = new postModel(
    { 
      title: req.body.title,
      body: converter.makeHtml(req.body.body),
      reviews: new mongoose.Types.ObjectId() 
  });
  postDoc.save(function(err, doc) {
    if(err) throw err;
    blogModel.update({ _id: req.session.user.blog._id }, { $push: { posts: doc._id } }, function(err, doc) {
      if(err) throw err;
      console.log("Review's views incremented...", doc);
    });
    var reviewDoc = new reviewModel({ _id: mongoose.Types.ObjectId(doc.reviews) });
    reviewDoc.save(function(err, doc) {
      if(err) throw err;
      console.log("New Review Created:", doc);
    });
    res.json(doc);
  });
});


module.exports = router;
