const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const errorHandler = require('./helper/error-handler');
const authToken = require('./helper/jwt');
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');

const api = process.env.API_URL;
const port = process.env.PORT_NUMBER;
const dbUserName = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

// app.use(cors());
// app.options('*', cors());

app.use(function(req, res, next) {
    console.log(2);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Middlewire
app.use(express.json());
app.use(morgan('tiny'));
app.use(authToken());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(errorHandler);

//routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

//to remove deprecation
mongoose.set('useFindAndModify', false);
// mongoose connection
mongoose
    .connect(
        `mongodb+srv://${dbUserName}:${dbPassword}@cluster0.efy2d.mongodb.net/${dbName}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then((res) => {
        console.log('Server is started on Port ' + port);
    })
    .catch((err) => {
        console.error(err);
    });

app.listen(port, () => {});