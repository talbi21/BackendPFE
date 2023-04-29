const mongoose = require('mongoose');

const statusOptions = ['In Progress', 'To do', 'Done'];
const typeOptions = ['Feature', 'Issue'];

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: statusOptions, required: true },
  type: { type: String, enum: typeOptions, required: true },
  collaborators: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true }
}, { timestamps: true });
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;