//https://scotch.io/tutorials/single-page-apps-with-angularjs-routing-and-templating

var app = angular.module('myApp', ['ngRoute', 'ngMessages','ngCookies','textAngular','ngImgCrop','angularUtils.directives.dirPagination','720kb.socialshare','ngAnimate', 'luegg.directives']);
//http://stackoverflow.com/questions/15354329/how-to-get-the-route-name-when-location-changes
app.run(['$rootScope','$location', '$routeParams', function($rootScope, $location, $routeParams) {
    if (!window.console) window.console = {}; 
    if (!window.console.log) window.console.log = function () { };
    
    $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
      console.log('Current route name: ' + $location.path());
      // Get all URL parameter
      console.log($routeParams);
    });
  }]);

//http://stackoverflow.com/questions/16301554/is-it-possible-to-share-data-between-two-angularjs-apps


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

app.factory('vidPlay', function () {
    const next = document.querySelector('.fa-forward');
    const back = document.querySelector('.fa-step-backward');
    const btnBackward = document.querySelector('.btn-backward');
    const btnExpand = document.querySelector('.btn-expand');
    const spanFullIcon = btnExpand.querySelector('.fa');
    const btnMute = document.querySelector('.btn-mute');
    const btnMuteIcon = btnMute.querySelector('.fa');
    const btnPlay = document.querySelector('.btn-play');
    const btnPlayIcon = btnPlay.querySelector('.fa');
    const btnForward = document.querySelector('.btn-forward');
    const btnReset = document.querySelector('.btn-reset');
    const btnStop = document.querySelector('.btn-stop');
    const vol = document.querySelector('.volume-bar');
    const volBarFill = document.querySelector('.vol-bar-fill');
    const volFillCheck = document.querySelector('.vol-fill-check');
    const progressBar = document.querySelector('.progress-bar');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const progCont = document.querySelector('#prog_Cont');
    const progMouse = document.querySelector('.progress-bar-mouse');
    const videoElement = document.querySelector('.video-element');
    /*const sliderbutton = document.querySelector('.sliderbutton');*/
    
    // Toggle full-screen mode
    const expandVideo = () => {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement){
          // exit full-screen
          console.log("exiting fullscreen");
          if (document.exitFullscreen) {
              document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
          }
          spanFullIcon.classList.remove('fa-compress');
          spanFullIcon.classList.add('fa-expand');
      }else{
          console.log("enter fullscreen");
          if (videoElement.requestFullscreen) {
            document.querySelector('.video-wrapper').requestFullscreen();
          } else if (videoElement.mozRequestFullScreen) {
            // Version for Firefox
            document.querySelector('.video-wrapper').mozRequestFullScreen();
          } else if (videoElement.webkitRequestFullscreen) {
            // Version for Chrome and Safari
            document.querySelector('.video-wrapper').webkitRequestFullscreen();
          }
          spanFullIcon.classList.remove('fa-expand');
          spanFullIcon.classList.add('fa-compress');
      }     
    }

    // Move the video backward for 5 seconds
    const moveBackward = () => {
      videoElement.currentTime -= 5;
    }

    // Move the video forward for 5 seconds
    const moveForward = () => {
      videoElement.currentTime += 5;
    }

    // Mute the video
    const muteVideo = () => {
      if (videoElement.muted) {
        videoElement.muted = false;
        btnMuteIcon.classList.remove('fa-volume-off');
        btnMuteIcon.classList.add('fa-volume-up');
      } else {
        videoElement.muted = true;
        btnMuteIcon.classList.remove('fa-volume-up');
        btnMuteIcon.classList.add('fa-volume-off');
      }
    }

    // Play / Pause the video
    const playPauseVideo = () => {
      if (videoElement.paused) {
        videoElement.play();

        btnPlayIcon.classList.remove('fa-play');
        btnPlayIcon.classList.add('fa-pause');
      } else {
        videoElement.pause();

        btnPlayIcon.classList.remove('fa-pause');
        btnPlayIcon.classList.add('fa-play');
      }
    }

    // Restart the video
    const restartVideo = () => {
      videoElement.currentTime = 0;

      btnPlay.removeAttribute('hidden');
      btnReset.setAttribute('hidden', 'true');
    }

    // Stop the video
    const stopVideo = () => {
      videoElement.pause();
      videoElement.currentTime = 0;
      btnPlayIcon.classList.remove('fa-pause');
      btnPlayIcon.classList.add('fa-play');
    }

    // Update progress bar as the video plays
    const updateProgress = () => {
      // Calculate current progress
      var value = (100 / videoElement.duration) * videoElement.currentTime;

      // Update the slider value
      if (value/100 <= .5){
         progressBarFill.style.width = value +.5 + '%'; 
      }else{
         progressBarFill.style.width = value - (value/200) + '%';    
      }
      
      
      /*progressBarFill.style.width = value + '%';*/
      /*sliderbutton.style.left = (value -1) + '%';*/
      progressBar.value = value;
    }
    
    var clearBar = function(){
        videoElement.addEventListener('loadedmetadata', function() {
            progressBar.value = progressBar.defaultValue;
            progressBarFill.style.width = '0%';
        }, false);
    }
    
    next.onmouseup = clearBar();
    back.onmouseup = clearBar();
    vol.addEventListener("input", function() {
       console.log("vol: "+vol.value);
       console.log("fill: "+volBarFill.style.width);
       
       videoElement.volume = this.value / 100;
       volBarFill.style.width = this.value+'%';
    });
    
    progressBar.addEventListener("change", function() {
        // Calculate the new time
        var time = videoElement.duration * (progressBar.value / 100);

        // Update the video time
        videoElement.currentTime = time;
    });

    // Pause the video when the slider handle is being dragged
    progressBar.addEventListener("mousedown", function() {
      videoElement.pause();
    });
    

    // Play the video when the slider handle is dropped
    /*progressBar.addEventListener("mouseup", function() {
      progressBar.value = progMouse.style.width;
      videoElement.play();
    });*/
    
    progressBar.onmouseup = function(e) {
           //console.log("Mouse move x:"+mouse.pos.x+" y:"+mouse.pos.y);
          // normalize mouse position to range 0.0 - 1.0
          /*mouse.pos.x = (e.clientX-parent.offsetLeft-1) / width;
          mouse.pos.y = (e.clientY-parent.offsetTop+1) / height;*/
          var mousex = e.layerX;
          var width = progressBar.clientWidth;
          var ratio = (mousex/width);
          //console.log(ratio);
          /*progMouse.style.width = (ratio*100)+ '%';*/
          progressBar.value = ((ratio*100)-1.5);
          //console.log(parseFloat(progMouse.style.width));
          videoElement.play();
          //console.log("Mouse pos x: "+mouse.pos.x + " y: " +mouse.pos.y);
          //mouse.move = true;
    };
    
    progressBar.onmousemove = function(e) {
           //console.log("Mouse move x:"+mouse.pos.x+" y:"+mouse.pos.y);
          // normalize mouse position to range 0.0 - 1.0
          /*mouse.pos.x = (e.clientX-parent.offsetLeft-1) / width;
          mouse.pos.y = (e.clientY-parent.offsetTop+1) / height;*/
          var mousex = e.layerX;
          var width = progressBar.clientWidth;
          var ratio = (mousex/width);
          //console.log(ratio);
          progMouse.style.width = ((ratio*100)-1.3)+ '%';
          //console.log(progMouse.style.width);
          //console.log("Mouse pos x: "+mouse.pos.x + " y: " +mouse.pos.y);
          //mouse.move = true;
    };
    
    progressBar.onmouseleave = function(e) {
           //console.log("Mouse move x:"+mouse.pos.x+" y:"+mouse.pos.y);
          // normalize mouse position to range 0.0 - 1.0
          /*mouse.pos.x = (e.clientX-parent.offsetLeft-1) / width;
          mouse.pos.y = (e.clientY-parent.offsetTop+1) / height;*/
          
          progMouse.style.width = 0+ '%';
          //console.log("Mouse pos x: "+mouse.pos.x + " y: " +mouse.pos.y);
          //mouse.move = true;
    };
    
    // Event listeners
    btnBackward.addEventListener('click', moveBackward, false);
    btnExpand.addEventListener('click', expandVideo, false);
    btnMute.addEventListener('click', muteVideo, false);
    btnPlay.addEventListener('click', playPauseVideo, false);
    btnForward.addEventListener('click', moveForward, false);
    //btnReset.addEventListener('click', restartVideo, false);
    //btnStop.addEventListener('click', stopVideo, false);
    videoElement.addEventListener('ended', () => {
      btnPlay.setAttribute('hidden', 'true');
      btnReset.removeAttribute('hidden');
    }, false);
    videoElement.addEventListener('timeupdate', updateProgress, false);
    return "";
});

app.factory('audPlay', function () {
    const next = document.querySelector('.fa-forward');
    const back = document.querySelector('.fa-step-backward');
    const btnBackward = document.querySelector('.btn-backward');
    const btnExpand = document.querySelector('.btn-expand');
    /*const spanFullIcon = btnExpand.querySelector('.fa');*/
    const btnMute = document.querySelector('.btn-mute');
    const btnMuteIcon = btnMute.querySelector('.fa');
    const btnPlay = document.querySelector('.audio-play');
    const btnPlayIcon = btnPlay.querySelector('.fa');
    const mbtnPlay = document.querySelector('.maudio-play');
    const mbtnPlayIcon = mbtnPlay.querySelector('.fa');
    const btnForward = document.querySelector('.btn-forward');
    const btnReset = document.querySelector('.btn-reset');
    const btnStop = document.querySelector('.btn-stop');
    const vol = document.querySelector('.avolume-bar');
    const volBarFill = document.querySelector('.avol-bar-fill');
    const volFillCheck = document.querySelector('.avol-fill-check');
    const progressBar = document.querySelector('.audio-bar');
    const progressBarFill = document.querySelector('.audio-bar-fill');
    const progCont = document.querySelector('#aud_Cont');
    const progMouse = document.querySelector('.audio-bar-mouse');
    const audioElement = document.querySelector('.audio-element');
    
    const playPauseVideo = () => {
      if (audioElement.paused) {
        audioElement.play();

        btnPlayIcon.classList.remove('fa-play');
        btnPlayIcon.classList.add('fa-pause');
        mbtnPlayIcon.classList.remove('fa-play');
        mbtnPlayIcon.classList.add('fa-pause');
        btnPlayIcon.style.marginLeft = "2px";
        console.log(btnPlayIcon.style.marginLeft);
      } else {
        audioElement.pause();

        btnPlayIcon.classList.remove('fa-pause');
        btnPlayIcon.classList.add('fa-play');
        mbtnPlayIcon.classList.remove('fa-pause');
        mbtnPlayIcon.classList.add('fa-play');
        btnPlayIcon.style.marginLeft = "11px";
        console.log(btnPlayIcon.style.marginLeft);
      }
    }
    
    // Move the video backward for 5 seconds
    const moveBackward = () => {
      audioElement.currentTime -= 30;
    }

    // Move the video forward for 5 seconds
    const moveForward = () => {
      audioElement.currentTime += 30;
    }
    
    // Update progress bar as the video plays
    const updateProgress = () => {
      // Calculate current progress
      var value = (100 / audioElement.duration) * audioElement.currentTime;

      // Update the slider value
      if (value/100 <= .5){
         progressBarFill.style.width = value +.5 + '%'; 
      }else{
         progressBarFill.style.width = value - (value/200) + '%';    
      }
      
      
      /*progressBarFill.style.width = value + '%';*/
      /*sliderbutton.style.left = (value -1) + '%';*/
      progressBar.value = value;
    }
    
    // Mute the audio
    const muteVideo = () => {
      if (audioElement.muted) {
        audioElement.muted = false;
        btnMuteIcon.classList.remove('fa-volume-off');
        btnMuteIcon.classList.add('fa-volume-up');
      } else {
        audioElement.muted = true;
        btnMuteIcon.classList.remove('fa-volume-up');
        btnMuteIcon.classList.add('fa-volume-off');
      }
    }
    
    var clearBar = function(){
        audioElement.addEventListener('loadedmetadata', function() {
            progressBar.value = progressBar.defaultValue;
            progressBarFill.style.width = '0%';
        }, false);
    }
    
    next.onmouseup = clearBar();
    back.onmouseup = clearBar();
    vol.addEventListener("input", function() {
       console.log("vol: "+vol.value);
       console.log("fill: "+volBarFill.style.width);
       
       audioElement.volume = this.value / 100;
       volBarFill.style.width = this.value+'%';
    });
    
    progressBar.addEventListener("change", function() {
        // Calculate the new time
        var time = audioElement.duration * (progressBar.value / 100);

        // Update the video time
        audioElement.currentTime = time;
    });

    // Pause the video when the slider handle is being dragged
    progressBar.addEventListener("mousedown", function() {
        btnPlayIcon.classList.remove('fa-pause');
        btnPlayIcon.classList.add('fa-play');
        mbtnPlayIcon.classList.remove('fa-pause');
        mbtnPlayIcon.classList.add('fa-play');
        btnPlayIcon.style.marginLeft = "11px";
        audioElement.pause();
    });
    

    // Play the video when the slider handle is dropped
    /*progressBar.addEventListener("mouseup", function() {
      progressBar.value = progMouse.style.width;
      audioElement.play();
    });*/
    
    progressBar.onmouseup = function(e) {
           //console.log("Mouse move x:"+mouse.pos.x+" y:"+mouse.pos.y);
          // normalize mouse position to range 0.0 - 1.0
          /*mouse.pos.x = (e.clientX-parent.offsetLeft-1) / width;
          mouse.pos.y = (e.clientY-parent.offsetTop+1) / height;*/
          var mousex = e.layerX;
          var width = progressBar.clientWidth;
          var ratio = (mousex/width);
          //console.log(ratio);
          /*progMouse.style.width = (ratio*100)+ '%';*/
          btnPlayIcon.classList.remove('fa-play');
          btnPlayIcon.classList.add('fa-pause');
          mbtnPlayIcon.classList.remove('fa-play');
          mbtnPlayIcon.classList.add('fa-pause');
          btnPlayIcon.style.marginLeft = "2px";
          progressBar.value = ((ratio*100)-1.5);
          //console.log(parseFloat(progMouse.style.width));
          audioElement.play();
          //console.log("Mouse pos x: "+mouse.pos.x + " y: " +mouse.pos.y);
          //mouse.move = true;
    };
    
    progressBar.onmousemove = function(e) {
           //console.log("Mouse move x:"+mouse.pos.x+" y:"+mouse.pos.y);
          // normalize mouse position to range 0.0 - 1.0
          /*mouse.pos.x = (e.clientX-parent.offsetLeft-1) / width;
          mouse.pos.y = (e.clientY-parent.offsetTop+1) / height;*/
          var mousex = e.layerX;
          var width = progressBar.clientWidth;
          var ratio = (mousex/width);
          //console.log(ratio);
          progMouse.style.width = ((ratio*100)-1.3)+ '%';
          //console.log(progMouse.style.width);
          //console.log("Mouse pos x: "+mouse.pos.x + " y: " +mouse.pos.y);
          //mouse.move = true;
    };
    
    progressBar.onmouseleave = function(e) {
           //console.log("Mouse move x:"+mouse.pos.x+" y:"+mouse.pos.y);
          // normalize mouse position to range 0.0 - 1.0
          /*mouse.pos.x = (e.clientX-parent.offsetLeft-1) / width;
          mouse.pos.y = (e.clientY-parent.offsetTop+1) / height;*/
          
          progMouse.style.width = 0+ '%';
          //console.log("Mouse pos x: "+mouse.pos.x + " y: " +mouse.pos.y);
          //mouse.move = true;
    };
    
    btnPlay.addEventListener('click', playPauseVideo, false);
    mbtnPlay.addEventListener('click', playPauseVideo, false);
    audioElement.addEventListener('timeupdate', updateProgress, false);
    // Event listeners
    btnBackward.addEventListener('click', moveBackward, false);
    /*btnExpand.addEventListener('click', expandVideo, false);*/
    btnMute.addEventListener('click', muteVideo, false);
    /*btnPlay.addEventListener('click', playPauseVideo, false);*/
    btnForward.addEventListener('click', moveForward, false);
    return "";
});

app.factory('Canvas', function (socket) {
    console.log("accessing canvas factory");
    var mouse = { 
          click: false,
          move: false,
          pos: {x:0, y:0},
          pos_prev: false
       };
       // get canvas element and create context
        /*var canvasCurs = document.getElementById('drawing_Cursor');*/
        var canvas  = document.getElementById('drawing');
        var canvas2 = document.getElementById('cursor');
        var canvas3 = document.getElementById('otherPlayers');
        var context = canvas.getContext('2d');
        var context2 = canvas2.getContext('2d');
        var context3 = canvas3.getContext('2d');
        /*var scale = Math.min(window.innerWidth/canvas.width,window.innerHeight/canvas.height);*/
        var scaleX = window.innerWidth/canvas.width;
        var scaleY = window.innerHeight/canvas.height;
        var pixelRatio = window.devicePixelRatio;
        var parent = document.getElementById('canvas_cont');
        var width = canvas.width * scaleX;
        var height = canvas.height * scaleX;
        var initwidth = document.body.clientWidth;
        var initheight = document.body.clientHeight;
        var colo = document.getElementById('colo');
        var counter;
        var save = document.getElementById('save');
        context.scale(scaleX, scaleX);
        context2.scale(scaleX, scaleX);
        context3.scale(scaleX, scaleX);
        //canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight);
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        canvas2.width = parent.offsetWidth;
        canvas2.height = parent.offsetHeight;
        canvas3.width = parent.offsetWidth;
        canvas3.height = parent.offsetHeight;
        /*var circle = new Path2D();*/
        function Circle(x, y){
            context2.clearRect(0,0, canvas.width, canvas.height);
            context2.beginPath();
            /*console.log(x * width+","+ y * height);*/
            context2.moveTo(x * width, y * height);
            context2.arc(x * width, y * height, 5, 0, 2 * Math.PI);
            context2.fillStyle=colo.value;
            context2.fill();
        }
    
        function oCircles(data){
            context3.clearRect(0,0, canvas.width, canvas.height);
            /*console.log(JSON.stringify(data));*/
            for(var i in data){
                context3.beginPath();
                /*console.log("JSON: "+data[i].x+" "+data[i].y+" "+data[i].color);*/
                /*console.log(x * width+","+ y * height);*/
                context3.moveTo(data[i].x * width, data[i].y * height);
                context3.arc(data[i].x * width, data[i].y * height, 5, 0, 2 * Math.PI);
                context3.fillStyle=data[i].color;
                context3.fill();   
            }
        }
        /*console.log(parent.offsetWidth);
        console.log(parent.offsetHeight);*/
        //console.log("Initx: "+initwidth+" - canvx "+width+" = "+(width/initwidth));
        window.addEventListener("resize", resizeCanvas, false);
        
        function debounce(func){
          var timer;
          return function(event){
            if(timer) clearTimeout(timer);
            timer = setTimeout(func,150,event);
          };
        }
    
        function resizeCanvas(e) {
            console.log("testing");
            //canvas = document.querySelector("#drawing");
            /*var data=canvas.toDataURL();*/
            /*console.log(parent.offsetWidth);
            console.log(parent.offsetHeight);*/
            scaleX = window.innerWidth/canvas.width;
            scaleY = window.innerHeight/canvas.height;
            pixelRatio = window.devicePixelRatio;
            context.scale(scaleX, scaleX);
            context2.scale(scaleX, scaleX);
            context3.scale(scaleX, scaleX);
            width = canvas.width * scaleX;
            height = canvas.height * scaleX;
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
            canvas2.width = parent.offsetWidth;
            canvas2.height = parent.offsetHeight;
            canvas3.width = parent.offsetWidth;
            canvas3.height = parent.offsetHeight;
            
            socket.emit("connect_Canvas");
        }
    
        /*save.onclick = function(){
            document.location.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        };*/
        /*canvas2.onmouseleave = function(){socket.emit('oOBounds')};*/

        colo.onchange = function(){colo = document.getElementById('colo');};
       // register mouse event handlers
       canvas2.onmousedown = function(e){ mouse.click = true; /*console.log("Clicked up");*/};
       canvas2.onmouseup = function(e){ mouse.click = false; /*console.log("Clicked Down");*/};

       canvas2.onmousemove = function(e) {
           //console.log("Mouse move x:"+mouse.pos.x+" y:"+mouse.pos.y);
          // normalize mouse position to range 0.0 - 1.0
          mouse.pos.x = (e.clientX-parent.offsetLeft-0) / width;
          mouse.pos.y = (e.clientY-parent.offsetTop+0) / height;
          Circle(mouse.pos.x, mouse.pos.y);
           /*console.log(colo.value);*/
          var cursor = {
              x: mouse.pos.x,
              y: mouse.pos.y,
              color: colo.value
          }
          //console.log("Mouse pos x: "+mouse.pos.x + " y: " +mouse.pos.y);
          socket.emit('cursor_Move', cursor);
          mouse.move = true;
       };
    
       //http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
        
        function getTouchPos(canvasDom, touchEvent) {
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: touchEvent.touches[0].clientX - rect.left,
                y: touchEvent.touches[0].clientY - rect.top
            };
        }

       // draw line received from server
        socket.on('draw_line', function (data) {
          var line = data.line;
          context.beginPath();
          context.moveTo(line[0].x * width, line[0].y * height);
          context.lineTo(line[1].x * width, line[1].y * height);
          context.lineCap = 'round';
          context.strokeStyle = line[2];
          context.stroke();
       });
    
        // update cursors
        socket.on('update_mouse', function (data) {
          /*console.log("Cursors: ");*/
            oCircles(data);
       });
    
        socket.on('clear_Canvas', function (res){
            if(res == "Times up!"){
                scaleX = window.innerWidth/canvas.width;
                scaleY = window.innerHeight/canvas.height;
                pixelRatio = window.devicePixelRatio;
                context.scale(scaleX, scaleX);
                width = canvas.width * scaleX;
                height = canvas.height * scaleX;
                canvas.width = parent.offsetWidth;
                canvas.height = parent.offsetHeight; 
            }
        });

       // main loop, running every 25ms
       function mainLoop() {
          // check if the user is drawing
          if (mouse.click && mouse.move && mouse.pos_prev) {
             // send line to to the server
             socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev, colo.value] });
             mouse.move = false;
          }
          mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
          setTimeout(mainLoop, 20);
       }
       mainLoop();
    return "";
});

app.factory('userAuth', function($cookieStore){
        var user = $cookieStore.get("userName");
        var AuthTok = $cookieStore.get("AuthTok");
        
        if(user== "")
            {
                var res = "Login";
            }else{
                var res = {user: user, AuthTok: AuthTok};
            }
        
        return{res};
});

/*app.factory('cardViewr', function($http){
    var ret;
    return{
        get: function(){
            //$http.get('/CardViewer/'+user).success(function(data){ret=data});
            return ret;
        },
        
        set: function(user){
            ret = user;
        }
        
    }
        
});*/

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
    
//http://www.techstrikers.com/AngularJS/angularjs-custom-filter.php
//Used to stop returning results after a certain amount. Basically used for the waiting list.
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

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                        });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

//used for datepicker and date inserting
app.directive('datepickerPopup', function (dateFilter, $parse){
    return {
        restrict: 'EAC',
        require: '?ngModel',
        link: function(scope, element, attr, ngModel,ctrl) {
            ngModel.$parsers.push(function(viewValue){
                return dateFilter(viewValue, 'yyyy-MM-dd');
    });
    }
  }
});

app.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on(attr.focusOn, function(e) {
          elem[0].focus();
      });
   };
});

app.directive('bindHtmlCompile', ['$compile', function ($compile) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(function () {
        return scope.$eval(attrs.bindHtmlCompile);
      }, function (value) {
        // Incase value is a TrustedValueHolderType, sometimes it
        // needs to be explicitly called into a string in order to
        // get the HTML string.
        element.html(value && value.toString());
        // If scope is provided use it, otherwise use parent scope
        var compileScope = scope;
        if (attrs.bindHtmlScope) {
          compileScope = scope.$eval(attrs.bindHtmlScope);
        }
        $compile(element.contents())(compileScope);
      });
    }
  };
}]);

//the following contains "routes" or the web pages injected into the template page
//template defines the template the page is injected into
//controller defines what the rules and data available for the page are

//http://jonsamwell.com/url-route-authorization-and-security-in-angular/
//http://stackoverflow.com/questions/11541695/redirecting-to-a-certain-route-based-on-condition
app.config(function($routeProvider, $httpProvider){
    
    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
  $httpProvider.defaults.cache = false;

  if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
  }
  $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
    
    $routeProvider
    
    //route for the landing page
    
    .when('/', {
        templateUrl: 'About.html',
        controller: 'data_NavBar'
    })
    
    .when('/Home', {
        templateUrl: 'About.html',
        controller: 'data_NavBar'
    })
    
    .when('/Gallery', {
        templateUrl: 'Gallery.html',
        controller: 'data_GHome'
    })
    
    .when('/GalleryList', {
        templateUrl: 'NewsList.html',
        controller: 'data_Gallery'
    })
    
    .when('/GalleryList/:id', {
        templateUrl: 'NewsList.html',
        controller: 'data_Gallery'
    })
    
    .when('/NewsBlog', {
        templateUrl: 'NewsList.html',
        controller: 'data_NewsList'
    })
    
    .when('/NewsBlog/L/:id', {
        templateUrl: 'NewsList.html',
        controller: 'data_NewsList'
    })
    
    .when('/NewsBlog/:id', {
        templateUrl: 'News.html',
        controller: 'data_NewsArticle'
    })
    
    .when('/Bookmarked', {
        templateUrl: 'SavedList.html',
        controller: 'data_Bookmarked'
    })
    
    .when('/CodeExp', {
        templateUrl: 'CodeExp.html',
        controller: 'data_GHome'
    })
    
    .when('/CodeExp/:id', {
        templateUrl: 'CodeExp.html',
        controller: 'data_GHome'
    })
    
    .when('/Portfolio', {
        templateUrl: 'Portfolio.html',
        controller: 'data_Default'
    })
    
    .when('/About', {
        templateUrl: 'Home.html',
        controller: 'data_NavBar'
    })
    
    .when('/NewUser', {
        templateUrl: 'NewUser.html',
        controller: 'data_NUser'
    })
    
    .when('/Donate', {
        templateUrl: 'About.html',
        controller: 'data_NavBar'
    })
    
    .when('/Contact', {
        templateUrl: 'About.html',
        controller: 'data_NavBar'
    })
    
    .when('/Inbox', {
        templateUrl: 'Contacts.html',
        controller: 'data_Inbox'
    })
    
    .when('/InboxConv', {
        templateUrl: 'inboxConv.html',
        controller: 'data_InboxConv'
    })
    
    .when('/UpdateAccount', {
        templateUrl: 'NewUser.html',
        controller: 'data_UPDAccount'
    })
    
    .when('/Organizer', {
        templateUrl: 'Organizer.html',
        controller: 'data_Organizer'
    })
    
    .when('/VideoStream', {
        templateUrl: 'Port_Video.html',
        controller: 'data_Video'
    })
    
    .when('/AudioStream', {
        templateUrl: 'Port_Audio.html',
        controller: 'data_Audio'
    })
    
    .when('/Chat', {
        templateUrl: 'Chat.html',
        controller: 'data_Chat'
    })
    
    .when('/verify/i/d/2/:Verify', {
        templateUrl: 'About.html',
        controller: 'data_Verify'
    })
    
    .when('/Canvas', {
        templateUrl: 'Canvas.html',
        controller: 'data_Canvas'
    })
    
    //these will be removed later, site is small enough to fix mishaps quickly.
    .when('/Admin/NewNews', {
        templateUrl: './Addy/NNews.html',
        controller: 'data_NewsList'
    })
    
    .when('/Admin/NewGallery', {
        templateUrl: './Addy/NNews.html',
        controller: 'data_NewsList'
    })
    
    //set default page or 404    
    .otherwise('/');
          });

app.controller('data_Default', function($scope, $http, socket){   
/*$http.get('/Data', {cache: true}).success(function(data){$scope.data=data;});*/
});

app.controller('data_UPDAccount', function($scope, $http, socket, userAuth){   
    $http.get('/UpAcc/'+userAuth.res.user).success(function(data){
        $scope.data=data;
        $scope.nLogin = {
            nUName: data.v_UserName, 
            nFName: data.v_First,
            nLName: data.v_Last,
            nEmail: data.v_Email,
            nBio: data.v_Bio,
            nFile: "./assets/img/User/"+userAuth.res.user+".jpg"/*,
            nImgCheck: '0'*/
        }
        if(data.v_UsTitle == "User"){
            $scope.nLogin.nUsType = 1;
        }else if(data.v_UsTitle == "Artist"){
            $scope.nLogin.nUsType = 2;
        }else if(data.v_UsTitle == "Programmer"){
            $scope.nLogin.nUsType = 3;
        }else if(data.v_UsTitle == "Web Designer"){
            $scope.nLogin.nUsType = 4;
        }else if(data.v_UsTitle == "Game Designer"){
            $scope.nLogin.nUsType = 5;
        }else if(data.v_UsTitle == "Marketer"){
            $scope.nLogin.nUsType = 6;
        }else if(data.v_UsTitle == "Developer"){
            $scope.nLogin.nUsType = 7;
        }else if(data.v_UsTitle == "Internet Technician"){
            $scope.nLogin.nUsType = 8;
        }else if(data.v_UsTitle == "Graphic Designer"){
            $scope.nLogin.nUsType = 9;
        }else if(data.v_UsTitle == "Polymath"){
            $scope.nLogin.nUsType = 10;
        }else{
            $scope.nLogin.nUsType = "User";
        }
        
        $scope.Title = data.v_UsTitle;
    });
    
    $scope.createLogin = function(Login){socket.emit('upd_Login', Login)};
    socket.on('Alert', function(res){$scope.Alert = res;});
    
    $scope.myImage='';
    $scope.myCroppedImage='';

    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
          $scope.updIm();
        });
      };
      reader.readAsDataURL(file);
    };
    
    $scope.nTitle = function(veryAble){
        if(veryAble == 1){
            $scope.Title = "User";
        }else if(veryAble == 2){
            $scope.Title = "Artist";
        }else if(veryAble == 3){
            $scope.Title = "Programmer";
        }else if(veryAble == 4){
            $scope.Title = "Web Designer";
        }else if(veryAble == 5){
            $scope.Title = "Game Designer";
        }else if(veryAble == 6){
            $scope.Title = "Marketer";
        }else if(veryAble == 7){
            $scope.Title = "Developer";
        }else if(veryAble == 8){
            $scope.Title = "Internet Technician";
        }else if(veryAble == 9){
            $scope.Title = "Graphic Designer";
        }else if(veryAble == 10){
            $scope.Title = "Polymath";
        }else{
            $scope.Title = "User";
        } 
    }
    
    $scope.updIm = function(){
        $scope.nLogin.nFile = $scope.myImage;
    }
    
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
});


app.controller('data_Organizer', function($scope){   
    $scope.array_List = [];
    $scope.count = 0;
    $scope.Col = "5";
    $scope.NumItem = "10";
    
     $scope.add = function() {
        $scope.array_List.push({id: $scope.count, item: $scope.form_Item.inp});
        $scope.form_Item.inp = '';
        $scope.count += 1;
        $scope.$broadcast('newItemAdded');
        //https://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field
         
    };
    
    $scope.remove = function(index) {
    	$scope.items.splice(index, 1);
    }; 
    
});


app.controller('data_Video', function($scope, vidPlay){
    var btnPlay = document.querySelector('.btn-play');
    var btnPlayIcon = btnPlay.querySelector('.fa');
    
    $scope.videoElement = document.querySelector('.video-element');
    $scope.VidList = [
        {id: "1", Name: "/video/1.mp4", Img: "./assets/img/News/Testing styles.jpg"},
        {id: "2", Name: "/video/2.mp4", Img: "./assets/img/News/NewTest.jpg"}];
    $scope.CurrNumb = 0;
    $scope.Serv = $scope.VidList[$scope.CurrNumb].Name;
    $scope.Poster = $scope.VidList[$scope.CurrNumb].Img;
    //$scope.CurrVid = $scope.VidList[$scope.CurrNumb].Name;
    //$scope.urlServ = $scope.Serv+$scope.CurrVid;
    $scope.Next = function(){
        if($scope.CurrNumb+1 > $scope.VidList.length -1)
            {
                $scope.CurrNumb = 0;
            }else{
                $scope.CurrNumb++;
            }
        btnPlayIcon.classList.remove('fa-pause');
        btnPlayIcon.classList.add('fa-play');
        $scope.Serv = $scope.VidList[$scope.CurrNumb].Name;
        $scope.Poster = $scope.VidList[$scope.CurrNumb].Img;
       /* btnPlayIcon.classList.remove('fa-play');
        btnPlayIcon.classList.add('fa-pause');*/
        $scope.videoElement.load();
        //$scope.videoElement.play();
    };
    $scope.Back = function(){
        if($scope.CurrNumb -1 < 0)
            {
                $scope.CurrNumb = $scope.VidList.length - 1;
            }else{
                $scope.CurrNumb--;
            }
         btnPlayIcon.classList.remove('fa-pause');
        btnPlayIcon.classList.add('fa-play');
        $scope.Serv = $scope.VidList[$scope.CurrNumb].Name;
        $scope.Poster = $scope.VidList[$scope.CurrNumb].Img;
        $scope.videoElement.load();
        
        //$scope.videoElement.play();
    };
    
    
});


app.controller('data_Audio', function($scope, audPlay){    
    
});

app.controller('data_About', function($scope, $http, socket){   
/*$http.get('/Data').success(function(data){$scope.data=data;});*/
});

app.controller('data_NavBar', function($scope, $http, socket, $cookieStore, userAuth, $window){
    $scope.user = userAuth.res.user;
    $scope.AuthTok = userAuth.res.AuthTok;
    if ($scope.user != undefined){
        $scope.Login = $scope.user; 
    }else{
        $scope.Login = "Login";
    }
    
    $scope.viewNumb = 0;
    $scope.verifNumb = 0;
    
    $http.get('/CardViewer/'+$scope.Cardest).success(function(data){$scope.ret=data});
        
    $scope.authenticateLogin = function(Login){socket.emit('authenticate_Login', Login)};
    $scope.NInb = function(NInboxM){
        NInboxM = {
            iMessage: NInboxM.iMessage,
            iUser: $scope.user,
            iReceive: "QFE",
            iLink: "#"
        }
        socket.emit('new_Inbox', NInboxM)};
    
    socket.on('AlertLogin', function(res){$scope.AlertLogin = res;});
    socket.on('NewLogin', function(res){$('#Message').modal('show'); $scope.NavMessage = "Please check your email for further instructions";});
    socket.on('Login', function(){$('#Login').modal('show');});
    socket.on('LogSuccess', function(res){
        $cookieStore.put("userName", res.userName);
        $cookieStore.put("AuthTok", res.sockNumb);
        $scope.Login=$cookieStore.get("userName");
        //console.log(userAuth.res.user +" "+ userAuth.res.AuthTok)
        $('#Login').modal('hide');
        $window.location.reload();
        //console.log($cookieStore.get("userName"));
    });
    
    $scope.closeLogin = function(){$('#Login').modal('hide')};
    $scope.openForgot = function(){$scope.viewNumb = 1; $scope.verifNumb = 0;};
    $scope.openDefault = function(){$scope.viewNumb = 0;};
    $scope.forgotPass = function(uVerify){socket.emit('forgot_Pass', uVerify)};
    $scope.forgotVerify = function(uVerify){socket.emit('forgot_Verify', uVerify)};
    socket.on('AlertVerify', function(res){
        if(res == 1){
            $scope.AlertVerify = "Check your email for your verification code";
            $scope.verifNumb = 1;
        }else if (res == 2){
            $scope.AlertVerify = "Email not found";
        }else{
            $scope.AlertVerify = "Something's not right. Try again in a few minutes";
        }
    });
    
    $scope.Card = function(){socket.emit('get_Card', $scope.user)};
    
    socket.on('cardRet', function(Card){
        $http.get('/CardViewer/'+Card).success(function(data){$scope.ret=data});
        $('#cardView').modal('show');
        console.log(Card);
    });
    
    $scope.Logout = function(){$cookieStore.remove("userName"); $cookieStore.remove("AuthTok"); $cookieStore.remove("enoBox"); $scope.Login="Login"; $window.location.reload();};
});

app.controller('data_NUser', function($scope, $http, socket){
    $scope.createLogin = function(Login){socket.emit('create_Login', Login)};
    /*$scope.newUser = function(nUser){socket.emit('new_User', nUser)};*/
    $scope.updUser = function(uUser){socket.emit('upd_User', uUser)};
    socket.on('Alert', function(res){$scope.Alert = res;});
    
    $scope.myImage='';
    $scope.myCroppedImage='';

    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
          $scope.updIm();
        });
      };
      reader.readAsDataURL(file);
    };
    
    $scope.nTitle = function(veryAble){
        if(veryAble == 1){
            $scope.Title = "User";
        }else if(veryAble == 2){
            $scope.Title = "Artist";
        }else if(veryAble == 3){
            $scope.Title = "Programmer";
        }else if(veryAble == 4){
            $scope.Title = "Web Designer";
        }else if(veryAble == 5){
            $scope.Title = "Game Designer";
        }else if(veryAble == 6){
            $scope.Title = "Marketer";
        }else if(veryAble == 7){
            $scope.Title = "Developer";
        }else if(veryAble == 8){
            $scope.Title = "Internet Technician";
        }else if(veryAble == 9){
            $scope.Title = "Graphic Designer";
        }else if(veryAble == 10){
            $scope.Title = "Polymath";
        }else{
            $scope.Title = "User";
        } 
    }
    
    $scope.Title = "User";
    
    $scope.updIm = function(){
        $scope.nLogin.nFile = $scope.myImage;
    }
    
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
});

app.controller('data_GHome', function($scope, $http, socket){   
    $http.get('/GHome').success(function(data){$scope.data=data;
       /* if (data.v_GraphDes > 0)
            {
                $scope.s_GraphDes = 1;
            }
        
        if (data.v_Digital > 0)
            {
                $scope.s_Digital = 1;
            }
        
        if (data.v_Chaos > 0)
            {
                $scope.s_Chaos = 1;
            }
        
        if (data.v_Spacial > 0)
            {
                $scope.s_Spacial = 1;
            }
        
        if (data.v_ThreeDee > 0)
            {
                $scope.s_ThreeDee = 1;
            }
        
        if (data.v_Sketches > 0)
            {
                $scope.s_Sketches = 1;
            }*/
        
        if (data.v_ComplSys > 0)
            {
                $scope.s_Compl = 1;
            }
        
        if (data.v_JDemo > 0)
            {
                $scope.s_JustDe = 1;
            }
        
        if (data.v_Angu > 0)
            {
                $scope.s_Angular = 1;
            }
        
        if (data.v_Node > 0)
            {
                $scope.s_Node = 1;
            }
        
        if (data.v_Htm > 0)
            {
                $scope.s_Html = 1;
            }
        
        if (data.v_Andr > 0)
            {
                $scope.s_Andr = 1;
            }
        
        if (data.v_PHPSc > 0)
            {
                $scope.s_PHP = 1;
            }
        
        if (data.v_MyS > 0)
            {
                $scope.s_MySQL = 1;
            }
        
        if (data.v_UEFour > 0)
            {
                $scope.s_UE4 = 1;
            }
        
        if (data.v_NviPhys > 0)
            {
                $scope.s_Nvidia = 1;
            }
        
        if (data.v_SubDes > 0)
            {
                $scope.s_SubDes = 1;
            }
        
        if (data.v_SubPaint > 0)
            {
                $scope.s_SubPaint = 1;
            }
        
        if (data.v_Blender > 0)
            {
                $scope.s_Blender = 1;
            }
        $http.get('/GImages').success(function(data){$scope.x=data;});
                                              });
    
});

app.controller('data_Gallery', function($scope, $http, socket, $routeParams){   
    $http.get('/D_NewsList/I').success(function(data){
        $scope.data=data;
        console.log(JSON.stringify(data));
        $scope.News = {
            i_Author: userAuth.res.user
        }
    });
    $scope.lHeader="Gallery";
    $scope.Order = "-v_idNews";
    $scope.ImageClass = $routeParams.id;
    
    //double check if working, else delete
    $scope.Col = "5";
    $scope.NumItem = "10";
    if($routeParams.id)
        {
            $scope.fSearch = $routeParams.id;
        }
    
});

app.controller('data_Verify', function($scope, $http, socket, $routeParams){   
    /*$http.get('/D_NewsList/I').success(function(data){$scope.data=data;});*/
    /*$scope.lHeader="Gallery";*/
    $scope.test = $routeParams.Verify;
    if($routeParams.Verify)
        {
            socket.emit('auth_newLog', $scope.test);
        }    
});

app.controller('data_NewsList', function($scope, $http, socket, $routeParams, userAuth){   
    $http.get('/D_NewsList/N').success(function(data){$scope.data=data;
        $scope.News = {
            i_Author: userAuth.res.user
        }
    });
    
    $scope.Order = "-v_idNews";
    $scope.ImageClass = $routeParams.id;
    
    $scope.Col = "5";
    $scope.NumItem = "10";
    
    $scope.addNews = function(News){socket.emit('add_News', News)};
    
    $scope.redirect = function(){window.location = "/#Message";};
    $scope.lHeader="News";
    if($routeParams.id)
        {
            $scope.fSearch = $routeParams.id;
        }
    
    socket.on('updNewsList', function(res){
        $scope.data[$scope.data.length] = res;
        //console.log($scope.data);
        //console.log("update newslist");
    });
    
    socket.on('errOrg', function(errName){
        if(errName == "0"){
            $scope.redirect();
        }else if (errName == "1"){
            console.log(errName);
            $scope.errImgType="Filetype not supported, please use a jpg/png/gif or try another image file."
        }
    });   
});

app.controller('data_NewsArticle', function($scope, $http, socket, $routeParams, userAuth){
    $scope.user = userAuth.res.user;
    $scope.AuthTok = userAuth.res.AuthTok;
    if ($scope.user != undefined){
        $scope.Login = $scope.user; 
    }else{
        $scope.Login = "Login";
    }
    
    $scope.Card = function(Card){socket.emit('get_Card', Card); console.log(Card);};
    
    var page = {
        //this tracks that you've entered a new page to better distribute connections and socket data
        pUser: $scope.user,
        pPage: $routeParams.id
    }
    
    $scope.Link = '<iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fcypucode.ngrok.io%2F%23%2FNewsBlog%2F'+$routeParams.id+'&layout=button&size=small&mobile_iframe=true&width=59&height=20&appId" width="59" height="20" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>';
    
    $scope.Idtract = $routeParams.id;
    
    $scope.Linker = "https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fcypucode.ngrok.io%2F%23%2FNewsBlog%2F'+$routeParams.id+'&layout=button&size=small&mobile_iframe=true&width=59&height=20&appId";
    
    socket.emit('page_Access', page);
    $http.get('/D_NewsArticle/'+$routeParams.id).success(function(data){$scope.data=data;
        $scope.tags = data.v_Tags.split(',');                                                                   
    });
    $http.get('/D_NewsArticle/Comment/'+$routeParams.id).success(function(data2){$scope.x=data2.Comments;$scope.s=data2.Comments; $scope.Likes=data2.Likes; /*console.log($scope.Likes);console.log($scope.x)*/});
    $http.get('/D_IsSaved/'+$routeParams.id+'/'+$scope.user).success(function(data3){$scope.q=data3; console.log($scope.q)});
    
    $scope.resetButton = function(){$http.get('/D_IsSaved/'+$routeParams.id+'/'+$scope.user).success(function(data3){$scope.q=data3; console.log($scope.q)});}
    
    $scope.news_error = "";
    
    $scope.addComment = function(nComment){
        nComment.nUser = $scope.user;
        nComment.nArt = $routeParams.id;
        socket.emit('add_Comment', nComment);
        $scope.nComment.Comment = null;
    };
    
    $scope.save_Article = function(){socket.emit('save_Article', page)};
    $scope.delete_Article = function(){socket.emit('delete_Article', page)};
    
    $scope.isLiked = function(dir, article){
        var nLiked = {
            dir: dir,
            article: article,
            user: $scope.user,
            artNum: $routeParams.id
        }
        
        socket.emit('isLiked', nLiked);
        //console.log('isLiked: '+dir+" "+article+" "+$scope.user);
    };
    
    socket.on('RefCom', function(res){
        if(res == $routeParams.id)
        {
            $http.get('/D_NewsArticle/Comment/'+$routeParams.id).success(function(data2){$scope.x=data2.Comments;$scope.s=data2.Comments; $scope.Likes=data2.Likes;});
            console.log("refreshed");
        }
    });
    
    socket.on('updErr', function(res){
        $scope.news_error = res;
    });
    
    socket.on('Bookmarked', function(res){
        $http.get('/D_IsSaved/'+$routeParams.id+'/'+$scope.user).success(function(data3){$scope.q=data3; console.log($scope.q)});
    });
    
   /*socket.on('consolePageTest', function(res){
        console.log(res);
        console.log("activated");
    });*/
});

app.controller('data_Bookmarked', function($scope, $http, socket, $routeParams, userAuth, $location, $cookieStore){   
    $http.get('/D_savedlist/'+userAuth.res.user).success(function(data){$scope.data=data;});
    $scope.lHeader="Saved Article";
    
    $scope.showDelete="1";
    $scope.InboxConv = function(Link, eno){
        if(Link == "#")
            {
                var temp = "/InboxConv";
                $cookieStore.remove("enoBox");
                $cookieStore.put("enoBox", eno);
            }else{
                var temp = Link;
            }        
        $location.path(temp);
        console.log(Link);
    }
    
    var page = {
        //this tracks that you've entered a new page to better distribute connections and socket data
        pUser: userAuth.res.user,
    }
    
    $scope.resetButton = function(){$http.get('/D_savedlist/'+userAuth.res.user).success(function(data){$scope.data=data;})}
    
    $scope.delete_Article = function(inp){page.pPage = inp; socket.emit('delete_Article', page)};
});

app.controller('data_Inbox', function($scope, $http, socket, $routeParams, userAuth, $location, $cookieStore){   
    $http.get('/D_ConvAuthList/'+userAuth.res.user).success(function(data){$scope.x=data;});
    $scope.lHeader="Inbox";
    
    $scope.showDelete="1";
    $scope.InboxConv = function(Link, eno){
        if(Link == "#")
            {
                var temp = "/InboxConv";
                $cookieStore.remove("enoBox");
                $cookieStore.put("enoBox", eno);
            }else{
                var temp = Link;
            }        
        $location.path(temp);
        console.log(Link);
    }
    
    var page = {
        //this tracks that you've entered a new page to better distribute connections and socket data
        pUser: userAuth.res.user,
    }
    
    $scope.resetButton = function(){$http.get('/D_ConvAuthList/'+userAuth.res.user).success(function(data){$scope.x=data;})}
    
    $scope.remove_Inbox = function(inp){page.pPage = inp; socket.emit('remove_Inbox', page)};
});

app.controller('data_InboxConv', function($scope, $http, socket, $routeParams, userAuth, $cookieStore){
    $scope.Logged = userAuth.res.user;
    var enoBox = $cookieStore.get("enoBox");
    
    $http.get('/D_Conv/'+enoBox+'/'+userAuth.res.user).success(function(data){$scope.data=data;});
    
    $http.get('/D_ConvRep/'+enoBox+'/'+userAuth.res.user).success(function(data){$scope.x=data;});
        
    $scope.addComment = function(nComment){
        nComment.nUser = userAuth.res.user;
        nComment.nArt = enoBox;
        socket.emit('add_InbComment', nComment);
        $scope.nComment.Comment = null;
    };
    
    socket.on('RefInbCom', function(res){
        if(res == enoBox)
        {
            $http.get('/D_ConvRep/'+enoBox+'/'+userAuth.res.user).success(function(data){$scope.x=data;});
            //console.log("refreshed");
        }
    });
    
});

app.controller('data_Chat', function($scope, $http, socket){
    //$scope.RoomNames = [];
    $scope.RoomList = [];
    //$scope.Stringer = JSON.stringify($scope.initRoomList);
    
    $scope.get_Chat = function(){
        $scope.initRoom1 = [{RoomName: "Room1", RoomPass: "Public"}];
        $scope.initRoom2 = [{RoomName: "Room2", RoomPass: "Public"}];
        socket.emit("chat_Get_Chat", $scope.initRoom1);
        socket.emit("chat_Get_Chat", $scope.initRoom2);
        console.log("working");
    };
    
    $scope.Login_Chat = function(nNewChat){
        $scope.RoomReq = [{RoomName: nNewChat.rName, RoomPass: nNewChat.rPassword, RoomUser: nNewChat.uName}];
        socket.emit("chat_Get_Chat", $scope.RoomReq);
        console.log("working");
    };
    
    $scope.get_Chat();
    /*$http.get('/RoomReq/'+$scope.Stringer).success(function(data){
        //$scope.x=data;
        $scope.RoomList.push(data[0]);
        $scope.RoomList.push(data[1]);
        $scope.x=$scope.RoomList;
        console.log($scope.RoomList);
    });*/
    
    $scope.sNickname = function(nN, Ro){
        var cUser = {Name: nN, Room: Ro};
        socket.emit('chat_New_User', cUser);
        /*console.log(nN +" "+ rN);*/
    };
    
    $scope.sMessage = function(Mess, Room){
        cMessage = {Mess: Mess, Room: Room};
        socket.emit('chat_New_Message', cMessage);
    };
    
    $scope.sCreate = function(serv){
        socket.emit('chat_Create_Chat', serv);
        console.log("serv "+serv);
    };
    
    socket.on('chat_Cont_Login', function(data){
        $scope.RoomReq = [{RoomName: data.rName, RoomPass: data.rPassword, RoomUser: data.uName}];
        socket.emit("chat_Get_Chat", $scope.RoomReq);
    });
    
    socket.on('chat_Recieve_Chat', function(data){
        /*$scope.x=data;*/
        console.log("preparse"+JSON.stringify(data));
        //data = JSON.parse(data);
        for(i=0;i<data.length;i++){
            data[i].id == $scope.RoomList.length;
            $scope.RoomList.push(data[i]);
        }
        console.log($scope.RoomList);
        $scope.x=$scope.RoomList;
        //console.log("Roomlist: "+$scope.RoomList[0].Users);
        //console.log("data "+data);
    });
    
    socket.on('new_User', function(res){
        console.log("New User: "+res.Name+" has joined "+res.Room);
        for(i = 0; i < $scope.RoomList.length; i++){
            console.log(i);
            console.log(res.Room);
            console.log($scope.RoomList[i].RoomName);
            //Roomlist.message.push someone has joined server. 
            if (res.Room == $scope.RoomList[i].RoomName){
                console.log("Match");
                $scope.RoomList[i].Users.push({id: $scope.RoomList[i].Users.length +1, Name: res.Name});
                //$scope.RoomList[i].Logged = res.Name;
                $scope.x=$scope.RoomList;
                console.log($scope.RoomList[i].Users);
            }
        }
        
    });
    
    socket.on('RoomTaken', function(res){
        console.log("Room Taken, please try a different name or log in");
        //var i = 0;
        $scope.Taken = "That room name is taken, please try again.";
        setTimeout(function (){
            console.log("resetting");
            $scope.Taken = '';
            $scope.$apply();
        }, 3000);
    });
    
    socket.on('remove_User', function(res){
        console.log("Remove User: "+res.Name+" from "+res.Room);
        for(i = 0; i < $scope.RoomList.length; i++){
            console.log(i);
            console.log(res.Room);
            console.log($scope.RoomList[i].RoomName);
            if (res.Room == $scope.RoomList[i].RoomName){
                console.log("Match");
                for(j = 0; j < $scope.RoomList[i].Users.length; j++){
                    if($scope.RoomList[i].Users[j].Name == res.Name){
                        $scope.RoomList[i].Users.splice(j, 1);   
                    }
                }
                $scope.x=$scope.RoomList;
                console.log($scope.RoomList[i].Users);
            }
        }
        
    });
    
    socket.on('Setting UserName', function(res){
        if(res == "F"){
            $scope.Taken2 = "That name is already claimed, please try again.";
            setTimeout(function (){
                console.log("resetting");
                $scope.Taken2 = '';
                $scope.$apply();
            }, 3000);
        }else if(res){
            for(i = 0; i < $scope.RoomList.length; i++){
                if (res.Room == $scope.RoomList[i].RoomName){
                $scope.RoomList[i].Logged = res.Name;
                }
            }
            $scope.Logged = "0";
        } 
        console.log(res);
    });
    
    socket.on('chat_Join_Room', function(res){
        console.log(res);
        console.log("Accessed");
    });
    
    socket.on('New_Message', function(res){
        console.log("accessed");
        for (i = 0; i < $scope.RoomList.length; i++) {
            if(res.Room == $scope.RoomList[i].RoomName){
                var newMessage = {User: res.User, Message: res.Mess};
                $scope.RoomList[i].RoomMessage.push(newMessage); 
                console.log(newMessage);
                console.log(i)
            }else{
                console.log("If statement for New_Message failed");
                console.log(i);
            }
        }
    });
    
   /* socket.on('Entered_Channel', function(res){
        if(res.result == "Taken")
        {
            console.log("Taken");
            $scope.Taken = "That name is already in use.";
        }else if (res.result == "Created_Room"){
            console.log("Created Room");
            $scope.RoomList.push({RoomName: res.room, uName: res.nick});
        }else if (res.result){
            console.log("Success!");
            for (var i in $scope.RoomList){
                if (res.room == $scope.RoomList[i].RoomName){
                    $scope.RoomList[i].uName = res.nick;
                    break;
                }
            }
            console.log($scope.RoomList);
            $scope.RoomNames.push({Room});
        }
    });*/
    
    /*socket.on('RefInbCom', function(res){
        if(res == enoBox)
        {
            $http.get('/D_ConvRep/'+enoBox+'/'+userAuth.res.user).success(function(data){$scope.x=data;});
            //console.log("refreshed");
        }
    });*/
    /*$scope.Logged = "N";*/
    
});

app.controller('data_Canvas', function($scope, $http, socket, Canvas){
    socket.emit("connect_Canvas");
    socket.on('clear_Canvas', function (res){
           $scope.timer = res;
            console.log($scope.timer);
        });
});
