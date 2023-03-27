const express = require('express');
const app = express();
const mongoose = require('mongoose');
const router = express.Router(); // utilisez express.Router() pour créer un routeur
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

const UserRouter = require('./routes/User');
router.use('/User', UserRouter); // utilisez router.use() pour définir les routes

app.use('', router); // utilisez app.use() pour monter le routeur sur l'application

app.listen(dbConfigPORT, () => {
  console.log("App is running on port  " + dbConfigPORT);
});