var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var moment = require('moment');

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
db.User.create({ name: "guest" })
  .then(function(dbUser) {
    console.log(dbUser);
  })
  .catch(function(err) {
    console.log(err.message);
  });

// Routes

// Route for retrieving all Notes from the db
app.get("/currentArticles", function(req, res) {
  // Find all Notes
  db.Articles.find({current: true})
    .sort({"_id":-1})
    .populate('comment')
    .then(function(dbNote) {
        res.json(dbNote);

        
      // If all Notes are successfully found, send them back to the client
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    var data = [];
    db.Articles.updateMany({}, {$set: {'current': false}})
        .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
        });
    // First, we grab the body of the html with axios
    axios.get("https://arstechnica.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $(".article").each(function(i, element) {
        // Save an empty result object
        
        var result = {};
        // Add the text and href of every link, and save them as properties of the result object
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
            console.log(dbArticle);
            res.send(dbArticle);
          })
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
      res.send(data);
      // Send a message to the client
      
    });
});

// Route for retrieving all Users from the db
app.get("/saved", function(req, res) {
  // Find all Users
  db.User.find({name: 'guest'})
    .populate({
        path : 'articles',
        populate : {
          path : 'comment'
        }
    })
    .then(function(dbUser) {
      // If all Users are successfully found, send them back to the client
      res.json(dbUser);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

app.get("/timestamp/:id",function(req,res){
    db.Comments.find({_id: req.params.id})
    .then(function(com){
        console.log(com[0]._id);
        res.json(moment(com[0]._id.getTimestamp()).fromNow());
    });
    
});

app.get("/deletecomment/:id",function(req,res){
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

app.post("/deletearticle/:id",function(req,res){
    console.log(req.params.id);
    db.User.update({$pull: {articles: req.params.id}},function(error,removed) {
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

// Route for saving a new Note to the db and associating it with a User
app.post("/saveArticle", function(req, res) {
  // Create a new Note in the db
  db.User.findOneAndUpdate({name:'guest'},{$addToSet: { articles: req.body.id }}, { new: true })
    .then(function(dbUser) {
      // If the User was updated successfully, send it back to the client
      console.log(dbUser);
      res.json(dbUser);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    req.body.username = 'guest';
    db.Comments.create(req.body)
      .then(function(dbComment) {
        res.json(dbComment);
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Articles.findOneAndUpdate({ _id: req.params.id }, {$push: { comment: dbComment._id }}, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Route to get all User's and populate them with their notes

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
