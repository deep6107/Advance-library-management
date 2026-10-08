package com.library.management;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public Student create(@RequestBody Student student) {
        if (student.getPassword() == null || student.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        // New account starts with an incomplete profile.
        student.setProfileCompleted(false);

        return studentService.save(student);
    }

    @GetMapping
    public List<Student> getAll() {
        return studentService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getById(@PathVariable String id) {
        Student student = studentService.findById(id);

        return student != null
                ? ResponseEntity.ok(student)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> update(
            @PathVariable String id,
            @RequestBody Student updated
    ) {
        Student student = studentService.findById(id);

        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        if (updated.getName() != null) {
            student.setName(updated.getName());
        }

        if (updated.getEmail() != null) {
            student.setEmail(updated.getEmail());
        }

        if (updated.getPhone() != null) {
            student.setPhone(updated.getPhone());
        }

        if (updated.getDepartment() != null) {
            student.setDepartment(updated.getDepartment());
        }

        // year is an int, so don't compare it with null.
        student.setYear(updated.getYear());

        if (updated.getPassword() != null &&
            !updated.getPassword().isBlank()) {
            student.setPassword(updated.getPassword());
        }

        // Profile is complete after the student submits their profile.
        student.setProfileCompleted(true);

        return ResponseEntity.ok(studentService.save(student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (studentService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
