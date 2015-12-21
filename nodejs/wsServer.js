var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var requestify = require('requestify');


    io.use(function (socket, next) { //произвольная функция, которая запускается когда создаётся сокет
        var handshakeData = socket.request; //получаем иформация о запросе
        //console.log(handshakeData); // в headers нет cookie!?
            requestify.get('http://vm12721.hv8.ru/frontend/web/site/guarr', {
                dataType: 'json',
                headers: {
                    'Cookie':handshakeData.headers['cookie'], // пусто => далее работает некорректно
                    //Если явно указать cookie, то работает корректно
                    //'Cookie':'_csrf=5946f6eff666e6f95752ef6ef3c1b9b1da527dd7067bd7961b12602612ec7f00a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22u32DQ7WQOBwIicB_4pOCxx4LPL0iFL3b%22%3B%7D; test=290d85cf46aef85cb0e2b6bff36b97e116347d0c13bc8e9a299ea64fcc93c92ea%3A2%3A%7Bi%3A0%3Bs%3A4%3A%22test%22%3Bi%3A1%3Bi%3A4%3B%7D; _identity=2a4f9829ea77e641d6165ab49b1a7bc61f88a8856722d043848eac33a33c911ea%3A2%3A%7Bi%3A0%3Bs%3A9%3A%22_identity%22%3Bi%3A1%3Bs%3A46%3A%22%5B4%2C%22319bbfkwgQuyGuqk32QK11Go0Dj85lPv%22%2C2592000%5D%22%3B%7D; PHPSESSID=8bdbrmv6oju4pvba1v4qqrinb2',
                    'User-Agent': handshakeData.headers['user-agent'], //пусто
                    'X-Requested-With': 'XMLHttpRequest',
                }
            }
        ).then(function (response) {
            console.log(response.getBody());
            //var user = JSON.parse(response.getBody());
            //socket.request.user = user;
            console.log('alive');
            //console.log(response);
            callback(null, true);
        }, function (err) {
            console.log('die');
            callback(null, false);
        });
        next();
    });


io.on('connection', function(socket){

    //console.log(socket.client.request.user); //undefined
    //console.log(socket.request); //undefined
    console.log(socket.request);
    socket.on('message', function(msg){
        console.log('message: ' + msg);
    });
});


http.listen(9090, function(){
    console.log('listening on *:9090');
});

//io.on('connection', function(socket){
//    socket.on('message', function(msg){
//        var user = socket.handshake.user;
//        io.emit('message', msg);
//    });
//});
