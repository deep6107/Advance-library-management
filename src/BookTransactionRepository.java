package com.library.management;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookTransactionRepository extends JpaRepository<BookTransaction, Long> {
}
