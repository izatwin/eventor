let express = require('express');
let cookieParser = require('cookie-parser');
//setup express app 
let app = express()

app.use(cookieParser());


//basic route for homepage 
app.get('/', (req, res) => {
    res.send('welcome to express app');
});

//Route for adding cookie 
app.get('/login', (req, res) => {
    res.cookie("auth_token", "abcdefg2", {expire: 10000 + Date.now()});
    res.send('user data added to cookie');
});

//Iterate users data from cookie 
app.get('/getcookie', (req, res) => {
    //shows all the cookies 
    res.send(req.cookies);
});

//server listens to port 3000 
app.listen(3000, (err) => {
    if (err)
        throw err;
    console.log('listening on port 3000');
}); 