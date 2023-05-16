const router = require('express').Router();
let Task = require('../models/Task');
const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
var upload = multer({ storage: storage });

router.get('/tasks', (req, res) => {
    Task.find()
      .then(tasks => res.json(tasks))
      .catch(err => res.status(500).json({ error: err }));
  });
  
  router.post('/add', (req, res) => {
    const { title, date, description, status, type, collaborators } = req.body;
    const newTask = new Task({ title, date, description, status, type, collaborators });
    newTask.save()
      .then(task => res.json(task))
      .catch(err => res.status(500).json({ error: err }));
  });
  
  router.get('/tasks/:id', (req, res) => {
    Task.findById(req.params.id)
      .then(task => res.json(task))
      .catch(err => res.status(500).json({ error: err }));
  });
  
  router.put('/tasks/:id', (req, res) => {
    Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(task => res.json(task))
      .catch(err => res.status(500).json({ error: err }));
  });
  
  router.delete('/delete/:id', (req, res) => {
    Task.findByIdAndDelete(req.params.id)
      .then(() => res.json({ success: true }))
      .catch(err => res.status(500).json({ error: err }));
  });

  router.get('/find/:collaboratorId', async (req, res) => {
    try {

    
      const collaboratorId = req.params.collaboratorId;
      const tasks = await Task.find({ collaborators: collaboratorId });

      if (!tasks) {
        return res.status(401).json({ message: 'No task for you yet' });
      }else
      return res.status(200).json({ tasks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/findArchive/:collaboratorId', async (req, res) => {
    try {

    
      const collaboratorId = req.params.collaboratorId;
      const tasks = await Task.find({ collaborators: collaboratorId, isArchived: true });

      if (!tasks) {
        return res.status(401).json({ message: 'No task archived for you yet' });
      }else
      return res.status(200).json({ tasks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/update/:taskId', async (req, res) => {
    try {

      const taskId = req.params.taskId;
      const task = await Task.findById(taskId);

      if(task.status =="To do"){
        const updatedTask = await Task.findByIdAndUpdate(taskId, { status: 'In Progress' }, { new: true });
        res.json(updatedTask);
      }

      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


  router.post('/archive/:taskId', async (req, res) => {
    try {

      const taskId = req.params.taskId;
      const task = await Task.findById(taskId);

      if(task.status =="Done"){
        const archievedTask = await Task.findByIdAndUpdate(taskId, { isArchived:true }, { new: true });
        res.json(archievedTask);
      }

      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // Download attachment
router.get('/downloadAttachment/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);

    if (!task || !task.attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = task.attachment;
    const { data, contentType, originalName } = attachment;

    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `attachment; filename=${originalName}`);

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload and update task with attachment
router.post('/fix/:taskId', upload.single('file'), async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file selected' });
    }

    const fileData = await fs.promises.readFile(file.path);

    const attachmentFile = {
      data: fileData,
      contentType: file.mimetype,
      originalName: file.originalname,
      path: file.path
    };

    if (task.status === 'In Progress') {
      const updatedTask = await Task.findByIdAndUpdate(taskId, { attachment :attachmentFile, status: 'Done' }, { new: true });
      res.json(updatedTask);
    } else {
      res.status(400).json({ error: 'Invalid task status' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


  module.exports = router;