const transactionModel = require('../models/transaction.model')

const getSummary = async (req, res) => {
    try{
        const summary = await transactionModel.aggregate([
            {$match: {isDeleted: false}},
            {$group:{
                _id: '$type',
                total: {$sum: '$amount'},
                count: {$sum: 1}
            }}
        ])

        let totalIncome = 0
        let totalExpense = 0
        summary.forEach(s => {
            if(s._id === 'income') totalIncome = s.total
            if(s._id === 'expense') totalExpense = s.total
        })

        res.json({
            success: true,
            data:{
                totalIncome,
                totalExpense,
                netBalance: totalIncome - totalExpense
            }
        })
    }catch(err){
        res.status(500).json({success: false, message: 'Error fetching summary', error: err.message})
    }
}

const getCategoryWise = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { isDeleted: false } },
      { $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ])
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching category-wise summary', error: err.message })
  }
}

const getMonthlyTrends = async (req, res) => {
    try{
        const data = await Transaction.aggregate([
      { $match: { isDeleted: false } },
      { $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    res.json({ success: true, data })
    }catch(err){
        res.status(500).json({success: false, message: 'Error fetching monthly trends', error: err.message})
    }
}

const getRecentActivity = async (req, res) => {
  try {
    const data = await Transaction.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name')
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false,message: 'Error fetching recent activity', error: err.message })
  }
}


module.exports = {
    getSummary,
    getCategoryWise,
    getMonthlyTrends,
    getRecentActivity
}