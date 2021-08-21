const jwt_decode = require('jwt-decode');

const verifyAdmin = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken)
    return res
      .status(401)
      .send('The user is unauthorized to access this endpoint');

  var decoded = jwt_decode(authToken);
  if (!decoded.isAdmin === true)
    return res
      .status(401)
      .send('The user is unauthorized to access this endpoint');
};

module.exports = verifyAdmin;
