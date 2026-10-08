package com.library.management;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookTransactionService {

    private final BookTransactionRepository bookTransactionRepository;
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final BookService bookService;
    private final TransactionService transactionService;

    public BookTransactionService(
            BookTransactionRepository bookTransactionRepository,
            StudentService studentService,
            TeacherService teacherService,
            BookService bookService,
            TransactionService transactionService
    ) {
        this.bookTransactionRepository = bookTransactionRepository;
        this.studentService = studentService;
        this.teacherService = teacherService;
        this.bookService = bookService;
        this.transactionService = transactionService;
    }

    public BookTransaction save(BookTransaction transaction) {
        return bookTransactionRepository.save(transaction);
    }

    public List<BookTransaction> findAll() {
        return bookTransactionRepository.findAll();
    }

    public BookTransaction findById(Long id) {
        return bookTransactionRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        bookTransactionRepository.deleteById(id);
    }

    public BookTransaction createIssueTransaction(
            String userType,
            String userId,
            Book book
    ) {
        if (!bookService.isAvailable(book)) {
            throw new IllegalStateException("Book is not available.");
        }

        BookTransaction transaction = new BookTransaction();

        transaction.setUserType(userType);
        transaction.setUserId(userId);
        transaction.setBookId(book.getId());
        transaction.setIssueDate(LocalDate.now().toString());
        transaction.setType(BookTransaction.Type.ISSUE);

        if ("STUDENT".equalsIgnoreCase(userType)) {
            transaction.setDueDate(
                    studentService.calculateDueDate(
                            LocalDate.now()
                    ).toString()
            );
        } else if ("TEACHER".equalsIgnoreCase(userType)) {
            transaction.setDueDate(
                    teacherService.calculateDueDate(
                            LocalDate.now()
                    ).toString()
            );
        }

        bookService.issueCopy(book);

        return save(transaction);
    }

    public Transaction processStudentReturn(
            Student student,
            BookTransaction transaction,
            Book book,
            boolean damaged
    ) {
        studentService.returnBook(student);

        transaction.setReturnDate(LocalDate.now().toString());
        transaction.setType(
                damaged
                        ? BookTransaction.Type.DAMAGED
                        : BookTransaction.Type.RETURN
        );
        transaction.setDamaged(damaged);

        Transaction payment = null;

        if (damaged) {
            studentService.applyDamagePenalty(student);

            double amount = book.getPrice();

            transaction.setFine(amount);
            transaction.setNotes(
                    "Student keeps damaged book and must pay full book price."
            );

            payment = transactionService.createTransaction(
                    "STUDENT",
                    student.getId(),
                    amount,
                    Transaction.Type.DAMAGE_PAYMENT,
                    Transaction.PaymentMethod.CASH,
                    "Full payment for damaged book ID " + book.getId()
            );

        } else {
            bookService.returnCopy(book);
        }

        save(transaction);

        return payment;
    }

    public Transaction processTeacherReturn(
            Teacher teacher,
            BookTransaction transaction,
            Book book,
            boolean damaged
    ) {
        teacherService.returnBook(teacher);

        transaction.setReturnDate(LocalDate.now().toString());
        transaction.setType(
                damaged
                        ? BookTransaction.Type.DAMAGED
                        : BookTransaction.Type.RETURN
        );
        transaction.setDamaged(damaged);

        Transaction payment = null;

        if (damaged) {

            double amount = teacherService.calculateDamagePayment(book);

            transaction.setFine(amount);
            transaction.setNotes(
                    "Teacher keeps damaged book and must pay full book price."
            );

            payment = transactionService.createTransaction(
                    "TEACHER",
                    teacher.getId(),
                    amount,
                    Transaction.Type.DAMAGE_PAYMENT,
                    Transaction.PaymentMethod.CASH,
                    "Full payment for damaged book ID " + book.getId()
            );

        } else {
            bookService.returnCopy(book);
        }

        save(transaction);

        return payment;
    }
}
