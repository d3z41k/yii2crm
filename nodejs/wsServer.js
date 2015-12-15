var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var requestify = require('requestify');

io.use(function(socket, next) {
    var handshakeData = socket.request;
    /*Получаем из controller/actiom Yii2 JSON данные*/
    requestify.get('http://vm12721.hv8.ru/frontend/web/site/guarr', {
        dataType: 'json',
        headers: {
            'Cookie': handshakeData.headers["cookie"],
            'User-Agent': handshakeData.headers["user-agent"],
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(function(response) {
        /*Обработка полученных JSON данных
        !!!Данный код не срабатывает 
            -> какие-то проблемы с получением JSON данных 
        */
        var user = JSON.parse(response.getBody());
        handshakeData.user = user;
        callback(null, true);
    }, function(err){
        /*Срабатывает ошибка*/
        callback(null, false);
    }); 
    
    next();

});
 
io.on('connection', function(socket){

    console.log(socket.client.request.user); //undefined
    console.log(socket.handshake.user); //undefined

// socket.on('message', function(msg){
//    console.log('message: ' + msg);
//    });
});

http.listen(9090, function(){
console.log('listening on *:9090');
});

io.on('connection', function(socket){
  socket.on('message', function(msg){
    io.emit('message', msg);
  });
});
