var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var requestify = require('requestify');
var userIdList = {};
var userInfo = {};

io.use(function(socket, next){ //произвольная функция, которая запускается когда создаётся сокет
    var handshakeData = socket.request; //получаем иформация о запросе
    // console.log(handshakeData.headers["cookie"]);
    // console.log('===============================================');
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

        // console.log(userIdList);
        // console.log(userInfo);

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
        //при авторизации добавляем id пользователя и соответственный этому id массив socket.id  
        console.log(userInfo);          
        if(data in userIdList){
            userIdList[data].push(socket.id);
            console.log('user alredy created, add socket id');
            console.log(userIdList); 
        } else {
            userIdList[data] = [socket.id]; 
            console.log('add new user and add first socket id');
            console.log(userIdList);          
        } 
    });

    socket.on('disconnectUser', function(data) {
        //при выходе пользоватея удаляем его id и соответственный массив socket.id
        delete userIdList[data];
        console.log('disconnect user: ' + data);
        });

    socket.on('message', function(msg){
        //получение комнаты отправителя и отправка оповещения пользоватемя комнаты отправителя и администраторам
        //"костыль" - скорее всего надо определить отправителя через socket...
        if(msg != ''){
            console.log('msg socket '+socket.id);
            var currUser = ((msg.split('@')[0]).trim());    
            socket.to(userInfo[currUser].room).broadcast.emit('message', msg);
            socket.to('roomA').emit('message', msg); 
        } 
    });

});
 

http.listen(9090, function(){
    console.log('listening on *:9090');
});