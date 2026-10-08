package com.library.management;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class StudentService {

    private static final int MAX_BOOKS = 1;
    private static final int RETURN_DAYS = 14;
    private static final int DAMAGE_BAN_MONTHS = 3;

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student save(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Student findById(String id) {
        return studentRepository.findById(id).orElse(null);
    }

    public void delete(String id) {
        studentRepository.deleteById(id);
    }

    public boolean canBorrow(Student student) {
        return student != null
                && !student.isBanned()
                && student.getCurrentBooks() < MAX_BOOKS;
    }

    public LocalDate calculateDueDate(LocalDate issueDate) {
        return issueDate.plusDays(RETURN_DAYS);
    }

    public void issueBook(Student student) {
        if (!canBorrow(student)) {
            throw new IllegalStateException("Student cannot borrow another book.");
        }

        student.setCurrentBooks(student.getCurrentBooks() + 1);
        save(student);
    }

    public void returnBook(Student student) {
        if (student.getCurrentBooks() > 0) {
            student.setCurrentBooks(student.getCurrentBooks() - 1);
            save(student);
        }
    }

    public void applyDamagePenalty(Student student) {
        student.setBanned(true);
        student.setBanUntil(
                LocalDate.now().plusMonths(DAMAGE_BAN_MONTHS)
        );
        save(student);
    }

    public int getMaximumBooks() {
        return MAX_BOOKS;
    }

    public int getReturnDays() {
        return RETURN_DAYS;
    }
}
