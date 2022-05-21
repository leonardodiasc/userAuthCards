var mongoose = require('mongoose');
var quoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  author:{
    type: String,
    required: true,
    trim: true
  }
});


var Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;
