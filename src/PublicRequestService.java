package com.library.management;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PublicRequestService {

    private final PublicRequestRepository publicRequestRepository;

    public PublicRequestService(PublicRequestRepository publicRequestRepository) {
        this.publicRequestRepository = publicRequestRepository;
    }

    public PublicRequest save(PublicRequest request) {
        return publicRequestRepository.save(request);
    }

    public List<PublicRequest> findAll() {
        return publicRequestRepository.findAll();
    }

    public PublicRequest findById(Long id) {
        return publicRequestRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        publicRequestRepository.deleteById(id);
    }

    public PublicRequest createRequest(
            String name,
            String contact,
            String bookTitle,
            String author,
            String description
    ) {
        PublicRequest request = new PublicRequest();

        request.setName(name);
        request.setContact(contact);
        request.setBookTitle(bookTitle);
        request.setAuthor(author);
        request.setDescription(description);
        request.setRequestDate(LocalDate.now().toString());

        return save(request);
    }

    public void likeRequest(PublicRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Public request cannot be null."
            );
        }

        request.setLikes(request.getLikes() + 1);
        save(request);
    }

    public void fulfillRequest(PublicRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Public request cannot be null."
            );
        }

        request.setStatus(PublicRequest.Status.FULFILLED);
        save(request);
    }

    public void closeRequest(PublicRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Public request cannot be null."
            );
        }

        request.setStatus(PublicRequest.Status.CLOSED);
        save(request);
    }
}
