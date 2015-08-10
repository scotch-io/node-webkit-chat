'use strict';

var app = angular.module('scotch-chat', ['ngMaterial', 'ngAnimate', 'ngMdIcons', 'btford.socket-io'])
var serverBaseUrl = 'http://localhost:2015';
app.factory('socket', function (socketFactory) {
    var myIoSocket = io.connect(serverBaseUrl);

    var socket = socketFactory({
        ioSocket: myIoSocket
    });

    return socket;
});
app.controller('MainCtrl', function ($scope, $mdDialog, socket, $http) {
    $scope.messages = [];
    $scope.room = "";




    socket.on('user joined', function (data) {
        //$scope.room = data.room;
        console.log(data.username + ' has joined');
    });
    socket.on('setup', function (data) {
        var rooms = data.rooms;;
        console.log(rooms);
        $scope.rooms = rooms;
        //        for (var r = 0; r < rooms.length; r++) {
        //            handleRoomSubMenu(r);
        //        }
        //
        //        function handleRoomSubMenu(r) {
        //            var clickedRoom = rooms[r];
        //            roomsMenu.append(new GUI.MenuItem({
        //                label: clickedRoom.toUpperCase(),
        //                click: function () {
        //                    $scope.room = clickedRoom.toUpperCase();
        //                    socket.emit('switch room', {
        //                        newRoom: clickedRoom,
        //                        username: $scope.username
        //                    });
        //                    $http.get(serverBaseUrl + '/msg?room=' + clickedRoom).success(function (msgs) {
        //                        $scope.messages = msgs;
        //                    });
        //                }
        //            }));
        //        }

        //GUI.Window.get().menu = windowMenu;
    });
    $scope.changeRoom = function (clickedRoom) {
        $scope.room = clickedRoom.toUpperCase();
        socket.emit('switch room', {
            newRoom: clickedRoom,
            username: $scope.username
        });
        $http.get(serverBaseUrl + '/msg?room=' + clickedRoom).success(function (msgs) {
            $scope.messages = msgs;
        });
    };
    //Launch Modal
    $scope.usernameModal = function (ev) {
        $mdDialog.show({
                controller: UsernameDialogController,
                templateUrl: 'partials/username.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            })
            .then(function (answer) {
                $scope.username = answer;
                $scope.alert = 'Username: "' + answer + '".';
                socket.emit('new user', {
                    username: answer
                });
                $scope.room = 'GENERAL';
                $http.get(serverBaseUrl + '/msg?room=' + $scope.room).success(function (msgs) {
                    $scope.messages = msgs;
                });
            }, function () {

            });
    };
    socket.on('message created', function (data) {
        $scope.messages.push(data);
    });
    $scope.send = function (msg) {
        socket.emit('new message', {
            room: $scope.room,
            message: msg,
            username: $scope.username
        });

    };
});
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

function UsernameDialogController($scope, $mdDialog) {
    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.answer = function (answer) {
        $mdDialog.hide(answer);
    };
}