import React, { useState, useEffect } from "react";
import { Jumbotron, Container, Col, Form, Button } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { SAVE_BOOK } from "../utils/mutations";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import Auth from "../utils/auth";
import iso6391 from "iso-639-1";

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [saveBook, { error }] = useMutation(SAVE_BOOK);
  const [showFullDescriptionMap, setShowFullDescriptionMap] = useState({});

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
      );

      if (!response.ok) {
        throw new Error("something went wrong!");
      }

      const { items } = await response.json();

      const bookData = items.map((book) => {
        const volumeInfo = book.volumeInfo || {};
        const industryIdentifiers = volumeInfo.industryIdentifiers || [];

        return {
          bookId: book.id,
          authors: volumeInfo.authors || ["No author to display"],
          title: volumeInfo.title,
          description: volumeInfo.description,
          image: volumeInfo.imageLinks?.thumbnail || "",
          type:
            volumeInfo.categories && volumeInfo.categories.length > 0
              ? volumeInfo.categories.join(", ")
              : "",
          publisher: volumeInfo.publisher,
          year: volumeInfo.publishedDate
            ? new Date(volumeInfo.publishedDate).getFullYear()
            : null,
          language:
            iso6391.getName(book.volumeInfo.language) ||
            book.volumeInfo.language,
          binding: volumeInfo.printType === "BOOK" ? "Paperback" : "Unknown",
          pages: volumeInfo.pageCount,
          ratingCount: volumeInfo.ratingsCount || 0,
          isbn10:
            industryIdentifiers.find((id) => id.type === "ISBN_10")
              ?.identifier || "",
          isbn13:
            industryIdentifiers.find((id) => id.type === "ISBN_13")
              ?.identifier || "",
        };
      });

      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await saveBook({
        variables: { bookData: { ...bookToSave } },
      });

      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  const truncateText = (text, maxLength, bookId) => {
    if (text && text.length > maxLength && !showFullDescriptionMap[bookId]) {
      return `${text.slice(0, maxLength)}...`;
    }
    return text;
  };

  return (
    <>
      <Jumbotron
        fluid
        className="text-light"
        style={{ backgroundColor: "#f4f4f4" }}
      >
        <Container style={{ maxWidth: "900px" }}>
          <h1 style={{ color: "black" }}>Search for a Book</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={9}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="sm"
                  placeholder="Enter search term"
                />
              </Col>
              <Col xs={3}>
                <Button
                  style={{
                    width: "100%",
                    backgroundColor: "#007bff",
                    borderColor: "#007bff",
                  }}
                  type="submit"
                  variant="success"
                  size="sm"
                >
                  Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>
      <Container>
        <div
          style={{
            flexDirection: "col",
            overflowX: "auto",
          }}
        >
          {searchedBooks &&
            searchedBooks.map((book) => (
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
                      borderRadius: "20px",
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
                    <Button
                      disabled={savedBookIds?.some(
                        (savedId) => savedId === book.bookId
                      )}
                      className="btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.some((savedId) => savedId === book.bookId)
                        ? "Book Already Saved!"
                        : "Save This Book!"}
                    </Button>
                    <div style={{ paddingLeft: "10px", fontSize: "16px" }}>
                      {book.ratingCount} <strong>User Save</strong>
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

export default SearchBooks;
