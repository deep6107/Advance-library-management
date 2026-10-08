package com.library.management;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService
    ) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public Transaction create(
            @RequestBody Transaction transaction
    ) {
        return transactionService.save(transaction);
    }

    @GetMapping
    public List<Transaction> getAll() {
        return transactionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getById(
            @PathVariable Long id
    ) {
        Transaction transaction = transactionService.findById(id);

        return transaction != null
                ? ResponseEntity.ok(transaction)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Transaction> markAsPaid(
            @PathVariable Long id,
            @RequestParam String receiptNumber
    ) {
        Transaction transaction = transactionService.findById(id);

        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }

        transactionService.markAsPaid(
                transaction,
                receiptNumber
        );

        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Transaction> cancel(
            @PathVariable Long id
    ) {
        Transaction transaction = transactionService.findById(id);

        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }

        transactionService.cancel(transaction);

        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        if (transactionService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        transactionService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
