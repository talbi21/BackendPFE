const mongoose = require('mongoose');

const statusOptions = [ 'To do','In Progress', 'Done'];
const typeOptions = ['Feature', 'Issue'];

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: statusOptions, required: true,default:statusOptions[0] },
  type: { type: String, enum: typeOptions, required: true },
  collaborators: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], required: true },
  attachment: {
    data: Buffer,
    contentType: String,
    originalName : String,
    path : String
  },
  isArchived: { type: Boolean, default: false } 
}, { timestamps: true });
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;