const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./server/routes/index');
const app = express();
const port = '8080';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send(err.message);
});

module.exports = app;
