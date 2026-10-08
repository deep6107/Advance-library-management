package com.library.management;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/issue-requests")
@CrossOrigin(origins = "*")
public class IssueRequestController {

    private final IssueRequestService issueRequestService;
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final BookService bookService;

    public IssueRequestController(
            IssueRequestService issueRequestService,
            StudentService studentService,
            TeacherService teacherService,
            BookService bookService
    ) {
        this.issueRequestService = issueRequestService;
        this.studentService = studentService;
        this.teacherService = teacherService;
        this.bookService = bookService;
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam String userType,
            @RequestParam String userId,
            @RequestParam Long bookId
    ) {
        Book book = bookService.findById(bookId);

        if (book == null) {
            return ResponseEntity.badRequest().body("Book not found.");
        }

        Student student = null;
        Teacher teacher = null;

        if ("STUDENT".equalsIgnoreCase(userType)) {
            student = studentService.findById(userId);

            if (student == null) {
                return ResponseEntity.badRequest()
                        .body("Student not found.");
            }
        } else if ("TEACHER".equalsIgnoreCase(userType)) {
            teacher = teacherService.findById(userId);

            if (teacher == null) {
                return ResponseEntity.badRequest()
                        .body("Teacher not found.");
            }
        } else {
            return ResponseEntity.badRequest()
                    .body("User type must be STUDENT or TEACHER.");
        }

        if (!issueRequestService.isEligible(
                userType,
                student,
                teacher,
                book
        )) {
            return ResponseEntity.badRequest()
                    .body("User is not eligible to borrow this book.");
        }

        IssueRequest request =
                issueRequestService.createRequest(
                        userType,
                        userId,
                        bookId
                );

        issueRequestService.setExpectedReturnDate(
                request,
                userType,
                LocalDate.now()
        );

        return ResponseEntity.ok(request);
    }

    @GetMapping
    public List<IssueRequest> getAll() {
        return issueRequestService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueRequest> getById(@PathVariable Long id) {
        IssueRequest request = issueRequestService.findById(id);

        return request != null
                ? ResponseEntity.ok(request)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (issueRequestService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        issueRequestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
