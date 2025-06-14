/**
 * BookNest - Enhanced Book Discovery App
 * Features: Homepage feed, search books, view book details, and rate them.
 */

// Load homepage books when DOM is ready
window.addEventListener("DOMContentLoaded", function () {
    fetchBooksCombined("fiction best sellers");
  
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
  
    // Search on Enter key press
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        fetchBooksCombined(this.value);
      }
    });
  
    // Search on button click
    searchBtn.addEventListener("click", function () {
      fetchBooksCombined(searchInput.value);
    });
  });
  
  /**
   * Fetch books from Google Books API
   * @param {string} query - The search query
   */
  async function fetchBooksCombined(query) {
    const container = document.getElementById("bookContainer");
    container.innerHTML = '<div class="loading">🔍 Searching for books...</div>';
  
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`);
      const data = await response.json();
  
      if (data.items && data.items.length > 0) {
        displayBooksGoogle(data.items);
      } else {
        container.innerHTML = '<div class="error">📚 No books found. Try another keyword.</div>';
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      container.innerHTML = '<div class="error">❌ Failed to fetch books. Please try again later.</div>';
    }
  }
  
  /**
   * Display books in the DOM
   * @param {Array} books - Array of book objects
   */
  function displayBooksGoogle(books) {
    const container = document.getElementById("bookContainer");
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    container.style.gap = "20px";
  
    books.forEach(book => {
      const info = book.volumeInfo;
      const title = info.title || "Untitled";
      const author = info.authors?.join(", ") || "Unknown Author";
      const description = info.description || "No description available.";
      const publishedDate = info.publishedDate || "Unknown date";
      const img = info.imageLinks?.thumbnail?.replace("http://", "https://") || "https://via.placeholder.com/128x192?text=No+Cover";
  
      const card = document.createElement("div");
      card.className = "book-card search-book-card clickable-card";
      card.style.cursor = "pointer";
      card.onclick = () => openBookDetailPage({ title, author, description, publishedDate, img });
  
      card.innerHTML = `
        <div class="book-cover">
          <img src="${img}" alt="${title} cover" style="width:100%; height:auto; border-radius:8px;">
        </div>
        <div class="book-info">
          <h3 class="book-title">${title}</h3>
          <p class="book-author">by ${author}</p>
          <p class="book-description">${description.substring(0, 100)}...</p>
        </div>
      `;
  
      container.appendChild(card);
    });
  }
  
  /**
   * Navigate to book.html with book info saved in localStorage
   * @param {Object} book - Book data to show in detail page
   */
  function openBookDetailPage(book) {
    localStorage.setItem("selectedBook", JSON.stringify(book));
    window.location.href = "books.html";
  }
  
  /**
   * Save a book to "My Books" in localStorage
   */
  function selectBook(title, author) {
    const savedBooks = JSON.parse(localStorage.getItem("myBooks")) || [];
    savedBooks.push({ title, author });
    localStorage.setItem("myBooks", JSON.stringify(savedBooks));
    alert(`✅ "${title}" by ${author} added to your books!`);
  }
  
  /**
   * Set a featured book rating (from sidebar demo)
   */
  function setRating(value) {
    localStorage.setItem("bookRating", value);
    alert(`⭐ You rated this book: ${value}/5`);
  }
  
  /**
   * Mark a book as read (sidebar demo)
   */
  function markAsRead() {
    alert("📘 Marked as read!");
  }
  
  /**
   * Add a book to wishlist (sidebar demo)
   */
  function addToWishlist() {
    alert("📚 Added to your wishlist!");
  }
  