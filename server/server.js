const createError = require('http-errors');
const express = require('express');
const cors = require("cors");
require('dotenv').config({ path: '../.env' });

const mongoose = require("mongoose")

// MongoDB connection
mongoose.connect(process.env.DB_CONNECTION)
  .then(() => console.log('Connected to database'))
  .catch((error) => console.log(error));


const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const postRouter = require('./routes/posts')
const userRouter = require('./routes/user')
const commentRouter = require('./routes/comment')
const eventRouter = require('./routes/events')

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend origin
  credentials: true, // Allow credentials to be sent
};

// parse requests of content-type - application/json
app.use(express.json());
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/api/posts', postRouter);
app.use('/api/user', userRouter)
app.use('/api/comments', commentRouter);
app.use('/api/events', eventRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app;
