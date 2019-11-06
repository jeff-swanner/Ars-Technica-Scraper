// Requires necessary node modules
var express = require("express");
var logger = require("morgan");
var exphbs = require("express-handlebars");

// Sets port to either heroku env or 3000
var PORT = process.env.PORT || 3000;

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

// Setup handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Require Routes
var routes = require("./controllers/appController.js");
app.use(routes);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
