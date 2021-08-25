const expressJwt = require('express-jwt');

const authToken = () => {
  const jwtSecret = process.env.JWT_SECRET;
  const api = process.env.API_URL;
  return expressJwt({
    secret: jwtSecret,
    algorithms: ['HS256'],
    isRevoked: isRevoked, //to verify is he is admin user or not to post data
  }).unless({
    path: [
      `${api}/users/login`,
      `${api}/users/register`,
      //any product api with rejex, OPTIONS Tag is optional to specify the the type of methods
      { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, methods: ['GET'] },
      { url: /\/api\/v1\/orders(.*)/, methods: ['GET'] },
      { url: /\/uploads\/(.*)/, methods: ['GET'] },
    ],
  });
};

const isRevoked = async (req, payload, done) => {
  //if (!payload.isAdmin) done(null, true); //reject the user action if he is not an admin user
  done(); //successfully validated that he is an admin user
};
module.exports = authToken;
