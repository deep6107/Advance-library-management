package com.library.management;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TeacherService {

    private static final int MAX_BOOKS = 5;
    private static final int RETURN_MONTHS = 3;

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    public Teacher save(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public List<Teacher> findAll() {
        return teacherRepository.findAll();
    }

    public Teacher findById(String id) {
        return teacherRepository.findById(id).orElse(null);
    }

    public void delete(String id) {
        teacherRepository.deleteById(id);
    }

    public boolean canBorrow(Teacher teacher) {
        return teacher != null
                && teacher.getCurrentBooks() < MAX_BOOKS;
    }

    public LocalDate calculateDueDate(LocalDate issueDate) {
        return issueDate.plusMonths(RETURN_MONTHS);
    }

    public void issueBook(Teacher teacher) {
        if (!canBorrow(teacher)) {
            throw new IllegalStateException(
                    "Teacher has reached the maximum book limit."
            );
        }

        teacher.setCurrentBooks(teacher.getCurrentBooks() + 1);
        save(teacher);
    }

    public void returnBook(Teacher teacher) {
        if (teacher.getCurrentBooks() > 0) {
            teacher.setCurrentBooks(teacher.getCurrentBooks() - 1);
            save(teacher);
        }
    }

    public double calculateDamagePayment(Book book) {
        if (book == null) {
            throw new IllegalArgumentException("Book cannot be null.");
        }

        return book.getPrice();
    }

    public int getMaximumBooks() {
        return MAX_BOOKS;
    }

    public int getReturnMonths() {
        return RETURN_MONTHS;
    }
}
