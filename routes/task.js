const router = require('express').Router();
let Task = require('../models/Task');

router.get('/tasks', (req, res) => {
    Task.find()
      .then(tasks => res.json(tasks))
      .catch(err => res.status(500).json({ error: err }));
  });
  
  router.post('/add', (req, res) => {
    const { title, date, description, status, type } = req.body;
    const newTask = new Task({ title, date, description, status, type });
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
  
  router.delete('/tasks/:id', (req, res) => {
    Task.findByIdAndDelete(req.params.id)
      .then(() => res.json({ success: true }))
      .catch(err => res.status(500).json({ error: err }));
  });

  module.exports = router;