const dotenv = require('dotenv');
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();

// Configure ENV File 
dotenv.config({ path: './config.env' });
require('./db/conn');

// step=1
const port = process.env.PORT || 3001;






// Require Model
const Users = require('./models/userSchema');
const Message = require('./models/msgSchema');
const authenticate = require('./middleware/authenticate');
const { default: mongoose } = require('mongoose');



// These Method is Used to Get Data and cookies from FrontEnd
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());







// Registration 
app.post('/register', async (req, res) => {

    try {
        //Get body or Data
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;


        const createUser = new Users({
            username: username,
            email: email,
            password: password
        });


        const created = await createUser.save();
        console.log(created);
        res.status(200).send("Registered");

    } catch (error) {

        res.status(400).send(error)

    }
})




// Login User
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Find User if Exist
        const user = await Users.findOne({ email: email });
        if (user) {
            // Verify Password 
            const isMatch = await bcryptjs.compare(password, user.password);

            if (isMatch) {
                // Generate Token is Define in User Schema
                const token = await user.generateToken();

                res.cookie("jwt", token, {
                    // Expires Token in 24 Hours
                    expires: new Date(Date.now() + 86400000),
                    httpOnly: true
                })
                res.status(200).send("LoggedIn");

            } else {
                res.status(400).send("Invalid Credentials");
            }
        } else {
            res.status(400).send("Invalid Credentials");
        }

    } catch (error) {
        res.status(400).send(error);
    }
})






// Message 
app.post('/message', async (req, res) => {

    try {
        //Get body or Data
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;


        const sendMsg = new Message({
            name: name,
            email: email,
            message: message
        });

        // Save Method is Used  to Create User or Insert User
        // But Before Saving or Inserting, Password will Hash
        // Because of Hashing. After Hash, It will save to DB

        const created = await sendMsg.save();
        console.log(created);
        res.status(200).send("Sent");

    } catch (error) {

        res.status(400).send(error);

    }
})



// Logout Page
app.get('/logout', (req, res) => {
    res.clearCookie("jwt", { path: '/' })
    res.status(200).send("User Logged Out")
})



// Authentication
app.get('/auth', authenticate, (req, res) => {


})


// Vercel Code

//  app.use(express.static(path.join(__dirname, "./mypro/public")));

app.get("*", function (_, res) {
    res.sendFile(
        path.join(__dirname, "./mypro/public/index.html"),
        function (err) {
            if (err) {
                res.status(500).send(err);
            }
        }
    )
});



// step =3
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('mypro/build'));
    const path = require('path');
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'mypro', 'build', 'index.html'));
    })
}



// Run Server
app.listen(port, () => {
    console.log("Server is Listening")
})


