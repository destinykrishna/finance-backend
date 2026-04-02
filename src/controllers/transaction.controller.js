const transactionModel = require("../models/transaction.model");



const getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = { isDeleted: false };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const transactions = await transactionModel.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await transactionModel.countDocuments(filter);
    res.status(200).json({ success: true, total, page: Number(page), data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    if (!amount || !type || !category) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Amount, type and category are required",
        });
    }
    const transaction = await transactionModel.create({
      amount,
      type,
      category,
      date,
      notes,
      createdBy: req.user._id,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: transaction })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}


const deleteTransaction = async (req, res) => {
  try {
    const transaction = await transactionModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    )
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, message: 'Transaction deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}


module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
