var express = require('express');
var router = express.Router();
var fetch = require('fetch');
router.get('/fetch-data',fetch.fetchData);
module.exports = router;