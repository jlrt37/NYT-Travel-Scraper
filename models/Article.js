var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  headline: {
    type: String,
    unique: true
    },
  summary: {
    type: String
    
  },
  url: {
    type: String
    },

  isSaved: {
    type: Boolean,
    default: false
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
