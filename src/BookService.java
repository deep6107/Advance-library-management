package com.library.management;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Book save(Book book) {
        return bookRepository.save(book);
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public Book findById(Long id) {
        return bookRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    public boolean isAvailable(Book book) {
        return book != null && book.getAvailableCopies() > 0;
    }

    public void issueCopy(Book book) {
        if (!isAvailable(book)) {
            throw new IllegalStateException(
                    "No copies of this book are currently available."
            );
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        save(book);
    }

    public void returnCopy(Book book) {
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            save(book);
        }
    }

    public void addCopies(Book book, int copies) {
        if (copies <= 0) {
            throw new IllegalArgumentException(
                    "Number of copies must be greater than zero."
            );
        }

        book.setTotalCopies(book.getTotalCopies() + copies);
        book.setAvailableCopies(book.getAvailableCopies() + copies);

        save(book);
    }

    public void removeCopies(Book book, int copies) {
        if (copies <= 0) {
            throw new IllegalArgumentException(
                    "Number of copies must be greater than zero."
            );
        }

        if (copies > book.getAvailableCopies()) {
            throw new IllegalStateException(
                    "Cannot remove more copies than available."
            );
        }

        book.setTotalCopies(book.getTotalCopies() - copies);
        book.setAvailableCopies(book.getAvailableCopies() - copies);

        save(book);
    }
}
