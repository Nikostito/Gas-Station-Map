'use strict';

function check_xml(req, res, next){
  if (req.query.format){ // Checks if "format" doesn't exist at all in the query
    if (req.query.format.toLowerCase() === 'xml') {
      const error = new Error('Bad Request');
      error.status = 400;
      next(error);
    }
  }
  next();
};

module.exports = check_xml;
