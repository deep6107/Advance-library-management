package com.library.management;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRequestRepository extends JpaRepository<IssueRequest, Long> {
}
