import React, { useState } from "react";
import {
  Jumbotron,
  Container,
  CardColumns,
  Card,
  Button,
} from "react-bootstrap";

import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import { removeBookId } from "../utils/localStorage";

import Auth from "../utils/auth";

const SavedBooks = () => {
  const { loading, data } = useQuery(QUERY_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  const [showFullDescriptionMap, setShowFullDescriptionMap] = useState({});

  const userData = data?.me || {};

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }
  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  };
  return (
    <>
      <Container>
        <div
          style={{
            flexDirection: "col", // Set the direction to row
            overflowX: "auto",
          }}
        >
          {userData &&
            userData.savedBooks?.map((book) => (
              <div
                key={book.bookId}
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "white",
                }}
              >
                {book.image && (
                  <img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    style={{
                      width: "150px",
                      height: "225px",
                      objectFit: "cover",
                      marginBottom: "10px",
                      paddingTop: "20px",
                      paddingLeft: "20px",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "20px",
                  }}
                >
                  <h5>{book.title}</h5>
                  <p className="small">Authors: {book.authors.join(", ")}</p>
                  <p>
                    {showFullDescriptionMap[book.bookId]
                      ? book.description
                      : truncateText(book.description, 250, book.bookId)}
                    {book.description && book.description.length > 250 && (
                      <span
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() =>
                          setShowFullDescriptionMap((prev) => ({
                            ...prev,
                            [book.bookId]: !prev[book.bookId],
                          }))
                        }
                      >
                        {showFullDescriptionMap[book.bookId]
                          ? " less..."
                          : " more..."}
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Genere:</strong> {book.type}
                  </p>
                  <p>
                    <strong>Editore:</strong> {book.publisher}
                  </p>
                  <p>
                    <strong>Anno:</strong> {book.year}
                  </p>
                  <p>
                    <strong>Lingua:</strong> {book.language}
                  </p>
                  <p>
                    <strong>Rilegatura:</strong> {book.binding}
                  </p>
                  <p>
                    <strong>Pagine:</strong> {book.pages} Pagine
                  </p>
                  <p>
                    <strong>ISBN10:</strong> {book.isbn10}
                  </p>
                  <p>
                    <strong>ISBN13:</strong> {book.isbn13}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      marginTop: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "baseline",
                        marginTop: "0.5rem",
                      }}
                    >
                      <Button
                        className="btn-danger"
                        onClick={() => handleDeleteBook(book.bookId)}
                      >
                        Delete this Book!
                      </Button>
                      <div
                        style={{
                          paddingLeft: "10px",
                          fontSize: "16px",
                          width: "200px",
                        }}
                      >
                        {book.ratingCount} <strong>User Save</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Container>
    </>
  );
};

export default SavedBooks;
