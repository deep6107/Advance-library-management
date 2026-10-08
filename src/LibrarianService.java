package com.library.management;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LibrarianService {

    private static final int REQUEST_PROCESSING_HOURS = 24;

    private final LibrarianRepository librarianRepository;
    private final IssueRequestRepository issueRequestRepository;

    public LibrarianService(
            LibrarianRepository librarianRepository,
            IssueRequestRepository issueRequestRepository
    ) {
        this.librarianRepository = librarianRepository;
        this.issueRequestRepository = issueRequestRepository;
    }

    public Librarian save(Librarian librarian) {
        return librarianRepository.save(librarian);
    }

    public List<Librarian> findAll() {
        return librarianRepository.findAll();
    }

    public Librarian findById(Long id) {
        return librarianRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        librarianRepository.deleteById(id);
    }

    public boolean canProcessRequest(IssueRequest request) {
        return request != null
                && request.getStatus() == IssueRequest.Status.PENDING
                && isWithinProcessingTime(request);
    }

    public boolean isWithinProcessingTime(IssueRequest request) {
        if (request == null || request.getRequestDate() == null) {
            return false;
        }

        try {
            LocalDateTime requestTime =
                    LocalDateTime.parse(request.getRequestDate());

            long hours = Duration.between(
                    requestTime,
                    LocalDateTime.now()
            ).toHours();

            return hours >= 0 && hours <= REQUEST_PROCESSING_HOURS;

        } catch (Exception e) {
            return false;
        }
    }

    public void approveRequest(
            IssueRequest request,
            Long librarianId
    ) {
        if (!canProcessRequest(request)) {
            throw new IllegalStateException(
                    "Request cannot be approved. " +
                    "It must be pending and within 24 hours."
            );
        }

        request.setStatus(IssueRequest.Status.APPROVED);
        request.setLibrarianId(librarianId);
        request.setApprovalDate(LocalDateTime.now().toString());

        issueRequestRepository.save(request);
    }

    public void rejectRequest(
            IssueRequest request,
            Long librarianId
    ) {
        if (!canProcessRequest(request)) {
            throw new IllegalStateException(
                    "Request cannot be rejected. " +
                    "It must be pending and within 24 hours."
            );
        }

        request.setStatus(IssueRequest.Status.REJECTED);
        request.setLibrarianId(librarianId);
        request.setApprovalDate(LocalDateTime.now().toString());

        issueRequestRepository.save(request);
    }

    public int getRequestProcessingHours() {
        return REQUEST_PROCESSING_HOURS;
    }
}
