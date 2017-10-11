const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


// create user schema
const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: { 
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    updatedAt: {
        type: Date
    }
});

// utilize mongoose Schema property to execute function prior to save
UserSchema.pre('save', function(next) {
    let now = new Date();
    this.updated= now;

    if (!this.createdAt) {
        this.createdAt = now;
    };

    let user = this;
    if (!user.isModified('password')) {
        return next();
    };

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            return next();
        })
    })
});


UserSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        done(err, isMatch);
    });
};

// use mongoose static property, add authenticate object that can be used on 
// any UserSchema object
// UserSchema.static.authenticate = (email, password, callback) => {
//     User.findOne({ email: email }).exec( (err, user) => {
//             if (err) { 
//                 return callback(err); 
//             } else if ( !user) {
//                 // update err object with error, return result
//                 let err = new Error('User not found.');
//                 err.status = 401;
//                 return callback(err);
//             }
//         }).then( (user) => {
//             bcrypt.compare(password, user.password, (err, result) => {
//                 if (result === true) {
//                     return callback(null, user);
//                 } else {
//                     return callback();
//                 }
//             })
//         }).catch( (err) => {
//             console.log(err);
//         });
// }


// hash password before saving database
// UserSchema.pre('save', (next) => {
//     let user = this;
//     bcrypt.hash(user.password, 10, (err, hash) => {
//         if (err) {
//             return next(err);
//         }
//         user.password = hash;
//         next();
//     })
// })


// create an instance of Mongoose User object, load into exports object
const User = mongoose.model('User', UserSchema);
module.exports = User;
