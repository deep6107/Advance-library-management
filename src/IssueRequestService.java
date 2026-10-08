package com.library.management;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class IssueRequestService {

    private final IssueRequestRepository issueRequestRepository;
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final BookService bookService;

    public IssueRequestService(
            IssueRequestRepository issueRequestRepository,
            StudentService studentService,
            TeacherService teacherService,
            BookService bookService
    ) {
        this.issueRequestRepository = issueRequestRepository;
        this.studentService = studentService;
        this.teacherService = teacherService;
        this.bookService = bookService;
    }

    public IssueRequest save(IssueRequest request) {
        return issueRequestRepository.save(request);
    }

    public List<IssueRequest> findAll() {
        return issueRequestRepository.findAll();
    }

    public IssueRequest findById(Long id) {
        return issueRequestRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        issueRequestRepository.deleteById(id);
    }

    public IssueRequest createRequest(
            String userType,
            String userId,
            Long bookId
    ) {
        IssueRequest request = new IssueRequest();

        request.setUserType(userType);
        request.setUserId(userId);
        request.setBookId(bookId);
        request.setRequestDate(LocalDateTime.now().toString());

        return save(request);
    }

    public boolean isEligible(
            String userType,
            Student student,
            Teacher teacher,
            Book book
    ) {
        if (!bookService.isAvailable(book)) {
            return false;
        }

        if ("STUDENT".equalsIgnoreCase(userType)) {
            return studentService.canBorrow(student);
        }

        if ("TEACHER".equalsIgnoreCase(userType)) {
            return teacherService.canBorrow(teacher);
        }

        return false;
    }

    public void setExpectedReturnDate(
            IssueRequest request,
            String userType,
            LocalDate issueDate
    ) {
        LocalDate dueDate;

        if ("STUDENT".equalsIgnoreCase(userType)) {
            dueDate = studentService.calculateDueDate(issueDate);
        } else if ("TEACHER".equalsIgnoreCase(userType)) {
            dueDate = teacherService.calculateDueDate(issueDate);
        } else {
            throw new IllegalArgumentException("Invalid user type.");
        }

        request.setExpectedReturnDate(dueDate.toString());
        save(request);
    }
}
