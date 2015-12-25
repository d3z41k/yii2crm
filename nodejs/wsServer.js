var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var requestify = require('requestify');

io.use(function (socket, next) { //произвольная функция, которая запускается когда создаётся сокет
    var handshakeData = socket.request; //получаем иформация о запросе
    requestify.get('http://vm12721.hv8.ru/frontend/web/site/guarr', {
            dataType: 'json',
                headers: {
                    'Cookie': handshakeData.headers["cookie"], 
                    'User-Agent': handshakeData.headers["user-agent"], 
                    'X-Requested-With': 'XMLHttpRequest',
                }
            }
    ).then(function (response) {
        var jsonObj = response.getBody(); //получили нужную информацию из Yii2 
        handshakeData.user = jsonObj;
        //выполняется 3
    });
    //выполняется 1
    next();
});


 io.on('connection', function(socket){
      socket.on('message', function(msg){
         //выполняется 2
          console.log('message: ' + msg);
          //io.emit('message', msg);
          //console.log(socket.request.user); // => undefined

      });
  });


http.listen(9090, function(){
    //выполняется 0
    console.log('listening on *:9090');
});