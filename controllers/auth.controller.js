const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


/*****************************************
//==||  GET ROUTES
*****************************************/
router.get('/login', (req, res, next) => {
    return res.render('login');
});

router.get('/register', (req, res, next) => {
    return res.render('register');
});

router.get('/logout', (req, res, next) => {
    res.clearCookie('nToken');
    return res.redirect('/');
})

/*****************************************
//==||  POST ROUTES
*****************************************/

router.post('/register', (req, res, next) => {
    // add form data from request object
    let newUser = new User(req.body);
    let email = newUser.email;
    // check if username, email exist
    User.findOne({email: email}).exec( function(err, user) {
        if (err) { 
            return res.status(401).send({err});
        } 

        // saves the user if not exist
        // must use if/else to prevent header error
        if (!user) {
            newUser.save( function(err) {
                if (err) { 
                    return res.status(400).send( {err} );
                } else {
                    // set the token after persisting the object to database
                    let token = jwt.sign({ _id: newUser._id }, 'SECRET', { expiresIn: '60 days'});
                    res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
                    return res.redirect('/');
                }
            });
        } else {
            // TODO add user-already-exist message
            return res.redirect('/')
        }
    })
});

router.post('/login', (req, res, next) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        // if user returns null, then send response
        if (!user) {
            return res.status(401).send( { message: 'Wrong username and password'})
        } else {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (!isMatch) {
                    return res.status(401).send( {message: 'Wrong username or password'});
                } else {
                    let token = jwt.sign( 
                        { _id: user._id}, 
                        process.env.SECRET, 
                        { expiresIn: '60 days'});

                    res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
                    return res.redirect('/');
                }
            });       
        }
    })
});


module.exports = router;

