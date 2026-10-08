package com.library.management;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PasswordInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final LibrarianRepository librarianRepository;

    public PasswordInitializer(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            LibrarianRepository librarianRepository) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.librarianRepository = librarianRepository;
    }

    @Override
    public void run(String... args) {

        studentRepository.findAll().forEach(student -> {
            if (student.getPassword() == null || student.getPassword().isBlank()) {
                student.setPassword("1234");
                studentRepository.save(student);
            }
        });

        teacherRepository.findAll().forEach(teacher -> {
            if (teacher.getPassword() == null || teacher.getPassword().isBlank()) {
                teacher.setPassword("1234");
                teacherRepository.save(teacher);
            }
        });

        librarianRepository.findAll().forEach(librarian -> {
            if (librarian.getPassword() == null || librarian.getPassword().isBlank()) {
                librarian.setPassword("1234");
                librarianRepository.save(librarian);
            }
        });

        System.out.println("Password initialization completed.");
    }
}
