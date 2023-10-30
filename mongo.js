// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const session = require('express-session');

// Create an Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mywebsite', { useNewUrlParser: true });

// Define a user schema and model
const User = mongoose.model('User', new mongoose.Schema({
   username: String,
   password: String
}));

// Configure Passport for user authentication
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Serve a login page
app.get('/login', (req, res) => {
   res.send(`
       <h1>Login</h1>
       <form method="post" action="/login">
           <label>Username: <input type="text" name="username"></label><br>
           <label>Password: <input type="password" name="password"></label><br>
           <input type="submit" value="Login">
       </form>
   `);
});

// Handle user login
app.post('/login', passport.authenticate('local', {
   successRedirect: '/details',
   failureRedirect: '/login'
}));

// Serve a registration page
app.get('/register', (req, res) => {
   res.send(`
       <h1>User Registration</h1>
       <form method="post" action="/register">
           <label>Username: <input type="text" name="username"></label><br>
           <label>Password: <input type="password" name="password"></label><br>
           <input type="submit" value="Register">
       </form>
   `);
});

// Handle user registration
app.post('/register', (req, res) => {
   const newUser = new User({ username: req.body.username });
   User.register(newUser, req.body.password, (err, user) => {
       if (err) {
           console.error(err);
           return res.send('Registration failed.');
       }
       passport.authenticate('local')(req, res, () => {
           res.redirect('/details');
       });
   });
});

// Serve a form for entering user details
app.get('/details', (req, res) => {
   if (req.isAuthenticated()) {
       res.send(`
           <h1>Enter User Details</h1>
           <form method="post" action="/details">
               <label>Date: <input type="date" name="detail1"></label><br>
               <label>Bilty no: <input type="number" name="detail2"></label><br>
               <label>Branch: <input type="text" name="detail3"></label><br>
               <label>From: <input type="text" name="detail4"></label><br>
               <label>To: <input type="text" name="detail5"></label><br>
               <label>Consignee: <input type="text" name="detail6"></label><br>
               <label>No of Packages: <input type="number" name="detail7"></label><br>
               <label>Vehicle no: <input type="number" name="detail8"></label><br>
               <label for="vehicle-type">Vehicle Type: < name="detail9"></label><select id="vehicle-type"> <option value="car">Car</option>
               <option value="motorcycle">Motorcycle</option>
               <option value="truck">Truck</option>
               <option value="bicycle">Bicycle</option>
               <option value="scooter">Scooter</option>
           </select><br>
               <input type="submit" value="Submit Details">
           </form>
       `);
   } else {
       res.redirect('/login'); // Redirect to the login page if not authenticated
   }
});

// Handle user details submission
app.post('/details', (req, res) => {
   if (req.isAuthenticated()) {
       const userId = req.user._id; // Assuming you have a user session
       // Save user details to MongoDB
       const userDetail = {
           userId: userId,
           detail1: req.body.detail1,
           detail2: req.body.detail2,
           detail3: req.body.detail3,
           detail4: req.body.detail4,
           detail5: req.body.detail5,
           detail6: req.body.detail6,
           detail7: req.body.detail7,
           detail8: req.body.detail8,
           detail9: req.body.detail9
       };
       // Create a model for user details and save to MongoDB
       const UserDetails = mongoose.model('UserDetails', new mongoose.Schema({
           userId: String,
           detail1: Date,
           detail2: Number,
           detail3: String,
           detail4: String,
           detail5: String,
           detail6: String,
           detail7: Number,
           detail8: Number,
           detail9: String

       }));
       UserDetails.create(userDetail, (err, detail) => {
           if (err) {
               console.error(err);
               return res.send('Failed to save user details.');
           }
           res.send('Details saved successfully.');
       });
   } else {
       res.redirect('/login'); // Redirect to the login page if not authenticated
   }
});

// Start the server
app.listen(3000, () => {
   console.log('Server is running on http://localhost:3000');
});