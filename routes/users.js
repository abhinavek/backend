var express = require('express');
var router = express.Router();
const db = import("../db/connection.mjs");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', async (req, res) => {
  let collection = (await db).default.collection("users");
  let results = await collection.find({'email':req.body.email,'password':req.body.password}).toArray();
  res.send(results).status(200);
})


module.exports = router;
