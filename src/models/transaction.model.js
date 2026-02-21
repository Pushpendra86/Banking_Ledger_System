const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with a From Account"],
    index: true,
  },
  toAccount: {
    type: mongoose.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with a From Account"],
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      message: "status can be either PENDING, COMPLETED, FAILED, REVERSED",
    },
    default: "PENDING"
  },
  amount:{
    type:Number,
    required:[true, "ammount is required for creating transaction"],
    min:[0, "transaction amount cannot be negative"];
  },
  idempotencyKey:{
    type:String,
    required:[true, "IdempotencyKey is required for creating a transaction"],
    index: true,
    unique:true,
  }
}, {timestamps:true});

const transactionModel = mongoose.model("transaction", transactionSchema);
module.exports = transactionModel;
