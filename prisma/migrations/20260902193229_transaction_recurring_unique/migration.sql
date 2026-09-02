-- CreateIndex
CREATE UNIQUE INDEX "transactions_recurringTransactionId_date_key" ON "transactions"("recurringTransactionId", "date");

