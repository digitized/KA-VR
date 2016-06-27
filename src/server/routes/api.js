/* eslint-disable no-console*/
import { Router } from 'express';
import userController from '../controllers/userController';
import authController from '../controllers/authController';
import refresh from 'passport-oauth2-refresh';
import strategy from '../authentication/googleStrategy';
import Users from '../../../mysql.config';
// import auth from 'passport-local-authenticate';
import bcrypt from 'bcrypt';
import { LocalStrategy } from 'passport-local';


const router = new Router();

const saltRounds = 10;

refresh.use(strategy);

// Middleware that checks if user is already authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.redirect('/');
};

/* Users */
router.route('/api/user').get(userController.getAll);
/* Authentication */

// Route to Google OAuth
router.route('/auth/google').get(authController.googleAuth);

// Generating new access tokens using refresh token
router.route('/api/token').get(isAuthenticated, (req, res) => { /* If user is authenticated */
  // Finding user that is currently logged in based on their email
  Users.findOne({
    where: {
      email: req.user.email,
    },
  })
  .then(result => result.refreshToken)
  .then(token => {
    // This method gets a new access token upon expiration of token every hour
    refresh.requestNewAccessToken('google', token, (err, accessToken) => {
      req.user.accessToken = accessToken;
      res.send({ accessToken });
    });
  });
});

router.route('/auth/google/callback').get(authController.googleRedirect);

// Handle SignIn routing/authentication

router.route('/signin')
  .post((req, res) => {
    const userInfo = req.body;

    const email = req.body.email;
    const password = req.body.password;

    // Validation
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      console.log('ERRORS: ', errors);
      res.send(JSON.stringify({
        response: errors,
      }));
    } else {
      console.log('YES');
    }

    Users.findAll({
      where: {
        email: userInfo.email,
      },
    })
    .then(database => {
      if (database.length === 0) {
        res.send(JSON.stringify({
          response: 'Email not found',
        }));
      } else {

      } // Close else
    })
    .catch(error => {
      console.error('Error ', error);
    });
  }); // Closes our post


// Handle SignUp routing/authentication
router.route('/signup')
  .post((req, res) => {
    const userInfo = req.body;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const password2 = req.body.passwordConfirm;
    const email = req.body.email;

    console.log('REQ.BODY on SIGNUP: ', req.body);

    // Validation of user information
    req.checkBody('firstname', 'First name is required').notEmpty();
    req.checkBody('lastname', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('passwordConfirm', 'Passwords do not match').equals(password);

    const errors = req.validationErrors();

    if (errors) {
      console.log('ERRORS: ', errors);
      res.send(JSON.stringify({
        response: errors,
      }));
    } else {
    // Check database to see if email already exist
    Users.findAll({
      where: {
        email: userInfo.email,
      },
    })
    .then(result => {
      // If email already exist in database, send error message back to client
      console.log('RESULT from SQL Query on API File: ', result);

      if (result.length > 0) {
        res.send(JSON.stringify({
          response: 'Email already exists',
        }));
      } else { /* If email doesn't exist in our database */
        // Salt user password
        bcrypt.genSalt(saltRounds, (err, salt) => {
          if (err) {
            console.log(err);
          }
          bcrypt.hash(userInfo.password, salt, (error, hash) => {
            if (error) {
              console.log(error);
            }
            // Save userinfo to database
            Users.create({
              firstname: userInfo.firstname,
              lastname: userInfo.lastname,
              password: hash,
              email: userInfo.email,
            })
            .then(() => {
              res.send(JSON.stringify({
                redirect: '/dashboard',
              }));
            })
            .catch(errors => {
              console.error('Error: ', errors);
            });
          });
        }); // Close hash
      } // Close else
    })
    .catch(err => {
      console.err('Error: ', err);
    }); 
    } // Close else
  }); /* Closes our post */


// Old Version using bcrypt

// router.route('/signin')
//   .post((req, res) => {
//     const userInfo = req.body;
//     Users.findAll({
//       where: {
//         email: userInfo.email,
//       },
//     })
//     .then(database => {
//       if (database.length === 0) {
//         res.send(JSON.stringify({
//           response: 'Email not found',
//         }));
//       } else { /* Case of email exist */
//         bcrypt.compare(userInfo.password, database[0].password, (err, samePW) => {
//           if (err) {
//             console.log('Error in comparing bcyrpt passwords: ', err);
//           }
//           if (samePW) {
//             // Send response back to user
//             res.send(JSON.stringify({
//               response: 'Password match',
//             }));
//           } else {
//             res.send(JSON.stringify({
//               response: 'Invalid email/password combination',
//             }));
//           }
//         });
//       } // Close else
//     })
//     .catch(error => {
//       console.error('Error: ', error);
//     });
//   }); /* Closes our post */

// // Handle SignUp routing/authentication
// router.route('/signup')
//   .post((req, res) => {
//     const userInfo = req.body;
//     console.log('REQ.BODY on SIGNUP: ', req.body);
//     // Check database to see if email already exist
//     Users.findAll({
//       where: {
//         email: userInfo.email,
//       },
//     })
//     .then(result => {
//       // If email already exist in database, send error message back to client
//       console.log('RESULT from SQL Query on API File: ', result);

//       if (result.length > 0) {
//         res.send(JSON.stringify({
//           response: 'Email already exists',
//         }));
//       } else { /* If email doesn't exist in our database */
//         // Salt user password
//         bcrypt.genSalt(saltRounds, (err, salt) => {
//           if (err) {
//             console.log(err);
//           }
//           bcrypt.hash(userInfo.password, salt, (error, hash) => {
//             if (error) {
//               console.log(error);
//             }
//             // Save userinfo to database
//             Users.create({
//               firstname: userInfo.firstname,
//               lastname: userInfo.lastname,
//               password: hash,
//               email: userInfo.email,
//             })
//             .then(() => {
//               res.send(JSON.stringify({
//                 response: 'Account Created',
//               }));
//             })
//             .catch(errors => {
//               console.error('Error: ', errors);
//             });
//           });
//         }); // Close hash
//       } // Close else
//     })
//     .catch(err => {
//       console.err('Error: ', err);
//     });
//   }); /* Closes our post */

export default router;
