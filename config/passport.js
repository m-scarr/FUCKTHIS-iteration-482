
var bCrypt = require('bcrypt-nodejs');
var Sequelize = require("sequelize");

module.exports = function (passport, user) {

  var User = user;
  var LocalStrategy = require('passport-local').Strategy;


  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });


  passport.deserializeUser(function (id, done) {
    User.findById(id).then(function (user) {
      if (user) {
        done(null, user.get());
      }
      else {
        done(user.errors, null);
      }
    });

  });


  passport.use('local-register', new LocalStrategy(

    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },

    function (req, email, password, done) {


      var generateHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
      };

      User.findOne({ where: { email: email } }).then(function (user) {

        if (user) {
          return done(null, false, { message: 'That email is already taken' });
        }

        else {
          var userPassword = generateHash(password);
          var data =
          {
            email: email,
            password: userPassword,
            firstname: req.body.firstname,
            lastname: req.body.lastname
          };


          User.create(data).then(function (newUser, created) {
            if (!newUser) {
              return done(null, false);
            }

            if (newUser) {
              return done(null, newUser);

            }


          }).catch(Sequelize.ValidationError, function (err) {
            return done(null, false)
          });
        }


      });



    }



  ));

  passport.use('local-login', new LocalStrategy(

    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },

    function (req, email, password, done) {
      //debugger

      var User = user;

      var isValidPassword = function (userpass, password) {
        return bCrypt.compareSync(password, userpass);
      }

      User.findOne({ where: { email: email } }).then(function (user) {

        if (!user) {
          return done(null, false, { message: 'Email does not exist' });
        } else {
          console.log('user exists')
        }

        if (!isValidPassword(user.password, password)) {

          return done(null, false, { message: 'Incorrect password.' });

        } else {
          console.log('log in success')
        }

        var userinfo = user.get();
        

        return done(null, userinfo);

      }).catch(function (err) {

        console.log("Error:", err);

        return done(null, false, { message: 'Something went wrong with your Signin' });


      });

    }
  ));

}