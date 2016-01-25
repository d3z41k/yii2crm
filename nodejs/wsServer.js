var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var requestify = require('requestify');
var userIdList = {};
var userInfo = {};

io.use(function(socket, next){ //произвольная функция, которая запускается когда создаётся сокет
    var handshakeData = socket.request; //получаем иформация о запросе
    requestify.get('http://vm12721.hv8.ru/frontend/web/site/guarr', {
            dataType: 'json',
                headers: {
                    'Cookie': handshakeData.headers["cookie"], 
                    'User-Agent': handshakeData.headers["user-agent"], 
                    'X-Requested-With': 'XMLHttpRequest',
                }
            }
    ).then(function(response){
        var jsonObj = response.getBody(); //получили нужную информацию из Yii2 
        userInfo[jsonObj.username] = jsonObj;
        //на основе полученной информации, группируем пользователей по комнатам
        if(jsonObj.dept == 'Dept 1'){
            socket.join('room1');
            userInfo[jsonObj.username].room = 'room1';
        } else if(jsonObj.dept == 'Dept 2'){
            socket.join('room2');
            userInfo[jsonObj.username].room = 'room2';
        } else if(jsonObj.dept == 'Dept A'){
            socket.join('roomA');
            userInfo[jsonObj.username].room = 'roomA';
        };     
    });    
    next();
});


io.on('connection', function(socket){

    socket.on('connectUser', function(data){
        //при авторизации добавляем пользователя
        socket.userId = data; // в user_id передаём идентификатор пользователя
        console.log(userIdList);            
        if(socket.userId in userIdList){
            console.log('user alredy created');
        } else {
            userIdList[socket.userId] = data;
            console.log('add user');
        } 
    });

    socket.on('disconnectUser', function(data) {
        //при выходе пользоватея удаляем его id 
        delete userIdList[data];
        console.log('disconnect user: ' + data);
        });

    socket.on('message', function(msg){
        //получение комнаты отправителя и отправка оповещения пользоватемя комнаты отправителя и администраторам
        //"костыль" - скорее всего надо определить отправителя через socket...
        if(msg != ''){
            var currUser = ((msg.split('@')[0]).trim());    
            //io.in(userInfo[currUser].room).in('roomA').emit('message', msg);
            //почему-то broadcast не работает в Chrome, то есть отправитель получает своё сообщение тоже, в Firefox данной проблемы не наблюдается 
            socket.to(userInfo[currUser].room).broadcast.emit('message', msg , socket.id);        
            socket.to('roomA').emit('message', msg); 
        } 
    });
});
 

http.listen(9090, function(){
    console.log('listening on *:9090');
});