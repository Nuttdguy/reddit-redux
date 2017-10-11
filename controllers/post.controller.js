const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');


/*****************************************
//==||  GET ROUTES
*****************************************/

router.get('/', (req, res, next) => {
    let currentUser = req.user;

    Post.find({}).exec( (err, posts) => {
        return res.render('index', { currentUser, posts });
    })    
})

/*****************************************
//==||  / POST/ROUTES
*****************************************/

router.get('/post', (req, res, next) => {
    let currentUser = req.user;
    return res.render('post', { currentUser })
})

router.post('/post', (req, res, next) => {
    // request user token data from local cookie
    let currentUser = req.user;
    let post = new Post(req.body);
    
    if (currentUser._id == null) {
        return res.redirect('/login');
    } else {
        post.author = currentUser._id;
        post.save( (err) => {
            if (err) {
                return res.send(err);
            } 
            else {
                return res.redirect('/');
            }
        });
    }
});

/*****************************************
//==||  / POST/:POSTID  ROUTES
*****************************************/

router.get('/post/:postId', (req, res, next) => {
    let currentUser = req.user;

    if (currentUser === null ) {
        return res.redirect('/login');
    }

    User.findById(currentUser._id, {username: true}).exec( (err, author) =>{
        return author;
    }).then( (author) => {
        Post.findById( {_id: req.params.postId }, {} ).exec( (err, post) => {
            if (err) { 
                return res.send(err)
            } else {
                return post;
            }
        }).then( (post) => {
            Comment.find(post.comment._id).exec( (err, comment) => {
                if (err) {
                    return res.send(err);
                } else {
                    return comment;
                }
            }).then( (comment) => {
                // TODO --> come back here after learning MongoDB
                User.find({}, (err, commentAuthors) => {
                    if (err) {
                        return res.send(err);
                    } else {
                        comment = appendAuthor(commentAuthors, comment);
                        console.log(comment);
                        return res.render('post-detail', { currentUser, post, author, comment, commentAuthors })
                    }
                })
            }) 
        })
    })
})

function appendAuthor(commentAuthors, comment) {
    let modComment = {}
    for (let i = 0; i < comment.length - 1; i++) {
        for (let auth in commentAuthors) {
            let author = String(comment[i].commentAuthor[auth]);
            let commentAuthor = String(commentAuthors[auth]._id);
            let username = String(commentAuthors[auth].username);
            if (author === commentAuthor) {

                comment[i]['author'] = username ;
            }
        }
    }

    return comment;
}



/*****************************************
//==||  / POST/:POSTID/COMMENT  ROUTES
*****************************************/

router.get('/post/:postId/comment', (req, res, next) => {
    let currentUser = req.user;

    if (currentUser === null) {
        return res.redirect('/login');
    } else {

        Post.findById( {_id: req.params.postId}, {}).exec( (err, post) => {
            return post;
        }).then( (post) => {
            return res.render('comment', {currentUser, post});
        }).catch( (err) => {
            return res.send(err);
        })
    }
})


router.post('/post/:postId/comment', (req, res, next) => {
    let currentUser = req.user;
    let comment = new Comment(req.body);
    let post_id = req.params.postId;
    comment.commentAuthor.push(currentUser._id);

    if (currentUser === null) {
        return res.redirect('/login');
    } else {
        comment.save( (err) => {
            if (err) {
                return res.send(err);
            } else {
                return res.redirect('/post/'+ post_id );
            }
        });
    }
    next();
})

/*****************************************
//==||  / POST/COMMENT/:COMMENT_ID  ROUTES
*****************************************/

router.get('/post/comment/:commentId', (req, res, next) => {
    let currentUser = req.user;

    if (currentUser === null) {
        return res.redirect('/login');
    } else {

        Comment.findById(req.params.commentId).exec( (err, comment) => {
            if (err) {
                return res.send(err);
            } else {
                return comment;
            }
        }).then( (comment) => {
            console.log(comment)
            return res.render('comment', { comment, currentUser })
        })
    };

})

router.post('/post/comment/:commentId', (req, res, next) => {
    let currentUser = req.user;
    let newComment = new Comment(req.body);
    newComment.commentAuthor.push(currentUser._id);

    if (currentUser === null) {
        return res.redirect('/login');
    } else {
        newComment.save( (err) => { 
            if (err) {
                return res.send(err);
            } else {
                return res.redirect('/');
            }
        })
    }

})


// to use router module, export to use it
module.exports = router;