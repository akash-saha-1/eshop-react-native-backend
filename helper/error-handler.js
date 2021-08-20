const errorHandler = (err, req, res, next) => {
  //JWT authentication error
  if (err.name === 'UnauthorizedError')
    res.status(401).json({ message: 'the user is not authorized' });

  //Validation error
  if (err.name === 'ValidationError') res.status(400).json({ message: err });

  // for general errros
  if(err) return res.status(500).json(err);
};

module.exports = errorHandler;
