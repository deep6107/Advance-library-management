package com.library.management;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public-requests")
@CrossOrigin(origins = "*")
public class PublicRequestController {

    private final PublicRequestService publicRequestService;

    public PublicRequestController(
            PublicRequestService publicRequestService
    ) {
        this.publicRequestService = publicRequestService;
    }

    @PostMapping
    public PublicRequest create(
            @RequestBody PublicRequest request
    ) {
        return publicRequestService.createRequest(
                request.getName(),
                request.getContact(),
                request.getBookTitle(),
                request.getAuthor(),
                request.getDescription()
        );
    }

    @GetMapping
    public List<PublicRequest> getAll() {
        return publicRequestService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicRequest> getById(
            @PathVariable Long id
    ) {
        PublicRequest request = publicRequestService.findById(id);

        return request != null
                ? ResponseEntity.ok(request)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<PublicRequest> like(
            @PathVariable Long id
    ) {
        PublicRequest request = publicRequestService.findById(id);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        publicRequestService.likeRequest(request);

        return ResponseEntity.ok(request);
    }

    @PutMapping("/{id}/fulfill")
    public ResponseEntity<PublicRequest> fulfill(
            @PathVariable Long id
    ) {
        PublicRequest request = publicRequestService.findById(id);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        publicRequestService.fulfillRequest(request);

        return ResponseEntity.ok(request);
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<PublicRequest> close(
            @PathVariable Long id
    ) {
        PublicRequest request = publicRequestService.findById(id);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        publicRequestService.closeRequest(request);

        return ResponseEntity.ok(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        if (publicRequestService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        publicRequestService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
