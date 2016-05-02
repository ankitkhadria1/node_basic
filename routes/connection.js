var mysql = require('mysql');
var client = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '' ,
  database: 'clikat'
});
module.exports=client;

