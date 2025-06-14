"use client"

import { useState, useEffect } from "react"
import { Search, Star, BookOpen, User, Home, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Book {
  id: string
  title: string
  authors: string[]
  description: string
  publishedDate: string
  imageLinks?: {
    thumbnail: string
  }
  averageRating?: number
  ratingsCount?: number
}

interface UserBook extends Book {
  userRating?: number
  status: "want-to-read" | "currently-reading" | "read"
  dateAdded: string
  userReview?: string
}

export default function GoodreadsClone() {
  const [books, setBooks] = useState<Book[]>([])
  const [myBooks, setMyBooks] = useState<UserBook[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "mybooks" | "search">("home")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")

  // Load initial recommendations and user's books
  useEffect(() => {
    fetchRecommendations()
    loadMyBooks()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=fiction+bestsellers&maxResults=12&orderBy=relevance`,
      )
      const data = await response.json()
      if (data.items) {
        const formattedBooks = data.items.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title || "Untitled",
          authors: item.volumeInfo.authors || ["Unknown Author"],
          description: item.volumeInfo.description || "No description available.",
          publishedDate: item.volumeInfo.publishedDate || "Unknown date",
          imageLinks: item.volumeInfo.imageLinks,
          averageRating: item.volumeInfo.averageRating,
          ratingsCount: item.volumeInfo.ratingsCount,
        }))
        setBooks(formattedBooks)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    }
    setLoading(false)
  }

  const searchBooks = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setActiveTab("search")
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20`,
      )
      const data = await response.json()
      if (data.items) {
        const formattedBooks = data.items.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title || "Untitled",
          authors: item.volumeInfo.authors || ["Unknown Author"],
          description: item.volumeInfo.description || "No description available.",
          publishedDate: item.volumeInfo.publishedDate || "Unknown date",
          imageLinks: item.volumeInfo.imageLinks,
          averageRating: item.volumeInfo.averageRating,
          ratingsCount: item.volumeInfo.ratingsCount,
        }))
        setBooks(formattedBooks)
      }
    } catch (error) {
      console.error("Error searching books:", error)
    }
    setLoading(false)
  }

  const loadMyBooks = () => {
    const saved = localStorage.getItem("myBooks")
    if (saved) {
      setMyBooks(JSON.parse(saved))
    }
  }

  const addToMyBooks = (book: Book, status: "want-to-read" | "currently-reading" | "read") => {
    const userBook: UserBook = {
      ...book,
      status,
      dateAdded: new Date().toISOString(),
      userRating: userRating || undefined,
      userReview: userReview || undefined,
    }

    const updatedBooks = [...myBooks.filter((b) => b.id !== book.id), userBook]
    setMyBooks(updatedBooks)
    localStorage.setItem("myBooks", JSON.stringify(updatedBooks))

    // Reset form
    setUserRating(0)
    setUserReview("")
    setSelectedBook(null)
  }

  const removeFromMyBooks = (bookId: string) => {
    const updatedBooks = myBooks.filter((b) => b.id !== bookId)
    setMyBooks(updatedBooks)
    localStorage.setItem("myBooks", JSON.stringify(updatedBooks))
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    )
  }

  const BookCard = ({ book, showActions = true }: { book: Book; showActions?: boolean }) => {
    const isInMyBooks = myBooks.some((b) => b.id === book.id)
    const userBook = myBooks.find((b) => b.id === book.id)

    return (
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img
              src={book.imageLinks?.thumbnail?.replace("http://", "https://") || "/placeholder.svg?height=120&width=80"}
              alt={book.title}
              className="w-20 h-30 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {book.authors.join(", ")}</p>

              {book.averageRating && (
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(book.averageRating)}
                  <span className="text-xs text-gray-500">({book.ratingsCount || 0} ratings)</span>
                </div>
              )}

              {userBook && (
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {userBook.status.replace("-", " ")}
                  </Badge>
                  {userBook.userRating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs">Your rating:</span>
                      {renderStars(userBook.userRating)}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{book.description.substring(0, 100)}...</p>

              {showActions && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedBook(book)} className="text-xs">
                    {isInMyBooks ? "Update" : "Add to Books"}
                  </Button>
                  {isInMyBooks && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromMyBooks(book.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white p-6">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Next Book</h1>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="🔍 Search Books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchBooks()}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            />
            <Button onClick={searchBooks} size="sm" variant="secondary">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <nav className="space-y-2">
          <Button
            variant={activeTab === "home" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-white/20"
            onClick={() => setActiveTab("home")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home Feed
          </Button>
          <Button
            variant={activeTab === "mybooks" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-white/20"
            onClick={() => setActiveTab("mybooks")}
          >
            <Library className="w-4 h-4 mr-2" />
            My Books ({myBooks.length})
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex justify-end items-center">
          <div className="flex items-center gap-3">
            <span className="font-medium">Femma</span>
            <Avatar>
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "home" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Book Recommendations</h2>
              {loading ? (
                <div className="text-center py-8">🔍 Loading recommendations...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "search" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Search Results</h2>
              {loading ? (
                <div className="text-center py-8">🔍 Searching for books...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "mybooks" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Books</h2>
              {myBooks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  📚 No books in your library yet. Start by adding some books!
                </div>
              ) : (
                <div className="space-y-6">
                  {["want-to-read", "currently-reading", "read"].map((status) => {
                    const statusBooks = myBooks.filter((book) => book.status === status)
                    if (statusBooks.length === 0) return null

                    return (
                      <div key={status}>
                        <h3 className="text-lg font-semibold mb-3 capitalize">
                          {status.replace("-", " ")} ({statusBooks.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {statusBooks.map((book) => (
                            <div key={book.id}>
                              <BookCard book={book} />
                              {book.userReview && (
                                <Card className="mt-2">
                                  <CardContent className="p-3">
                                    <p className="text-sm text-gray-600">Your review:</p>
                                    <p className="text-sm mt-1">{book.userReview}</p>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-600">by {selectedBook.authors.join(", ")}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBook(null)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={
                    selectedBook.imageLinks?.thumbnail?.replace("http://", "https://") ||
                    "/placeholder.svg?height=150&width=100"
                  }
                  alt={selectedBook.title}
                  className="w-24 h-36 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Published: {selectedBook.publishedDate}</p>
                  {selectedBook.averageRating && (
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(selectedBook.averageRating)}
                      <span className="text-sm text-gray-500">({selectedBook.ratingsCount || 0} ratings)</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700">{selectedBook.description.substring(0, 300)}...</p>

              <div>
                <label className="block text-sm font-medium mb-2">Your Rating:</label>
                {renderStars(userRating, true, setUserRating)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Review:</label>
                <Textarea
                  placeholder="Write your review..."
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => addToMyBooks(selectedBook, "want-to-read")} className="flex-1" variant="outline">
                  Want to Read
                </Button>
                <Button
                  onClick={() => addToMyBooks(selectedBook, "currently-reading")}
                  className="flex-1"
                  variant="outline"
                >
                  Reading
                </Button>
                <Button onClick={() => addToMyBooks(selectedBook, "read")} className="flex-1">
                  Read
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
