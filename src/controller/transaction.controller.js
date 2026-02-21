const transactionModel = require("../model/transaction.model");
const ledgerModel = require("../model/ledger.model");
const accountModel = require("../model/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/*
 * Copyright (c) 2024. This code is licensed under the Pushpendra License.
 * the 10 step transfer flow:
 * 1. Validate request body
 * 2. Validate idempotency key
 * 3. check account status
 * 4. derive sender balance from ledger
 * 5. create transaction(Pending)
 * 6. create debit ledger entry
 * 7. create credit ledger entry
 * 8. update transaction(Completed)
 * 9. commit mongodb session
 * 10. send email notification.
 */

async function createTransaction(req, res) {
  // Step 1: Validate request body
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "From account, to account, amount and idempotency key are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });

  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({ message: "Invalid from or to account" });
  }

  // Step 2: Validate idempotency key
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is pending",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction failed previously, please try again",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed previously, please try again",
        transaction: isTransactionAlreadyExists,
      });
    }
  }

  // Step 3: check account status
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be active to perform transaction",
    });
  }

  // Step 4: derive sender balance from ledger
  if (balance < amount) {
    res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  // Step 5: Create transaction(Pending) (either 4 steps will be completed together otherwise all steps will be failed one can not be successful)
  const session = await mongoose.startSession();

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  await session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });

  //Step 10: Send email notification.
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );
}

module.exports = { createTransaction };
