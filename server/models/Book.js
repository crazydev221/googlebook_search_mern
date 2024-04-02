const { Schema } = require("mongoose");

// This is a subdocument schema, it won't become its own model but we'll use it as the schema for the User's `savedBooks` array in User.js
const bookSchema = new Schema({
  authors: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
  },
  // Saved book id from GoogleBooks
  bookId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  binding: {
    type: String,
  },
  isbn10: {
    type: String,
  },
  isbn13: {
    type: String,
  },
  language: {
    type: String,
  },
  pages: {
    type: Number,
  },
  ratingCount: {
    type: Number,
  },
  type: {
    type: String,
  },
  year: {
    type: Number,
  },
  publisher: {
    type: String,
  },
});

module.exports = bookSchema;
