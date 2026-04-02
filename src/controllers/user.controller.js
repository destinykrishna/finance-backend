const userModel = require("../models/user.model");

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password")
    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['admin', 'analyst', 'viewer'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role' })

    const user = await userModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}


const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body
    const user = await userModel.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}



module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus
}