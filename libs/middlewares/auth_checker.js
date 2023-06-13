const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

 const isLoggedIn = async (req, res, next) => {
    try {
        console.log(req.headers)
      if (!req.headers.authorization) {
        return res.unauthorized('Authentication required');
      }
      const token = req.headers.authorization.replace(/Bearer /, '');
  
      const decoded = jwt.verify(token, 'MaNaN-PaTeL');
  
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
  
      next();
    } catch (error) {
      return res.unauthorized('Authentication required');
    }
  };
  module.exports = {isLoggedIn};