var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new ArticleSchema object
var ArticleSchema = new Schema({
  // `title` must be of type String and unique
  title: {
    type: String,
    unique: true
  },
  // `link` must be of type String
  link: String,
  // `excerpt` must be of type String
  excerpt: String,
  // `image` must be of type String
  image: String,
  // `current` must be of type Boolean and default true
  current: {
    type: Boolean,
    default: true
  },
  // Comments is an array of object ids linked to comments schema
  comment: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comments"
    }
  ]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
