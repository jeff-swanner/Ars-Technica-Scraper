// Requires necessary node modules
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var moment = require('moment');

// Sets port to either heroku env or 3000
var PORT = process.env.PORT || 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var mongoDB_URI = process.env.MONGODB_URI || "mongodb://localhost/ArsTechnicadb";
// Connect to the Mongo DB
mongoose.connect(mongoDB_URI, { useNewUrlParser: true });

// When the server starts, create and save a new User document to the db
// The "unique" rule in the User model's schema will prevent duplicate users from being added to the server
// guest is the default user with options to expand and add login in future
db.User.create({ name: "guest" })
.then(function(dbUser) {
console.log(dbUser);
})
.catch(function(err) {
console.log(err.message);
});


// Routes

// Route for retrieving all current articles from the db
app.get("/currentArticles", function(req, res) {
    // Find all articles with current set to true
    db.Articles.find({current: true})
        .sort({"_id":-1})
        .populate('comment')
        .then(function(dbArticles) {
            res.json(dbArticles);
        })
        .catch(function(err) {
        // If an error occurs, send the error back to the client
        res.json(err);
        });
});

// A GET route for scraping the Ars Technica website
app.get("/scrape", function(req, res) {
    var data = [];
    // Sets all articles to not current
    db.Articles.updateMany({}, {$set: {'current': false}})
        .then(function(dbArticle) {
            // View the added result in the console
        })
        .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
        });
    // First, we grab the body of the html with axios
    axios.get("https://arstechnica.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every article class, and do the following:
      $(".article").each(function(i, element) {
        // Save an empty result object
        
        var result = {};
        result.title = $(element)
            .children().find("header h2 a").text();

        result.link = $(element)
            .children().find("header h2 a").attr("href");

        result.excerpt = $(element)
            .children().find('header p').text();
        
        result.image = $(element)
            .children().find('figure div').attr('style').split("'")[1];

        data.push(result);
        // Create a new Article using the `result` object built from scraping
        db.Articles.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
          })
          // if error due to already existing the current is set to true. this way only articles currently displayed are shown on homepage
          .catch(function(err) {
            db.Articles.update({title: result.title},{$set: {'current': true}})
            .then(function(dbArticle) {
                console.log("current updated")
            })
            .catch(function(err) {
                console.log(err);
            });            
          });
      });
      // Sends success back
      res.send("Success");
    });
});

// Route for retrieving all saved articles and associatec comments
app.get("/saved", function(req, res) {
  // Finds the guest user and populates the saved articles and comments
  db.User.find({name: 'guest'})
    .populate({
        path : 'articles',
        populate : {
          path : 'comment'
        }
    })
    .then(function(data) {
      // sends data back to client
      res.json(data);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Get route for sending timestamp of comments
app.get("/timestamp/:id",function(req,res){
    // Finds comment in database
    db.Comments.find({_id: req.params.id})
        .then(function(com){
            // Uses moment to calculate how long ago comment was made
            res.json(moment(com[0]._id.getTimestamp()).fromNow());
        });
});

// Get route for deleting comments
app.get("/deletecomment/:id",function(req,res){
    // Removes comment from database based on id
    db.Comments.remove({_id: req.params.id},function(error,removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
      }
    })
});

// Get route for unsaving articles from user 
app.post("/deletearticle/:id",function(req,res){
    // Removes article from user article array
    db.User.update({name: 'guest'},{$pull: {articles: req.params.id}},function(error,removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
      }
    })
});

// Route for saving a new article to user 
app.post("/saveArticle", function(req, res) {
  // Finds guest user and adds articles id to articles
  db.User.findOneAndUpdate({name:'guest'},{$addToSet: { articles: req.body.id }}, { new: true })
    .then(function(data) {
      // If the User was updated successfully, send it back to the client
      res.json(data);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Route for creating a new comment
app.post("/articles/:id", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    // Sets username as guest
    req.body.username = 'guest';

    // Adds comment to database
    db.Comments.create(req.body)
        .then(function(dbComment) {
            // Sends comment back on success
            res.json(dbComment);
            // If a comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new comment
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Articles.findOneAndUpdate({ _id: req.params.id }, {$push: { comment: dbComment._id }}, { new: true });
        })
        .then(function(dbArticle) {
        // If we were able to successfully update an Article
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
