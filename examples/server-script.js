const express = require('express');
const app = express();
 
app.use(express.static('examples'));
app.use('/lib', express.static('lib'));
//设置路由
app.get('/', function (req, res) {
  res.send('Please go to the corresponding demo html!');
});
 
//设置端口
const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
 
  console.log('Example app listening at http://%s:%s', host, port);
});