import { gql } from "@apollo/client";

export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        image
        description
        title
        link
        binding
        isbn10
        isbn13
        language
        pages
        ratingCount
        type
        year
        publisher
      }
    }
  }
`;
