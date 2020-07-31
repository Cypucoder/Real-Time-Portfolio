var app = angular.module('myApp', ['angularUtils.directives.dirPagination']);


app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

app.filter('characters', function () {
        return function (input, chars, breakOnWord) {
            if (isNaN(chars)) return input;
            if (chars <= 0) return '';
            if (input && input.length > chars) {
                input = input.substring(0, chars);

                if (!breakOnWord) {
                    var lastspace = input.lastIndexOf(' ');
                    //get last space
                    if (lastspace !== -1) {
                        input = input.substr(0, lastspace);
                    }
                }else{
                    while(input.charAt(input.length-1) === ' '){
                        input = input.substr(0, input.length -1);
                    }
                }
                return input + '…';
            }
            return input;
        };
    });

app.filter('splitcharacters', function() {
    return function (input, chars) {
        if (isNaN(chars)) return input;
        if (chars <= 0) return '';
        if (input && input.length > chars) {
            var prefix = input.substring(0, chars/2);
            var postfix = input.substring(input.length-chars/2, input.length);
            return prefix + '...' + postfix;
        }
        return input;
    };
});

app.filter('words', function () {
    return function (input, words) {
        if (isNaN(words)) return input;
        if (words <= 0) return '';
        if (input) {
            var inputWords = input.split(/\s+/);
            if (inputWords.length > words) {
                input = inputWords.slice(0, words).join(' ') + '…';
            }
        }
        return input;
    };
});

app.filter('PlainRes', function() {
    return function(text) {
      return  text ? String(text).replace(/<[^>]+>/gm, ' ') : '';
    };
  }
);
    
app.filter('slice', function() {
  return function(arr, start, end) {
    return (arr || []).slice(start, end);
  };
});
    app.filter('noWait', function() {
  return function(input, status) {
    var out = [];
      for (var i = 0; i < input.length; i++){
          if(input[i].wait == status)
              out.push(input[i]);
      }      
    return out;
  };
});

app.controller('data_Default', function($scope, $http, socket){   
/*$http.get('/Data', {cache: true}).success(function(data){$scope.data=data;});*/
});

app.controller('data_compute', function($scope){   
    $scope.array_List;
    
     $scope.add = function() {
        $scope.array_List.push($scope.input);
        $scope.input = '';
    };
    
    $scope.remove = function(index) {
    	$scope.items.splice(index, 1);
    };
});

