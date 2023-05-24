const express = require('express');
const app = express();
const mongoose = require('mongoose');
const router = express.Router(); 
const clientPassport = require ("passport");
const config =  require('config');
const dbConfig = config.get('db.dbConfig.dbName');
const dbConfigPORT = config.get('db.dbConfig.port');
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

mongoose.connect(dbConfig, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to Database')
}).catch(err => {
  console.log('Connected to Database' + err)
});

app.use(clientPassport.initialize());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const UserRouter = require('./routes/user');
const TaskRouter = require('./routes/task');
router.use('/Task', TaskRouter);
router.use('/User', UserRouter); 

app.use('', router); 

app.listen(dbConfigPORT, () => {
  console.log("App is running on port  " + dbConfigPORT);
});