package com.library.management;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-transactions")
@CrossOrigin(origins = "*")
public class BookTransactionController {

    private final BookTransactionService bookTransactionService;
    private final IssueRequestService issueRequestService;
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final BookService bookService;

    public BookTransactionController(
            BookTransactionService bookTransactionService,
            IssueRequestService issueRequestService,
            StudentService studentService,
            TeacherService teacherService,
            BookService bookService
    ) {
        this.bookTransactionService = bookTransactionService;
        this.issueRequestService = issueRequestService;
        this.studentService = studentService;
        this.teacherService = teacherService;
        this.bookService = bookService;
    }

    @PostMapping("/issue/{requestId}")
    public ResponseEntity<?> issueBook(
            @PathVariable Long requestId
    ) {
        IssueRequest request = issueRequestService.findById(requestId);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getStatus() != IssueRequest.Status.APPROVED) {
            return ResponseEntity.badRequest()
                    .body("Only approved requests can be issued.");
        }

        Book book = bookService.findById(request.getBookId());

        if (book == null) {
            return ResponseEntity.badRequest()
                    .body("Book not found.");
        }

        BookTransaction transaction;

        if ("STUDENT".equalsIgnoreCase(request.getUserType())) {

            Student student =
                    studentService.findById(request.getUserId());

            if (student == null) {
                return ResponseEntity.badRequest()
                        .body("Student not found.");
            }

            if (!studentService.canBorrow(student)) {
                return ResponseEntity.badRequest()
                        .body("Student cannot borrow this book.");
            }

            transaction =
                    bookTransactionService.createIssueTransaction(
                            "STUDENT",
                            student.getId(),
                            book
                    );

            studentService.issueBook(student);

        } else if ("TEACHER".equalsIgnoreCase(request.getUserType())) {

            Teacher teacher =
                    teacherService.findById(request.getUserId());

            if (teacher == null) {
                return ResponseEntity.badRequest()
                        .body("Teacher not found.");
            }

            if (!teacherService.canBorrow(teacher)) {
                return ResponseEntity.badRequest()
                        .body("Teacher cannot borrow another book.");
            }

            transaction =
                    bookTransactionService.createIssueTransaction(
                            "TEACHER",
                            teacher.getId(),
                            book
                    );

            teacherService.issueBook(teacher);

        } else {
            return ResponseEntity.badRequest()
                    .body("Invalid user type.");
        }

        request.setStatus(IssueRequest.Status.COMPLETED);
        issueRequestService.save(request);

        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/{transactionId}/return")
    public ResponseEntity<?> returnBook(
            @PathVariable Long transactionId,
            @RequestParam boolean damaged
    ) {
        BookTransaction transaction =
                bookTransactionService.findById(transactionId);

        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }

        if (transaction.getReturnDate() != null) {
            return ResponseEntity.badRequest()
                    .body("This book has already been returned.");
        }

        Book book =
                bookService.findById(transaction.getBookId());

        if (book == null) {
            return ResponseEntity.badRequest()
                    .body("Book not found.");
        }

        if ("STUDENT".equalsIgnoreCase(
                transaction.getUserType())) {

            Student student =
                    studentService.findById(transaction.getUserId());

            if (student == null) {
                return ResponseEntity.badRequest()
                        .body("Student not found.");
            }

            Transaction payment =
                    bookTransactionService.processStudentReturn(
                            student,
                            transaction,
                            book,
                            damaged
                    );

            if (damaged && payment != null) {
                return ResponseEntity.ok(payment);
            }

            return ResponseEntity.ok(transaction);

        } else if ("TEACHER".equalsIgnoreCase(
                transaction.getUserType())) {

            Teacher teacher =
                    teacherService.findById(transaction.getUserId());

            if (teacher == null) {
                return ResponseEntity.badRequest()
                        .body("Teacher not found.");
            }

            Transaction payment =
                    bookTransactionService.processTeacherReturn(
                            teacher,
                            transaction,
                            book,
                            damaged
                    );

            if (damaged && payment != null) {
                return ResponseEntity.ok(payment);
            }

            return ResponseEntity.ok(transaction);

        } else {
            return ResponseEntity.badRequest()
                    .body("Invalid user type.");
        }
    }

    @GetMapping
    public List<BookTransaction> getAll() {
        return bookTransactionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookTransaction> getById(
            @PathVariable Long id
    ) {
        BookTransaction transaction =
                bookTransactionService.findById(id);

        return transaction != null
                ? ResponseEntity.ok(transaction)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        if (bookTransactionService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        bookTransactionService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
