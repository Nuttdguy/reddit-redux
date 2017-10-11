const express = require('express'),
    handlebars = require('express-handlebars'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    jsonwebtoken = require('jsonwebtoken');
    require('dotenv').config();

// create an instance of Express
const app = express();

// configure database connection string
mongoose.connect('mongodb://localhost/reddit-redux');
mongoose.Promise = global.Promise;

// configure handlebars template framework
const exphbs = handlebars.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        isEmpty: function(comment, post) {
            if (comment != null || comment != '') {
                let html =  '<a href="/post/'+post._id+'/comment"><small><i>:: add comment </i></small></a>';
                return html;
            } else{
                return false;
            }
        }
    }
})

// set configuration properties for express app
// configure template engine to utilize handlebars
app.engine('.hbs', exphbs.engine);
app.set('view engine', '.hbs');
app.use(express.static('./public'));

// configure middleware
app.use(bodyParser.urlencoded( {extended: true} ));
// use this middleware to enable put/delete 
app.use(methodOverride('_method'));

// use middleware - utilize cookies for managing authentication
app.use(cookieParser());

// middleware function for checking user authentication
const checkAuth = function(req, res, next) {
    console.log('Using Middleware JWT to Authenticate User');
    let token = req.cookies.nToken;

    // check if user is valid, by user token - leave as null if it is - else
    // set the existing token and then decode that token to validate it
    if (typeof req.cookies.nToken === 'undefined' || req.cookies.nToken === null) {
        req.user = null;
    } else {
        let decodedToken = jsonwebtoken.decode(token, {complete: true}) || {};

        // set the request user object to the decoded payload
        req.user = decodedToken.payload;
    };
    // move onto next middleware 
    next();
}

app.use(checkAuth);


// configure routes, controllers and route 'directory' locations
const postsRoutes = require('./controllers/post.controller');
const authRoutes = require('./controllers/auth.controller');
// const commentsRoutes = require('./controllers/comments/');


// set default routes
app.use('/', postsRoutes); 
app.use('/', authRoutes);




//  start application
const portNumber = process.env.PORT || 3000;
app.listen(portNumber, () => {
    console.log('Application is running on port === ' + portNumber);
})

