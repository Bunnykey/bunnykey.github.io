import type { Book, SavedBook, SavedBookDetail } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function getSavedBooks(limit: number = 10): Promise<SavedBook[]> {
  try {
    const response = await fetch(`${API_URL}/books?limit=${limit}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.status}`);
    }

    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.error("Failed to fetch saved books:", error);
    return [];
  }
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `${API_URL}/aladin/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.error("Failed to search books:", error);
    return [];
  }
}

export async function getBookById(id: string): Promise<SavedBookDetail | null> {
  try {
    const response = await fetch(`${API_URL}/books/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.book || null;
  } catch (error) {
    console.error("Failed to fetch book:", error);
    return null;
  }
}

export async function saveBook(book: Book): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to save book:", error);
    return false;
  }
}
