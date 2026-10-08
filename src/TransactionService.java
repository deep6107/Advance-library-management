package com.library.management;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction save(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    public Transaction findById(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        transactionRepository.deleteById(id);
    }

    public Transaction createTransaction(
            String personType,
            String personId,
            double amount,
            Transaction.Type type,
            Transaction.PaymentMethod paymentMethod,
            String description
    ) {
        if (amount < 0) {
            throw new IllegalArgumentException(
                    "Transaction amount cannot be negative."
            );
        }

        Transaction transaction = new Transaction();

        transaction.setPersonType(personType);
        transaction.setPersonId(personId);
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setPaymentMethod(paymentMethod);
        transaction.setTransactionDate(LocalDate.now().toString());
        transaction.setDescription(description);

        return save(transaction);
    }

    public void markAsPaid(
            Transaction transaction,
            String receiptNumber
    ) {
        if (transaction == null) {
            throw new IllegalArgumentException(
                    "Transaction cannot be null."
            );
        }

        transaction.setStatus(Transaction.Status.PAID);
        transaction.setReceiptNumber(receiptNumber);

        save(transaction);
    }

    public void cancel(Transaction transaction) {
        if (transaction == null) {
            throw new IllegalArgumentException(
                    "Transaction cannot be null."
            );
        }

        transaction.setStatus(Transaction.Status.CANCELLED);

        save(transaction);
    }
}
