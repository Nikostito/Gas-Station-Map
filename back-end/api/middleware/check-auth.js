'use strict';
const jwt = require('jsonwebtoken');
const AUser = require('../models/user');

function check_auth(req, res, next){
  try {
    // Check JWT
    const header = process.env.AUTH_HEADER;
    const token = req.headers[header.toLowerCase()];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // Check if JWT is invalidated (from a previous logout)
    AUser.findOne({ username: decoded.username })
      .exec()
      .then(user => {
        if (!user.tokens.id(token)){
          console.log('check-auth: invalid JWT, not in mongodb');
          return res.status(403).json({
            message: '403 - Forbidden', // API spec
          });
        }
        // Token is valid
        // Pass these to protected routes, eg. logout route
        // for future invalidation purposes
        req.userDataTakenFromJwtToken = decoded;
        req.jwtTokenID = token;
        next();
      })
      .catch(err => {
        console.log(err);
        return res.status(555).json({
          error: err,
        });
      });
  } catch (err) {
    // API specs, user is not authenticated
    console.log('check-auth: invalid JWT / not authenticated');
    const error = new Error('403 - Forbidden');
    error.status = 403;
    next(error);
  }
};

module.exports = check_auth;
