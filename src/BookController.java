package com.library.management;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public Book create(@RequestBody Book book) {
        return bookService.save(book);
    }

    @GetMapping
    public List<Book> getAll() {
        return bookService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getById(@PathVariable Long id) {
        Book book = bookService.findById(id);

        return book != null
                ? ResponseEntity.ok(book)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(
            @PathVariable Long id,
            @RequestBody Book updated
    ) {
        Book book = bookService.findById(id);

        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        book.setTitle(updated.getTitle());
        book.setAuthor(updated.getAuthor());
        book.setIsbn(updated.getIsbn());
        book.setCategory(updated.getCategory());
        book.setPrice(updated.getPrice());
        book.setTotalCopies(updated.getTotalCopies());
        book.setAvailableCopies(updated.getAvailableCopies());
        book.setAvailabilityDate(updated.getAvailabilityDate());

        return ResponseEntity.ok(bookService.save(book));
    }

    @PutMapping("/{id}/add-copies")
    public ResponseEntity<Book> addCopies(
            @PathVariable Long id,
            @RequestParam int copies
    ) {
        Book book = bookService.findById(id);

        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        bookService.addCopies(book, copies);

        return ResponseEntity.ok(book);
    }

    @PutMapping("/{id}/remove-copies")
    public ResponseEntity<Book> removeCopies(
            @PathVariable Long id,
            @RequestParam int copies
    ) {
        Book book = bookService.findById(id);

        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        bookService.removeCopies(book, copies);

        return ResponseEntity.ok(book);
    }

    @GetMapping("/{id}/available")
    public ResponseEntity<Boolean> isAvailable(@PathVariable Long id) {
        Book book = bookService.findById(id);

        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(bookService.isAvailable(book));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (bookService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
