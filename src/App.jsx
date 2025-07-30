import { useState, useEffect, useMemo } from "react";
import "./App.css";
import { BASEURL } from "./utils/Constants";

// ✅ Your debounce utility
function debounce(func, timeout) {
  let timerId = null;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

function App() {
  const [searchText, setSearchText] = useState("");
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");

  async function initiateSearch(value) {
    setLoader(true);
    try {
      let endPoint = `${BASEURL}books?search=${value}&limit=10&page=${pageNo}&sortBy=name&order=${sortOrder}`;
      console.log({ endPoint });

      const resp = await fetch(endPoint);
      if (resp.status !== 200) {
        return;
      }
      const respJSON = await resp.json();
      setData(respJSON);
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  }

  // ✅ Memoized debounce for search only
  const debouncedSearch = useMemo(
    () => debounce(initiateSearch, 500),
    [pageNo, sortOrder] // New debounce if page/sort changes
  );

  // ✅ Call API on page or sort change too
  useEffect(() => {
    debouncedSearch(searchText);
  }, [pageNo, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "1rem" }}>
      <h2>📚 Book Search</h2>
      <input
        type="text"
        value={searchText}
        onChange={(event) => {
          const value = event.currentTarget.value;
          setSearchText(value);
          debouncedSearch(value);
        }}
        placeholder="Search books..."
      />

      {loader && <p>Loading...</p>}

      {/* ✅ Table container */}
      <table border="1" cellPadding="8" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th onClick={handleSortToggle} style={{ cursor: "pointer" }}>
              Name {sortOrder === "asc" ? "🔼" : "🔽"}
            </th>
            <th>Author</th>
            <th>Price</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && !loader && (
            <tr>
              <td colSpan="5">No results</td>
            </tr>
          )}
          {data.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.name}</td>
              <td>{book.book_author}</td>
              <td>{book.price}</td>
              <td>{new Date(book.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Pagination controls */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          onClick={() => {
            if (pageNo > 1) setPageNo((prev) => prev - 1);
          }}
        >
          {"<- Prev"}
        </button>
        <span>Page: {pageNo}</span>
        <button
          onClick={() => {
            setPageNo((prev) => prev + 1);
          }}
        >
          {"Next ->"}
        </button>
      </div>
    </div>
  );
}

export default App;
