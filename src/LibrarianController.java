package com.library.management;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/librarians")
@CrossOrigin(origins = "*")
public class LibrarianController {

    private final LibrarianService librarianService;
    private final IssueRequestService issueRequestService;

    public LibrarianController(
            LibrarianService librarianService,
            IssueRequestService issueRequestService
    ) {
        this.librarianService = librarianService;
        this.issueRequestService = issueRequestService;
    }

    @PostMapping
    public Librarian create(@RequestBody Librarian librarian) {
        return librarianService.save(librarian);
    }

    @GetMapping
    public List<Librarian> getAll() {
        return librarianService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Librarian> getById(@PathVariable Long id) {
        Librarian librarian = librarianService.findById(id);

        return librarian != null
                ? ResponseEntity.ok(librarian)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Librarian> update(
            @PathVariable Long id,
            @RequestBody Librarian updated
    ) {
        Librarian librarian = librarianService.findById(id);

        if (librarian == null) {
            return ResponseEntity.notFound().build();
        }

        librarian.setName(updated.getName());
        librarian.setEmail(updated.getEmail());
        librarian.setPhone(updated.getPhone());
        librarian.setRole(updated.getRole());
        librarian.setActive(updated.isActive());

        if (updated.getPassword() != null &&
            !updated.getPassword().isBlank()) {
            librarian.setPassword(updated.getPassword());
        }

        return ResponseEntity.ok(librarianService.save(librarian));
    }

    @PutMapping("/{librarianId}/requests/{requestId}/approve")
    public ResponseEntity<IssueRequest> approveRequest(
            @PathVariable Long librarianId,
            @PathVariable Long requestId
    ) {
        if (librarianService.findById(librarianId) == null) {
            return ResponseEntity.notFound().build();
        }

        IssueRequest request = issueRequestService.findById(requestId);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        librarianService.approveRequest(request, librarianId);

        return ResponseEntity.ok(request);
    }

    @PutMapping("/{librarianId}/requests/{requestId}/reject")
    public ResponseEntity<IssueRequest> rejectRequest(
            @PathVariable Long librarianId,
            @PathVariable Long requestId
    ) {
        if (librarianService.findById(librarianId) == null) {
            return ResponseEntity.notFound().build();
        }

        IssueRequest request = issueRequestService.findById(requestId);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        librarianService.rejectRequest(request, librarianId);

        return ResponseEntity.ok(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (librarianService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        librarianService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
