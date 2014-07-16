var _ = require('lodash');
var defaultPort = '8081';
module.exports = function ResaController($scope,$http,$sce) {
    $scope.tweets=[];
    $scope.tweets_number=0;
    // analysis start function
    $scope.startAnalysis = function (e) {
        // prevent event
        e.preventDefault();
        var keyword=$scope.keyword;
        $http({
            url: "/api/resa/start/"+keyword,
            method: "GET"
        }).success(function(response){
            $scope.response = response;
            initStreamWebsocket($scope);
        }).error(function(error){
            $scope.error = error;
        });
    }

    $scope.stopAnalysis = function (e) {
        // prevent event
        e.preventDefault();
        $http({
            url: "/api/resa/stop",
            method: "GET"
        }).success(function(response){
            $scope.response = response;
        }).error(function(error){
            $scope.error = error;
        });
    }
    var getEntityType=function(types){
        if(!types.length){
            return 'Misc';
        }
        var tmp,out='';
        _.forEach(types, function(v) {
            tmp=v.split(':');
            if(tmp[1]=='Place' || tmp[1]=='Person' || tmp[1]=='Organisation'){
                out= tmp[1];
            }
        })
        if(out){
            return out;
        }else{
            return 'Misc';
        }

    }
    var prepareTweetText=function(text,entities){
        _.forEach(entities, function(e) {
            text = text.replace(e.name, '&nbsp;<span resource="' + e.uri + '" class="r_entity r_' + getEntityType(e.types).toLowerCase() + '" typeOf="' + e.types + '">' + e.name + '</span>&nbsp;');
        });
        return text;
    }
    var initStreamWebsocket = function($scope) {
        var location = document.location.hostname + ':' + defaultPort + document.location.pathname;
        console.log('connecting to socket', location);
        var socket = new WebSocket('ws://' + location);
        socket.onerror = function(err) {
            console.log(err);
        };
        socket.onopen = function () {
            console.log('connection established!');
        };
        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            $scope.$apply(function() {
                //console.log(data);
                data.text=prepareTweetText(data.text,data.entities);
                $scope.tweets.unshift(data);
                $scope.tweets_number++;
            });
        };
        socket.onclose = function () {
            $scope.$apply(function() {

            });
        };
    };
};
