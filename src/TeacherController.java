package com.library.management;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping
    public Teacher create(@RequestBody Teacher teacher) {
        if (teacher.getPassword() == null || teacher.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        // Profile is incomplete until the teacher fills it.
        teacher.setProfileCompleted(false);

        return teacherService.save(teacher);
    }

    @GetMapping
    public List<Teacher> getAll() {
        return teacherService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getById(@PathVariable String id) {
        Teacher teacher = teacherService.findById(id);

        return teacher != null
                ? ResponseEntity.ok(teacher)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> update(
            @PathVariable String id,
            @RequestBody Teacher updated
    ) {
        Teacher teacher = teacherService.findById(id);

        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }

        if (updated.getName() != null) {
            teacher.setName(updated.getName());
        }

        if (updated.getEmail() != null) {
            teacher.setEmail(updated.getEmail());
        }

        if (updated.getPhone() != null) {
            teacher.setPhone(updated.getPhone());
        }

        if (updated.getDepartment() != null) {
            teacher.setDepartment(updated.getDepartment());
        }

        if (updated.getPassword() != null &&
            !updated.getPassword().isBlank()) {
            teacher.setPassword(updated.getPassword());
        }

        teacher.setProfileCompleted(true);

        return ResponseEntity.ok(teacherService.save(teacher));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (teacherService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
