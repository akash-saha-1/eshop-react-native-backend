const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const productsRouter = require('./routers/products');

const api = process.env.API_URL;
const port = process.env.PORT_NUMBER;
const dbUserName = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

app.use(cors());
app.options('*', cors());

//Middlewire
app.use(express.json());
app.use(morgan('tiny'));

//routers
app.use(`${api}/products`, productsRouter);

mongoose
  .connect(
    `mongodb+srv://${dbUserName}:${dbPassword}@cluster0.efy2d.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .catch((err) => {
    console.error(err);
  });

app.listen(port, () => {
  console.log('Server is started on Port ' + port);
});
