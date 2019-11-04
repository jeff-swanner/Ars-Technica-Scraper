var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new CommentSchema object
// This is similar to a Sequelize model
var CommentSchema = new Schema({
  // `username` must be of type String
  username: String,
  // `body` must be of type String
  body: String
});

// This creates our model from the above schema, using mongoose's model method
var Comments = mongoose.model("Comments", CommentSchema);

// Export the Note model
module.exports = Comments;
