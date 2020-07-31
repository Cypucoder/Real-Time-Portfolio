var express = require('express');
var app = express();
var mysql = require('mysql');
var server = require('http').createServer(app);
var io = require ('socket.io')(server);
var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");
var moment = require('moment');
var socket;
var multer  = require('multer');
app.use(bodyParser({uploadDir:'./files/temp'}));
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
//var im = require('imagemagick');
var type = upload.single('file');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');
var lwip = require('lwip');
var async = require('async');

//For loading last canvas
var line_history = [];
//how long is left until canvas resets
var canvasAlert = 5;
var canvasMessage = "Server Just restarted, 5 minutes remaining";
app.post('/upload', type, function (req,res) {
    console.log(req.NName)
  /** When using the "single"
      data come in "req.file" regardless of the attribute "name". **/
  var tmp_path = req.file.path;

  /** The original name of the uploaded file
      stored in the variable "originalname". **/
  var target_path = 'uploads/'+req.NName+'.jpg';

  /** A better way to copy the uploaded file. **/
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  var delTemp = fs.unlink(tmp_path);
  src.pipe(dest);
  src.on('end', function() { console.log("complete"); });
  src.on('error', function(err) { console.log(err); });

});

var userList=[];
var chat_Users = [{Room: "Room1", Users:[{id: -2, Name: "Ben"}, {id: -1, Name: "test"}]},{Room: "Room2", Users:[]}];
var cursors = [];
//var verifyable=[];

//Necessary for email
/*var smtpTransport = nodemailer.createTransport("SMTP",{
host: 'email.clevnet.org',
port: 25,
domain:'clevnet.org',
tls: {ciphers:'SSLv3'}

});*/

var smtpTransport = nodemailer.createTransport("SMTP",{
    host: 'smtp.gmail.com',
    secure: false,
    port: 587,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
    auth: {
        user: 'email',
        pass: 'password'
    }
});

/*var smtpTransport = nodemailer.createTransport("SMTP",{
    host: 'smtp.gmail.com',
    secure: false,
    port: 587,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
    auth: {
        user: 'email',
        pass: 'password'
    }
});*/

//Links mySQL database to the Node server
var db = mysql.createPool({
    host: 'localhost', 
    user: 'admin', 
    password: 'password', 
    database: 'data'
    //port: 3000;
});


server.listen(2450, function(){
    console.log("listening on *:2450");
    db.query("DELETE FROM `data`.`t_RoomUsers`", function(err, rows){if (err) console.log(err);});
});

app.use(express.static('files'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

/*TODO:

    ~FINALIZE: Make sure to update FB link to proper website name
    
    ~FINALIZE: Relink player to proper server
    
    ~TODO: Flesh out Message page
    
    ~TODO: Replace style for boundaries with id/class css
    
    ~TODO: Check update statement and find a way to update comments Username field upon username update, update images as well with new username.
    
    ~TODO: Add [Name Redacted] to user comments of people who have deleted their accounts
    
    ~========Index
    
    ~Dynamic footer: https://codepen.io/corysimmons/pen/DCmtI
    
    ~Alter navbar black on hover to be viewable
    
    ~===================
    
    ~========Email
    
    ~Email users every so often about new Articles per their selections
    
    ~Remind users to verify before logging in via message page
    
    ~===================

    ~=========Social aspect
    
    ~Allow users to unsubscribe/subscribe to replies

    ~Add badge and voting system on users for people to aknowledge their skills
    
    ~Add new notification number/badge to tab when new update to conversation. (based on last login time, update time based on last time checked)
    
    ~Create individual conversation for inbox links
    
    ~Add twitter share
    
    ~Add wait time to uploads/additions to pages. 
    
    ~===================
    
    ~===========Security
    https://blog.risingstack.com/node-js-security-checklist/
    
    ~Find a way to escape news images (just input full link?)
    
    ~Make sure image upload uploads only image
    
    ~Check user and auth before completing server code.
    
    ~Reset AuthTok on action or get new on action
    
    ~Fix crash on no image
    
    ~Sanitize input

    ~=========================
    
    ~===========Animate
    
    ~Add wait time to upload of account (Fix: Instead add a complete animation when done)
        
    ~Animate bookmark icon when saving on newspage (currently just switching)
    
    ~Animate News list Page
    
    ~Create loading icon (probably spinning)
    
    ~=========================
    
    ~===========Admin
    
    ~Add all tags as checkboxes
    
    ~Prevent duplicate news titles
    
    ~=========================
    
    ~Allow portfolio pages to be viewed in the news list/searched for. (or just link to an example page from a news article)
    
    ~Clear user list over time (replace with database that clears over time)    
    
    ~Make inbox links go to conversations
    
    ~Check out Affix and see if it's useful
    
    ~Make sure that nulls in update account don't undo previous information (make sure passwords and email don't get deleted just because they aren't typed) 
    (SELECT user and then replace blank updates with previous info)
    
    ~Organize experience better with collapsables or something
    
    ~https://oodavid.com/article/angularjs-meta-tags-management/
    Check OG tags
    
    ~Check https://mouseflow.com/ for heatmaps on emails and site
    
    ~Check https://docs.angularjs.org/api/ng/service/$http for safety tips on caching
    
    ~http://thejackalofjavascript.com/image-manipulation-node-js/
     https://www.npmjs.com/package/lwip
     http://andyshora.com/angular-image-cropper.html
    
    ~Add tag seperation for images (ie QFX3D or QFXGraphic Design)
    
    ~http://stackabuse.com/securing-your-node-js-app/
    
    https://github.com/punkave/sanitize-html
    
                                                    ====================================Add Portfolio===========================================
    
    1111111111111111111111111111111111111111111111111111111111 Chat Room 111111111111111111111111111111111111111111111111111111
    
        ~add timer that starts when someone starts typing
        
        ~Log chat user sockets to prevent duplicate names
        
        ~show/hide userlist
        
        ~Shorten user names viewable, view full with tool tips
        
        ~Hide userlist as option
    
    2222222222222222222222222222222222222222222222222222222222 Ticket System 222222222222222222222222222222222222222222222222222
    
    3333333333333333333333333333333333333333333333333333333333 Event Calendar 3333333333333333333333333333333333333333333333333
    
    4444444444444444444444444444444444444444444444444444444444 Music Picker 4444444444444444444444444444444444444444444444444444
    +++++++++++++++++++started
    
    https://www.html5rocks.com/en/tutorials/getusermedia/intro/
    
        ~Create custom audio player

        ~Relink player to proper server

        ~Dynamically load audio files (angular)

        ~add compression

        ~add encryption/decryption
        
        ~Switch between file types on server
        
        ~Allow type/bitrate quality switching
        
        ~Buffer/recovery for when stream is lost?
    
    555555555555555555555555555555555555555555555555555555555 Organizer 5555555555555555555555555555555555555555555555555555
    +++++++++++++++++++started
    
    -------------------finished
    
    666666666666666666666666666666666666666666666666666666666 Video Streamer 66666666666666666666666666666666666666666666666666
    +++++++++++++++++++started
    
    https://www.html5rocks.com/en/tutorials/getusermedia/intro/
    
    https://code.tutsplus.com/tutorials/build-a-custom-html5-video-player--pre-8905
    
    https://www.creativebloq.com/html5/build-custom-html5-video-player-9134473
    
    https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Video_and_audio_content
    
    https://developers.google.com/web/fundamentals/media/video
    
    https://blog.alexdevero.com/build-custom-html5-video-player/
        
        ~Grab video list from server
        
        ~Pause video on click
        
        ~Display 10 video list
        
        ~Fix progress bar on mobile
        
        ~add compression
        
        ~add encryption/decryption
        
        ~Switch between file types on server
        
        ~Allow resolution/bitrate quality switching
        
        ~Buffer/recovery for when stream is lost?
        
        ~Fluent FFMPEG implementation
        
        ~FFMPEG 2 pass
        
    77777777777777777777777777777777777777777777777777777777 Sound Chat 777777777777777777777777777777777777777777777777777777
    
    https://www.html5rocks.com/en/tutorials/getusermedia/intro/
    
    88888888888888888888888888888888888888888888888888888888 Archiver 88888888888888888888888888888888888888888888888888888888
    
    99999999999999999999999999999999999999999999999999999999 Timed Upload 9999999999999999999999999999999999999999999999999999
    
    
    1000000000000000000000000000000000000000000000000000000 Canvas 1000000000000000000000000000000000000000000000000000
    +++++++++++++++++++started
    
        ~add circles that follow around the mouse. 
        
        ~load in last bit of picture from last session
        
        ~Generate multiple canvases with room names and passwords
        
        ~make sure full canvas is visible on different screen size
        
        ~Add different colors per user
    
*/

io.on('connection', function(socket){
    console.log('A user connected');
    
    var socketName="";
    socket.sockNumb = uuid.v4();
    console.log(socket.sockNumb);
    
    socket.on('page_Access', function(page){
        console.log(page.pUser+" joined a new page: "+page.pPage);
        socket.join(page.pPage);
        socketName = page.pUser;
    });
    
    socket.on('create_Login', function(nLogin){
        console.log("Creating login");
        //console.log("Username: "+ nLogin.nName + " Pass: "+ nLogin.nPass+ " Email: "+ nLogin.nEmail+ " Bio: "+ nLogin.nBio);
        
        create_Login(nLogin.nFName, nLogin.nLName, nLogin.nPass, nLogin.nEmail, nLogin.nBio, nLogin.nFile, nLogin.nUName, nLogin.nUsType, function(res){
           if(res){
               
               socket.emit('Alert', res);
               /*socket.emit('Login');*/
               socket.emit('NewLogin');
               
           } else{
               io.emit('error');
               console.log('ErrLoc: create_Login Server function');
           }
        });
    });
    
    socket.on('upd_Login', function(nLogin){
        console.log("Updating login");
        //console.log("Username: "+ nLogin.nName + " Pass: "+ nLogin.nPass+ " Email: "+ nLogin.nEmail+ " Bio: "+ nLogin.nBio);
        
        upd_Login(nLogin.nFName, nLogin.nLName, nLogin.nPass, nLogin.nEmail, nLogin.nBio, nLogin.nFile, nLogin.nUName, nLogin.nUsType, function(res){
           if(res){
               
               socket.emit('Alert', res);
               
           } else{
               io.emit('error');
               console.log('ErrLoc: create_Login Server function');
           }
        });
    });
    
    socket.on('new_Inbox', function(NInboxM){
        console.log("New Message");
        //console.log(NInboxM.iMessage);
        
        new_Inbox(NInboxM, function(res){
           if(res){
               socket.emit('MessageComp', res);
               
           } else{
               io.emit('error');
               console.log('ErrLoc: create_Login Server function');
           }
        });
    });
    
    socket.on('remove_Inbox', function(Bookmark){
        console.log(Bookmark.pUser+" article "+ Bookmark.pPage);
        //console.log(NInboxM.iContact+" "+NInboxM.iMessage);
        
        remove_Inbox(Bookmark, function(res){
           if(res){
               
               socket.emit('Inbox thing deleted', res);
               
           } else{
               io.emit('error');
               console.log('ErrLoc: delete_Article Server function');
           }
        });
    });
    
    socket.on('save_Article', function(Bookmark){
        console.log(Bookmark.pUser+" article "+ Bookmark.pPage);
        //console.log(NInboxM.iContact+" "+NInboxM.iMessage);
        
        save_Article(Bookmark, function(res){
           if(res){
               socket.emit('Bookmarked', res);
               
           } else{
               io.emit('error');
               console.log('ErrLoc: save_Article Server function');
           }
        });
    });
    
    socket.on('delete_Article', function(Bookmark){
        console.log(Bookmark.pUser+" article "+ Bookmark.pPage);
        //console.log(NInboxM.iContact+" "+NInboxM.iMessage);
        
        delete_Article(Bookmark, function(res){
           if(res){
               
               socket.emit('Bookmarked', res);
               
           } else{
               io.emit('error');
               console.log('ErrLoc: delete_Article Server function');
           }
        });
    });
    
    socket.on('authenticate_Login', function(uLogin){
        console.log("Logging in");
        //console.log("Username: "+ uLogin.uName + " Pass: "+ uLogin.uPass);
        
        Auth_Login(uLogin.uName, uLogin.uPass, function(res){
            if(res){
                console.log('Auth_Login socket completed');
                socket.emit('AlertLogin', res.Success);
                
                if(res.Success == "1")
                    {
                        socket.emit('LogSuccess', res);
                        userList.push({User: res.userName, sockNumb: res.sockNumb});
                        console.log(userList);
                    }
                
            } else {
                io.emit('error');
                console.log('there was an error under socket.on add_News');
            }
        });
    });
    
    socket.on('auth_newLog', function(AuthLog){
        console.log("Checking Authentication");
        //console.log("Username: "+ uLogin.uName + " Pass: "+ uLogin.uPass);
        //var Obber = {Timer: 40, Verify: LinkGen, User: nEmail};
        /*var checkVer = Arrays.asList(verifyable).contains(AuthLog);*/
        auth_newLog(AuthLog, function(res){
            if(res == "s"){
                console.log("Success");
                console.log(res);
                console.log(AuthLog);
                socket.emit('Login');
            }else{
                console.log("Fail");
                console.log(res);
                console.log(AuthLog);        
            }
        });
        
        
    });

    socket.on('add_News', function(News){
        console.log(News.i_Title, News.i_Author, News.i_Tags, News.i_Info/*, News.nFile*/, News.i_Type);
        console.log("Socket News Starting");
        /*io.emit('add_News', {i_Title: News.i_Title, i_Author: News.i_Author, i_Tags: News.i_Tags, i_Info: News.i_Info, nFile: News.nFile, i_Type: News.i_Type});*/
        

        add_News(News.i_Title, News.i_Author, News.i_Tags, News.i_Info, News.nFile, News.i_Type, function(res){
            if(res){
                if(res == "notgif")
                    {
                        console.log("failres: "+res);
                        io.emit('errOrg', "1");
                    }else{
                        console.log('add_News socket completed');
                        console.log("res:"+res);
                        io.emit('updNewsList', {v_Title: News.i_Title, v_Author: News.i_Author, v_Tags: News.i_Tags, v_Article: News.i_Info, v_Image: "assets/img/News/"+News.i_Title+".jpg", v_Type: News.i_Type, v_idNews: res});
                        io.emit('errOrg', "0");
                    }
            } else {
                io.emit('error');
                console.log('there was an error under socket.on add_News');
            }
        });
    });
    
    socket.on('add_Comment', function(nComment){
        //TODO Update to include checking of AUTHToken
        
        console.log("Adding Comment");
        console.log("Username: "+ nComment.nUser + " Comment: "+ nComment.Comment +" Article #: " +nComment.nArt);
        
        add_Comment(nComment, function(res){
           if(res){
               if(res== "Login"){
                   socket.emit('updErr', "Please login to comment");
               }else{
                   io.emit('RefCom', nComment.nArt);
                   socket.broadcast.to(nComment.nArt).emit('RefCom', nComment.nArt);
                   
                    /* Add Comment
                    var v_Message = nComment.Comment;
                    var v_UserName = nComment.nUser;
                    var v_Article = nComment.nArt;
                    var v_Reply = nComment.v_Reply;
                    var v_OrigComm = nComment.v_OrigComm;

                        Add Inbox
                    var v_Message = NInboxM.iMessage;
                    var v_Author = NInboxM.iUser;
                    var v_Receive = NInboxM.iReceive;
                    var v_Conv = NInboxM.iConv;
                    var v_Link = NInboxM.iLink;*/
                   
                    if(nComment.v_Reply == 1)
                    {
                        var tempMessage = nComment.nUser+" replied to a comment you subscribe to";
                        var tempLink = "/NewsBlog/"+nComment.nArt;
                        db.query("SELECT v_UserName FROM `data`.t_Message WHERE v_OrigComm ='"+nComment.v_OrigComm+"' OR v_idMessage ='"+nComment.v_OrigComm+"'", function(err, rows)
                        {
                            console.log(rows);
                            var tempUserList = [];
                            for (var i = 0; i < rows.length; i++) {
                                if(nComment.nUser != rows[i].v_UserName && tempUserList.indexOf(nComment.nUser) < 0)
                                {
                                    tempUserList[tempUserList.length] = nComment.nUser;
                                    console.log(tempUserList);
                                    var tempArra = {iMessage: tempMessage, iUser: nComment.nUser, iReceive: rows[i].v_UserName, iLink: tempLink}
                                    //console.log("TempArra: "+tempArra);
                                    new_Inbox(tempArra, function(res){
                                       if(res){
                                           socket.emit('MessageComp', res);

                                       } else{
                                           io.emit('error');
                                           console.log('ErrLoc: create_Login Server function');
                                       }
                                    });
                                }
                            }
                        });
                    }
                    
               }
               
           } else{
               io.emit('error');
               console.log('ErrLoc: add_Comment Server function');
           }
        });
    });
    
    socket.on('add_InbComment', function(nComment){
        //TODO Update to include checking of AUTHToken
        
        console.log("Adding Comment");
        console.log("Username: "+ nComment.nUser + " Comment: "+ nComment.Comment +" Inbox #: " +nComment.nArt);
        
        add_InbComment(nComment, function(res){
           if(res){
               if(res== "Login"){
                   socket.emit('updErr', "Please login to reply");
               }else{
                   io.emit('RefInbCom', nComment.nArt);
                   //socket.broadcast.to(nComment.nArt).emit('RefInbCom', nComment.nArt);
                    
               }
               
           } else{
               io.emit('error');
               console.log('ErrLoc: add_InbComment Server function');
           }
        });
    });
    
    socket.on('get_Card', function(Card){
        socket.emit('cardRet', Card);
    });
    
    socket.on('isLiked', function(nLiked){
        
        console.log("Implementing Like");
        
        isLiked(nLiked, function(res){
           if(res){
              
            io.emit('RefCom', nLiked.artNum);
               //console.log(nLiked.artNum);
               
           } else{
               io.emit('error');
               console.log('ErrLoc: isLiked function');
           }
        });
    });
    
    socket.on('forgot_Pass', function(nUser){
        
        console.log("someone forgot their pass");
        
        forgotPass(nUser, function(res){
           if(res == "Success"){
              
            /*io.emit('RefCom', nLiked.artNum);*/
               console.log("completed forgotPass");
               socket.emit('AlertVerify', "1");
               
           }else if(res == "Failed"){
               /*io.emit('error');*/
               console.log("No email found");
               socket.emit('AlertVerify', "2");
           }else{
               /*io.emit('error');*/
               console.log('forgotPass failed');
               socket.emit('AlertVerify', "3");
           }
        });
    });
    
    socket.on('forgot_Verify', function(nUser){
        
        console.log("Verifying password");
        
        forgotVerify(nUser, function(res){
           /*if(res == "Success"){
               console.log("completed forgotPass");
               socket.emit('AlertVerify', "Check your email for your verification code");
               
           }else if(res == "Failed"){
               console.log("No email found");
               socket.emit('AlertVerify', "Email not found");
           }else{
               console.log('forgotPass failed');
               socket.emit('AlertVerify', "Something's not right. Try again in a few minutes");
           }*/
        });
    });
    
/*
    socket.on('set nickname', function (name) {
      socket.nickname = name;
    });
*/

    //disconnects link to server to prevent too many connections to the server
    socket.on('disconnect', function() {
        //Code inserted in here will run on user disconnect.
        /*==========Chat system==================*/
        if (socket.chatName){
            db.query("DELETE FROM `data`.`t_RoomUsers` WHERE v_User = '"+socket.chatName+"' ", function(err, rows){if (err) console.log(err);});    
        }
        
        for (var i in cursors) {
            if (cursors[i].sock == socket.sockNumb){
                cursors.splice(i, 1);
                console.log(cursors);
                io.in("Canvas").emit('update_mouse', cursors);
            }
        }
        
        /*=========================================*/
        console.log('A user has disconnected');
        socket.disconnect();

    });
    
/*=================================================================================================
                                        Chat system
=================================================================================================*/

    socket.on('chat_Get_Chat', function(cRoomList){
        //console.log(cRoomList);
        chat_Get_Chat(cRoomList, function(res){
          if(res == "F"){
              console.log("Failed"); 
              //socket.emit('RoomTaken', "F");   
           }else if(res){
               console.log("Else if res");
               console.log(res);
               console.log(cRoomList[0].RoomName);
               socket.emit('chat_Recieve_Chat', res);
               var clearSpace = cRoomList[0].RoomName.replace(/\s/g, "_");
               console.log("Clear Space access "+clearSpace);
               //socket.join(cRoomList[0].RoomName);
               socket.join(clearSpace);
           }else{
               console.log("Something went wrong under chat_Get_Chat res");
           } /*else if(res == "Failed"){
               console.log("No email found");
               socket.emit('AlertVerify', "Email not found");
           }else{
               console.log('forgotPass failed');
               socket.emit('AlertVerify', "Something's not right. Try again in a few minutes");
           }*/
        });
        // chat_Users = [{Room: "Room1", Users:[]},{Room: "Room2", Users:[]}];
        //change to database based chat system
        /*var roomList= cRoomList;
        var newRoomList = [];
        var updRoomList = JSON.parse(roomList);
        var chat_Users_temp = [];
        var counterCheck = 0;
        async.times(updRoomList.length, function(n, next) {
            var Userlist = [];
            db.query('SELECT v_id, v_RoomCode FROM `data`.t_RoomList WHERE v_RoomName ="'+updRoomList[n].RoomName+'" && v_RoomPass = "'+updRoomList[n].RoomPass+'"', function(err, rows){
                if (err) console.log(err);
                 console.log("1RoomList: "+roomList);
                 console.log("2Room N "+updRoomList[n].RoomName);
                if(rows.length != undefined){
                    async.times(chat_Users.length, function(o, oNext) {
                        console.log("3inner: "+o);
                        //var chat_Users = [{Room: "Room1", Users:[{id: -2, Name: "Ben"}, {id: -1, Name: "test"}]},{Room: "Room2", Users:[]}];
                        if(updRoomList[n].RoomName == chat_Users[o].Room)
                            {
                                console.log("4ROOMUSER: "+updRoomList+" RoomName: "+updRoomList[n].RoomName);
                                console.log("4.5"+socket.chatName);
                                if(socket.chatName != undefined){
                                    console.log("5Socket found");
                                    chat_Users[o].Users.push({id: chat_Users[o].Users.length+1, Name: socket.chatName});
                                    socket.emit('Setting UserName', "S");
                                }else if (updRoomList[n].RoomUser != undefined){
                                    console.log("6RoomUser found "+updRoomList[n].RoomUser);
                                    chat_Users[o].Users.push({id: chat_Users[o].Users.length+1, Name: updRoomList[n].RoomUser});
                                    socket.emit('Setting UserName', "S");
                                }
                                Userlist = chat_Users[o].Users;
                                console.log("7Userlist"+JSON.stringify(Userlist));
                            }
                        console.log("8o = "+o);
                        oNext();
                    }, function(err) {
                        console.log("9Finished");
                    });
                    
                    Userlist.push({"id":"0","Name": updRoomList[n].RoomUser});
                    
                    var Roomid = rows[0].v_id+""+rows[0].v_RoomCode;
                    socket.join(updRoomList[n].RoomName);
                    console.log("10 "+JSON.stringify(Userlist));
                    newRoomList.push({RoomName: updRoomList[n].RoomName, Roomid: Roomid, RoomMessage: [{User: "Admin", Message: "Welcome to the channel!"}], Users: Userlist});
                    
                    socket.emit('chat_Join_Room', "Successapp!!");
                    console.log("11outer "+n);    
                }else{
                    console.log("12Room does not exist");
                    
                }
                next();            
            });

        }, function(err) {
            console.log("13Finished =============================");
            socket.emit('chat_Recieve_Chat', JSON.stringify(newRoomList));
        });

        */
    });
    
    socket.on('chat_Create_Chat', function(cRoomList){
        
        chat_Create_Chat(cRoomList, function(res){
          if(res == "Taken"){
               socket.emit('RoomTaken', "F");   
           }else if(res == "Success"){
               console.log("socket, room created successfully");
               console.log(cRoomList.rName);
               var clearSpace = cRoomList.rName.replace(/\s/g, "_");
               console.log("Clear Space create: "+clearSpace);
               socket.join(clearSpace);
               if(socket.chatName){
                    cRoomList.uName = socket.chatName;
                    socket.emit("chat_Cont_Login", cRoomList);
               }else{
                    socket.emit("chat_Cont_Login", cRoomList);    
               }
               
               //console.log(cRoomList);
               //socket.emit();
           }
        });
        
       /* // chat_Users = [{Room: "Room1", Users:[]},{Room: "Room2", Users:[]}];
        // make sure that code only executes if name available. 
        // match username to make sure it can be used
        //var roomList= cRoomList;
        console.log(cRoomList.rName);
        console.log(cRoomList.rPassword);
        console.log(cRoomList.uName);
        console.log(cRoomList.lMessage);
        console.log(cRoomList);
        if(cRoomList.rName == undefined){
            console.log("Please enter room name");
        }
        
        if(cRoomList.rPassword == undefined){
            console.log("Please enter Password");
        }
        
        if(cRoomList.uName == undefined){
            console.log("Please enter UserName");
        }
        
        if(cRoomList.lMessage == undefined){
            console.log("Please enter Login Message");
        }
        
        if(cRoomList == undefined){
            console.log("Please enter all information");
        }
        var newRoomList = [];
        var rName = cRoomList.rName;
        var rPassword = cRoomList.rPassword;
        var uName = cRoomList.uName;
        var lMessage = cRoomList.lMessage;
        var authe = [rName, rPassword];
        var auth = [rName];
        if(cRoomList.rName != undefined && cRoomList.rPassword != undefined && cRoomList.uName != undefined && cRoomList.lMessage != undefined){
            console.log("cRoomList: "+cRoomList+" "+rName+" "+rPassword+" "+uName+" "+lMessage+" ");
        
            if(socket.chatName != undefined){
                var Userlist = [{id: -1, Name: socket.chatName}];
            }else if(uName != undefined){
                var Userlist = [{id: -1, Name: uName}];    
            }else{
                console.log("failed to find a user name");
            }


            db.query('SELECT v_RoomName FROM `data`.t_RoomList WHERE v_RoomName = ?', auth, function(err, rows){
                if (err) console.log(err);
                if(rows.length == 0 && rows != undefined){
                    db.query('INSERT INTO `data`.`t_RoomList` (`v_RoomName`, `v_RoomPass`) VALUES (?, ?)', authe, function(err, rows2){
                        if (err){
                            console.log(err);  
                        }else{
                            console.log("Finished success!");
                            socket.chatName = rName;
                            console.log("Set Chat Name to: "+socket.chatName);
                            socket.emit('Setting UserName', "S");
                            newRoomList.push({RoomName: rName, RoomMessage: [{User: uName, Message: lMessage}], Users: Userlist});
                            chat_Users.push({Room: rName, Users:[{id: -1, Name: uName}]});
                            socket.join(rName);
                            console.log(newRoomList);
                            socket.emit('chat_Recieve_Chat', JSON.stringify(newRoomList));
                        }             
                    });    
                }else{
                    console.log("Room already taken");
                    socket.emit('RoomTaken',"F");
                }
            });
        }
        
        */
    });
    
    socket.on('chat_New_User', function(cUser){
       /* if(!cUser.pass){var pass= "No Password"}else{var pass=cUser.pass};
        console.log(cUser.nick+" has requested room:"+cUser.room+" with pass: "+pass);*/
        if (cUser.Name == "Clear"){
            cUser.Name = socket.chatName;
            console.log("Accessed");
            console.log(cUser.Name);
        }
        chat_New_User(cUser, function(res){
            if(res == "F"){
                console.log("Name Already in use");
                socket.emit('Setting UserName', "F");   
            }else{
                socket.chatName = res.User;
                var resFill = {Room: res.Room, Name: res.User};
                socket.emit("Setting UserName", resFill);
                var clearSpace = res.Room.replace(/\s/g, "_");
                console.log("Clear Space message: "+clearSpace);
                io.in(clearSpace).emit('new_User', resFill);
                console.log("Added user: "+res.User+" to room: "+res.Room);
            }
        });
        /*
        console.log("Set Chat Name to: "+socket.chatName);
        socket.emit('Setting UserName', "S");
        chat_Users[0].Users.push({id: chat_Users[0].Users.length, Name: cUser});
        chat_Users[1].Users.push({id: chat_Users[1].Users.length, Name: cUser});
        console.log(chat_Users);
        io.in(chat_Users[0].Room).emit('new_User', {Room: chat_Users[0].Room, id: chat_Users[0].Users.length, Name: socket.chatName});
        io.in(chat_Users[1].Room).emit('new_User', {Room: chat_Users[1].Room, id: chat_Users[1].Users.length, Name: socket.chatName});*/
        
    });
    
    
    
    socket.on('chat_New_Message', function(cMessage){
        console.log("User: "+ socket.chatName +" Message: "+cMessage.Mess+" Room: "+ cMessage.Room);
        cMessage.User = socket.chatName;
        var clearSpace = cMessage.Room.replace(/\s/g, "_");
        console.log("Clear Space message: "+clearSpace);
        io.in(clearSpace).emit('New_Message', cMessage);
        var auth = [cMessage.User, cMessage.Mess, cMessage.Room];
        db.query('INSERT INTO `data`.`t_RoomMessage` (`v_User`, `v_Message`, `v_Room`) VALUES (?, ?, ?)', auth, function(err, rows){
            if (err) console.log(err);
        });
        
    });
    
/*=================================================================================================
                                        Canvas Demo
=================================================================================================*/
//Previous lines created. Will eventually be cleared every 10 minutes for server stability
    

//sends newly connnected socket canvas
    socket.on('connect_Canvas', function(){
        console.log("User connected to canvas playroom");
        socket.join("Canvas");
        socket.emit('clear_Canvas', canvasMessage);
        
        cursors.push({x:-100,y:-100,color: "#fff", sock: socket.sockNumb});
        //console.log("line_History "+line_history);
        for (var i in line_history) {
            socket.emit('draw_line', { line: line_history[i] } );
        }  
    });

   // add handler for message type "draw_line".
    socket.on('draw_line', function (data) {
        // add received line to history 
        line_history.push(data.line);
        // send line to room
        io.in("Canvas").emit('draw_line', { line: data.line });
    });
    /*var test = 0;*/
    // add handler for message type "draw_line".
    socket.on('cursor_Move', function (data) {
        data.sock = socket.sockNumb;
        /*console.log("Socket: "+data.socket);*/
        for (var i in cursors) {
            if (cursors[i].sock == data.sock){
                cursors[i] = data;
                /*console.log("JSON.toString(data.sock)");*/
            }
            /*console.log("Run "+i);
            console.log(data.sock);
            console.log(cursors[i].sock);*/
        }
        /*console.log("Finished Run"+test);*/
        /*test++;*/
        io.in("Canvas").emit('update_mouse', cursors);
    });
    
/*    socket.on('oOBounds', function () {
        for (var i in cursors) {
            if (cursors[i].sock == socket.sockNumb){
                cursors.splice(i, 1);
                console.log(cursors);
                io.in("Canvas").emit('update_mouse', cursors);
            }
        }
    });*/
    
});
/*===============================App Get=======================================*/
/*===============================App Get=======================================*/
/*===============================App Get=======================================*/

//In this version of app.get, the '/' sets the home page when you enter the page. 
app.get('/', function(req, res){
    res.sendFile(__dirname + '/files/index.html');
});

//app.get is used to return data based on what your hyperlink. 
//in the case of '/DB' we are returning the database information
app.get('/Data', function(req, res){
   /* db.query('SELECT * FROM eventcal.events', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
    });*/
});

app.get('/CardViewer/:Card', function(req, res){
    db.query('SELECT * FROM `data`.t_Users WHERE v_UserName = "'+req.params.Card+'"', function(err, rows)
                     {
        if (err) console.log(err);
        if(rows != undefined){
            res.send(JSON.stringify(rows[0]));    
        }
    });
});

app.get('/UpAcc/:User', function(req, res){
    db.query('SELECT v_Email, v_UserName, v_First, v_Last, v_Bio, v_UsTitle FROM `data`.t_Users WHERE v_UserName = "'+req.params.User+'"', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows[0]));
    });
});

app.get('/GHome', function(req, res){
    db.query('SELECT * FROM `data`.t_Misc', function(err, rows)
                     {
        if (err) console.log(err);
        /*if(rows.length == undefined || rows.length == 0)
            {
                rows[0].v_id = 0;
                rows[0].v_GraphDes = 0;
                rows[0].v_Digital = 0;
                rows[0].v_Chaos = 0;
                rows[0].v_Spacial = 0;
                rows[0].v_ThreeDee = 0;
                rows[0].v_Sketches = 0;
            }*/
        
        res.send(JSON.stringify(rows[0]));
    });
});

app.get('/GImages', function(req, res){
    db.query('SELECT v_idNews, v_Tags, v_Image FROM `data`.t_News WHERE v_Type = "I"', function(err, rows)
             {
                if (err) console.log(err);
                
                var sh = "assets/img/";
                var output = {Graphic: sh+"minibus.jpeg", Digital: sh+"loft.jpg", Chaos: sh+"desk.jpg", Spacial: sh+"building.jpg", ThreeD: sh+"minibus.jpeg",  Sketches: sh+"minibus.jpeg"};
                var stoptimize = {Graphic: 0, Digital: 0, Chaos: 0, Spacial: 0, ThreeD: 0, Sketches: 0};
                var equilibrium = {Graphic: 1, Digital: 1, Chaos: 1, Spacial: 1, ThreeD: 1, Sketches: 1};
                var merg = {Img: output, Link: stoptimize};        
        
                if(rows.length != undefined && rows.length != 0)
                    {                        
                        //console.log(rows);

                        function f_groupExists(group) {
                            
                            var GT = group.v_Tags;
                            var GI = group.v_Image;
                            var outI = output.Img;
                            var outL = output.Link;

                            if(GT.match(/Graphic Design/g)){
                                console.log("Graphic Design found");
                                output.Graphic = GI;
                                stoptimize.Graphic = 1;
                            } else if(GT.match(/Digital/g)){
                                console.log("Digital found");
                                output.Digital = GI;
                                stoptimize.Digital = 1;
                            }else if(GT.match(/Chaos Gen/g)){
                                console.log("Chaos Gen found");
                                output.Chaos = GI;
                                stoptimize.Chaos = 1;
                            }else if(GT.match(/Spacial Gen/g)){
                                console.log("Spacial Gen found");
                                output.Spacial = GI;
                                stoptimize.Spacial = 1;
                            }else if(GT.match(/3D/g)){
                                console.log("3D found");
                                output.ThreeD = GI;;
                                stoptimize.ThreeD = 1;
                            }else if(GT.match(/Sketches/g) || GT.match(/Preview/g)){
                                console.log("Sketches found");
                                output.Sketches = GI;
                                stoptimize.Sketches = 1;
                            }else{
                                console.log("Tag not found");
                            }
                        }

                        for (i = 0; i < rows.length && stoptimize != equilibrium; i++) {
                            f_groupExists(rows[i]);
                        }

                        console.log("Output: "+merg);
                        res.send(JSON.stringify(merg));
                    }else{
                        console.log("No images found");
                        res.send(JSON.stringify(merg));
                    }

    });
    
    /*db.query('SELECT v_idNews, v_Image, v_Tags FROM `data`.t_News WHERE v_Type = "I"', function(err, rows)
                     {
        if (err) console.log(err);
        
        res.send(JSON.stringify(rows));
    });*/
});

app.get('/D_NewsList/:Type', function(req, res){
    db.query('SELECT * FROM `data`.t_News WHERE v_Type = "'+req.params.Type+'"', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
    });
});

app.get('/D_SavedList/:id', function(req, res){
    db.query('SELECT * FROM t_News LEFT JOIN t_SavedList ON t_News.v_idNews = t_SavedList.v_Article WHERE t_SavedList.v_User ="'+req.params.id+'"', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows));
    });
});

app.get('/D_NewsArticle/:id', function(req, res){
    db.query('SELECT * FROM `data`.t_News WHERE v_idNews = "'+req.params.id+'"', function(err, rows)
                     {
        if (err) console.log(err);
        res.send(JSON.stringify(rows[0]));
    });
});

app.get('/D_NewsArticle/Comment/:id', function(req, res){
    db.query('SELECT * FROM `data`.t_Message WHERE v_Article = "'+req.params.id+'"', function(err, rows)
             {
        if (err) console.log(err);
        
        db.query('SELECT v_UserName, v_isLiked, v_idMessage FROM `data`.t_Liked WHERE v_idArt = "'+req.params.id+'"', function(err, rows2)
             {
                if (err) console.log(err);
                //console.log(rows);
                var condenser = {Comments:rows, Likes: rows2};
                res.send(JSON.stringify(condenser));
        });
    });
});

app.get('/D_ConvAuthList/:id', function(req, res){
    db.query('SELECT * FROM `data`.t_InboxConv WHERE v_Receive ="'+req.params.id+'"', function(err, rows)
             {
        if (err) console.log(err);
        /*console.log(rows)*/
        res.send(JSON.stringify(rows));
    });
});

app.get('/D_Conv/:id/:Auth', function(req, res){
    db.query('SELECT * FROM `data`.t_InboxConv WHERE v_idMessage ="'+req.params.id+'" AND (v_Author ="'+req.params.Auth+'" OR v_Receive ="'+req.params.Auth+'")', function(err, rows)
             {
        if (err) console.log(err);
        console.log(rows);
        res.send(JSON.stringify(rows[0]));
    });
});

app.get('/D_ConvRep/:id/:Auth', function(req, res){
    db.query('SELECT * FROM `data`.t_Inbox WHERE v_Conversation ="'+req.params.id+'"', function(err, rows)
             {
        if (err) console.log(err);
        console.log(rows);
        res.send(JSON.stringify(rows));
    });
});

app.get('/D_IsSaved/:id/:User', function(req, res){
    db.query('SELECT * FROM t_SavedList WHERE t_SavedList.v_User ="'+req.params.User+'" && t_SavedList.v_Article ="'+req.params.id+'"', function(err, rows)
                     {
        if (err) console.log(err);
            var ret;
        if (rows.length != 0)
            {
                ret = "1";
            }else{
                ret = "0";
            }
        res.send(JSON.stringify({resu:ret}));
    });
});

app.get('/video/:id', function(req, res){
    /*const src = fs.createReadStream('./files/assets/vid/Test.mp4');
    src.pipe(res);*/
    
    var path = './files/assets/vid/'+req.params.id;
    var stat = fs.statSync(path);
    var total = stat.size;
    if (req.headers['range']) {
        var range = req.headers.range;
        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

        var file = fs.createReadStream(path, {start: start, end: end});
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        file.pipe(res);
    } else {
        console.log('ALL: ' + total);
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        fs.createReadStream(path).pipe(res);
    }
});

app.get('/audio', function(req, res){
    /*const src = fs.createReadStream("./files/assets/audio/Phonat-It'sForYou.mp3");
    src.pipe(res);*/
    
    
    var path = "./files/assets/audio/Phonat Mix Fall 2011.mp3";
    var stat = fs.statSync(path);
    var total = stat.size;
    if (req.headers['range']) {
        var range = req.headers.range;
        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

        var file = fs.createReadStream(path, {start: start, end: end});
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'audio/mp3' });
        file.pipe(res);
    } else {
        console.log('ALL: ' + total);
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mp3' });
        fs.createReadStream(path).pipe(res);
    }
});

/*app.get('/GalleryImg', function(req, res){
    
});*/


/*===============================Node Intervals=======================================*/
var interval = setInterval(function() {
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the Authenticate clear loop section');
            connection.release();
            callback(false);
            return;
        }
        
        connection.query("SELECT * FROM `data`.t_Authenticate WHERE v_Expiry >= DATE_SUB(NOW(), INTERVAL 1 HOUR)", function(err, rows){
            if(!err) {
                /*console.log(rows.length);*/
                if(rows.length != undefined && rows.length != 0){
                    //console.log("Length: "+rows.length);
                    var counter = 0;
                    for (var i = 0; i <= rows.length; i++){
                        //console.log(rows[i]);                        
                       //console.log("/*================InnerLoop"+i+"==========================*/"); 
                        connection.query("SELECT v_UserName FROM `data`.`t_Users` WHERE v_Verified = '"+rows[i].v_Verify+"' ", function(err, rows2){
                            if(err) {
                                console.log(err);
                            }
                             //console.log("rows2 "+rows2);
                            if(rows2.length != undefined && rows.length != 0 && rows[i].v_Version == "New"){
                                fs.unlink('./files/assets/img/User/'+rows2[0].v_UserName+'.jpg', function(error) {
                                    if (error) {
                                        console.log("User image not found, should be good though");
                                    }
                                    console.log('Deleted unverified user: '+rows2[0].v_UserName);
                                });
                            }
                        });
                        
                        if(rows[i].v_Version == "New")
                            {
                                connection.query("DELETE FROM `data`.`t_Users` WHERE v_Verified = '"+rows[i].v_Verify+"' ", function(err, rows){
                                    if(err) {
                                        console.log(err);
                                    }
                                });
                            }                        
                            
                        connection.query("DELETE FROM `data`.`t_Authenticate` WHERE v_Verify = '"+rows[i].v_Verify+"' ", function(err, rows){
                            if(err) {
                                console.log(err);
                            }
                        });
                        counter++;
                        //console.log("/*================InnerLoop "+i+" end==========================*/");
                        if(i == rows.length - 1){
                            break;
                        }
                    }
                    
                    console.log(counter+" unverified accounts deleted");
                    //console.log(rows);
                }   
            }
        });
        connection.release();
           
    });    
     /*console.log("running");*/
}, 1000 * 60 * 60); //1000 * 60 * 60 * 24

var interval2 = setInterval(function() {
    
    if(canvasAlert !=0){
        canvasMessage = "Canvas will clear in "+canvasAlert+" minutes";
        canvasAlert--;
    }else{
        canvasMessage = "Times up!";
        canvasAlert = 5;
        line_history = [];
    }
    /*io.in("Canvas").emit('draw_line', { line: data.line });*/
    io.sockets.in("Canvas").emit('clear_Canvas', canvasMessage);
}, 1000 * 60 * 1); //1000 * 60 * 60 * 24
/*===============================Node Functions=======================================*/
/*===============================Node Functions=======================================*/
var Auth_Login = function(uName, uPass, callback){
        //http://stackoverflow.com/questions/21123586/return-node-js-mysql-results-to-a-function 
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the Login section');
            connection.release();
            callback(false);
            return;
        }
        
        if (uName == undefined && uPass == undefined)
            {
                callback("Please enter your email and a password");
                connection.release();
                return;
            }
        
        if (uName == undefined || uName == "")
            {
                callback("Please enter an email");
                connection.release();
                return;
            }
        
        if (uPass == undefined || uPass == "")
            {
                callback("Please enter Password");
                connection.release();
                return;
            }
        
        //var hash = bcrypt.hashSync(uPass, 10);
        
        //var post = [uName, uPass, uName, uPass];
        var post = [uName, uName];
        
    /*connection.query("SELECT * FROM `data`.t_Users WHERE BINARY (v_UserName=? AND v_Pass=?) OR (v_Email=? AND v_Pass=?)", post, function(err, rows, fields){*/
        
    connection.query("SELECT * FROM `data`.t_Users WHERE BINARY ((v_UserName=? OR v_Email=?) && v_Verified = 'Trul')", post, function(err, rows, fields){
        if (err){
            console.log(err);
            callback(false);
            connection.release();
            return;
        }
        
        var tempCount = 0;
        
        for (var i = 0; i < rows.length; i++) {
            var check = bcrypt.compareSync(uPass, rows[i].v_Pass);
            console.log("check: "+check);
            if(check == true){
                tempCount += 1;
            }
        }
        
        console.log(tempCount);
     
        if (tempCount != 0){
            console.log('Login found ('+rows[0].v_UserName+'), Login aknowledged.');
            //Displays message "Login already exists"
            var newRand = uuid.v4();
            callback({Success: "1", userName: rows[0].v_UserName, sockNumb: newRand});
            
        }else if (tempCount == undefined){
            console.log('Rows undefined');
            callback({Success: "2"});
            
        }else if (tempCount == 0){
            console.log('0 Matches found. User not recognized');
            callback({Success: "3"});
        }
    });
        connection.release();
    });
}

var create_Login = function(nFName, nLName, nPass, nEmail, nBio, nFile, nUName, nUsType,  callback){
        //http://stackoverflow.com/questions/21123586/return-node-js-mysql-results-to-a-function 
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the Login section');
            connection.release();
            callback(false);
            return;
        }
        
        if((nFile.length / 1.3347268976) > 2733520.7)
            {
                console.log("File too large: "+ nFile.length+ " Needs to be under: 2733520.7");
                connection.release();
                return;
            }else{
                console.log("All good! Image size: "+ (nFile.length/1.3347268976))
            }
        
        if (nEmail == undefined && nPass == undefined)
            {
                callback("Please enter your Email and a Password");
                
                return;
            }
        
        if (nPass == undefined)
            {
                callback("Please enter a Password");
                connection.release();
                return;
            }
        
        if (nEmail == undefined)
            {
                callback("Please enter an Email");
                connection.release();
                return;
            }
        
        if (nFile == undefined)
            {
                callback("You'll need to upload an image to continue");
                connection.release();
                return;
            }else if((nFile.length / 1.3347268976) > 2733520.7){
                console.log("File too large: "+ nFile.length+ " Needs to be under: 2733520.7");
                return;
           }else{
            console.log("All good! Image size: "+ (nFile.length/1.3347268976))
           }
        
        if (nFName == undefined)
            {
                callback("Please enter First Name");
                connection.release();
                return;
            }
        
        if (nLName == undefined)
            {
                callback("Please enter Last Name");
                connection.release();
                return;
            }
        
        if (nUName == undefined)
            {
                callback("Please enter a User Name");
                connection.release();
                return;
            }
    
        var UsType;
        if (nUsType == undefined)
            {
              UsType = "User";  
            }else{
                
                if(nUsType == 1)
                   {
                       UsType = "User";
                   }else if(nUsType == 2)
                   {
                       UsType = "Artist";
                   }else if(nUsType == 3)
                   {
                       UsType = "Programmer";
                   }else if(nUsType == 4)
                   {
                       UsType = "Web Designer";
                   }else if(nUsType == 5)
                   {
                       UsType = "Game Designer";
                   }else if(nUsType == 6)
                   {
                       UsType = "Marketer";
                   }else if(nUsType == 7)
                   {
                       UsType = "Developer";
                   }else if(nUsType == 8)
                   {
                       UsType = "Internet Technician";
                   }else if(nUsType == 9)
                   {
                       UsType = "Graphic Designer";
                   }else if(nUsType == 10)
                   {
                       UsType = "Polymath";
                   }else{
                       UsType = "Glitched";
                   }
            }
        
        var nName = nFName+" "+nLName;
        
    var post = [nUName, nEmail];
        
    connection.query("SELECT * FROM `data`.t_Users WHERE BINARY v_UserName= ? OR v_Email= ?", post, function(err, rows, fields){
        if (err){
            console.log(err);
            callback(false);
            connection.release();
            return;
        }
        
        var hash = bcrypt.hashSync(nPass, 10);
     
        if (rows.length == undefined){
            
            console.log('Server may be undergoing Maintenance. Please try again later');
            callback("Server may be undergoing Maintenance. Please try again later");
            return;
            
        }else if (rows.length != 0){
            
            console.log('Login or email already exists');
            //Displays message "Login already exists"
            callback("Login or email already exists");
            return;
            
        }else if (rows.length == 0){
            console.log('0 Matches found. Creating Login');
            /*callback("Login available!");*/
            
            var LinkGen = uuid.v4();
            var post = [nFName, nLName, hash, nEmail, nUName, nBio, UsType, LinkGen];
            
            
            
            connection.query("INSERT INTO `data`.`t_Users` (`v_First`, `v_Last`, `v_Pass`, `v_Email`, `v_UserName`, `v_Bio`, `v_Joined`, `v_UsTitle`, `v_Verified`) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)", post, function(err, rows, fields){
                if (err){
                    console.log(err);
                    callback(false);
                    connection.release();
                    return;
                }
                if (!err){
                    console.log("new user: "+nName+" "+nEmail);
                    
                    var data = nFile;
                    //console.log(nFile);

                    function decodeBase64Image(dataString) {
                      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                        response = {};

                      if (matches.length !== 3) {
                        return new Error('Invalid input string');
                      }

                      response.type = matches[1];
                      response.data = new Buffer(matches[2], 'base64');

                      return response;
                    }

                    var imageBuffer = decodeBase64Image(data);
                    //console.log(imageBuffer);
                    // { type: 'image/jpeg',
                    //   data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 b4 00 00 00 2b 08 06 00 00 00 d1 fd a2 a4 00 00 00 04 67 41 4d 41 00 00 af c8 37 05 8a e9 00 00 ...> }

                    fs.writeFile('files/assets/img/User/'+nUName+'.jpg', imageBuffer.data, function(err) {});
                    callback("Account created successfully.");
                    
                    
                    console.log(LinkGen);
                    var authen = [LinkGen, nUName, "New"];
                    
                    connection.query("INSERT INTO `data`.`t_Authenticate` (`v_Verify`, `v_Expiry`,`v_User`, `v_Version`) VALUES (?, NOW(), ?, ?)", authen, function(err, rows, fields){
                        if (err){
                            console.log(err);
                            callback(false);
                            //connection.release();
                            return;
                        }
                        if (!err){
                            //var Obber = {Timer: 40, Verify: LinkGen, User: nEmail};
                            //verifyable.push(Obber);
                            //console.log("Verifyable: "+verifyable);
                            console.log("User"+userList);
                            /*================Mail==========================*/
                             console.log('Emailed to: '+ nEmail);
                                var mailOptions={
                                to : 'New Registration <'+ nEmail +'>',
                                subject :'Cypu Verify',
                                html :
                                    'Thank you for signing up with us. Just one more step! Please go to https://cypucode.ngrok.io/#/verify/i/d/2/'+LinkGen+'. This link will expire in 1 hour.',
                                from: 'NoReply <email@email.com>'
                                }

                                    console.log(mailOptions);
                                smtpTransport.sendMail(mailOptions, function(error, response){
                                if(error){
                                console.log(error);

                                }else{
                                console.log("Message sent: " + response.message);
                                }
                                });
                            /*==============================================*/

                            /*================Mail==========================*/
                             /*console.log('Emailed to: '+ nEmail);
                                var mailOptions={
                                to : 'New Registration <'+ nEmail +'>',
                                subject :'Welcome to StealthPunk',
                                html :
                                    'Thank you for signing up with us. You can now use the forum and more!',
                                from: 'Patron <email@email.com>'
                                }

                                    console.log(mailOptions);
                                smtpTransport.sendMail(mailOptions, function(error, response){
                                if(error){
                                console.log(error);

                                }else{
                                console.log("Message sent: " + response.message);
                                }
                                });*/
                            /*==============================================*/
                        }
                    });
                }
                
            });
        }
    });
    
        connection.release();
    });
}

var upd_Login = function(nFName, nLName, nPass, nEmail, nBio, nFile, nUName, nUsType, callback){
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the updLogin section');
            connection.release();
            callback(false);
            return;
        }
        /*console.log(nFName);
        console.log(nLName);
        console.log(nPass);
        console.log(nEmail);
        console.log(nBio);
        console.log(nFile);
        console.log(nUName);
        console.log(nUsType);*/
        
        /*if((nFile.length / 1.3347268976) > 2733520.7)
            {
                console.log("File too large: "+ nFile.length+ " Needs to be under: 2733520.7");
                connection.release();
                return;
            }else{
                console.log("All good! Image size: "+ (nFile.length/1.3347268976))
            }*/
        
        /*if (nEmail == undefined && nPass == undefined)
            {
                callback("Please enter your Email and a Password");
                
                return;
            }*/
        
        
        if (nEmail == undefined)
            {
                callback("Please enter an Email");
                connection.release();
                return;
            }
        
        
        if (nFName == undefined)
            {
                callback("Please enter First Name");
                connection.release();
                return;
            }
        
        if (nLName == undefined)
            {
                callback("Please enter Last Name");
                connection.release();
                return;
            }
        
        if (nUName == undefined)
            {
                callback("Please enter a User Name");
                connection.release();
                return;
            }
    
        var UsType;
        if (nUsType == undefined)
            {
              UsType = "User";  
            }else{
                
                if(nUsType == 1)
                   {
                       UsType = "User";
                   }else if(nUsType == 2)
                   {
                       UsType = "Artist";
                   }else if(nUsType == 3)
                   {
                       UsType = "Programmer";
                   }else if(nUsType == 4)
                   {
                       UsType = "Web Designer";
                   }else if(nUsType == 5)
                   {
                       UsType = "Game Designer";
                   }else if(nUsType == 6)
                   {
                       UsType = "Marketer";
                   }else if(nUsType == 7)
                   {
                       UsType = "Developer";
                   }else if(nUsType == 8)
                   {
                       UsType = "Internet Technician";
                   }else if(nUsType == 9)
                   {
                       UsType = "Graphic Designer";
                   }else if(nUsType == 10)
                   {
                       UsType = "Polymath";
                   }else{
                       UsType = "Glitched";
                   }
            }
        
        var nName = nFName+" "+nLName;
        
        //console.log('0 Matches found. Updating Login');
        /*callback("Login available!");*/
        
        var post = [nFName, nLName, nEmail, nBio, UsType, nUName];

        connection.query("UPDATE `data`.`t_Users` SET `v_First` = ?, `v_Last` = ?, `v_Email` = ?, `v_Bio` = ?, `v_UsTitle` = ? WHERE v_UserName = ?", post, function(err, rows, fields){
            if (err){
                console.log(err);
                callback(false);
                //connection.release();
                return;
            }
            if (!err){
                console.log("new user: "+nName+" "+nEmail);
                
                   if (nFile == undefined)
                   {

                   }else if((nFile.length / 1.3347268976) > 2733520.7){
                        console.log("File too large: "+ nFile.length+ " Needs to be under: 2733520.7");
                        return;
                   }else{
                       if(nFile.match(/.\/assets\/img\/User/g)) 
                        {

                        }else{
                            console.log("Updating image")
                            var data = nFile;
                            //console.log(nFile);

                            function decodeBase64Image(dataString) {
                                var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                                response = {};

                                if (matches.length !== 3) {
                                    return new Error('Invalid input string');
                                }

                                response.type = matches[1];
                                response.data = new Buffer(matches[2], 'base64');

                                return response;
                            }

                            var imageBuffer = decodeBase64Image(data);
                            //console.log(imageBuffer);
                            // { type: 'image/jpeg',
                            //   data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 b4 00 00 00 2b 08 06 00 00 00 d1 fd a2 a4 00 00 00 04 67 41 4d 41 00 00 af c8 37 05 8a e9 00 00 ...> }21xd 

                            fs.writeFile('files/assets/img/User/'+nUName+'.jpg', imageBuffer.data, function(err) {});
                        }
                   }
                
                if (nPass == undefined)
                {

                }else{
                    var hash = bcrypt.hashSync(nPass, 10);
                    var post = [hash, nUName];
                    connection.query("UPDATE `data`.`t_Users` SET `v_Pass` = ? WHERE v_UserName = ?", post, function(err, rows, fields){
                        if (err){
                            console.log(err);
                            callback(false);
                            //connection.release();
                            return;
                        }
                        if (!err){
                            console.log("Password updated");



                        }
                    });
                }
                callback("Account updated successfully. Refresh the page for changes to take effect");
            }
        });
    
        connection.release();
    });
}

var add_Comment = function(nComment, callback){

    var v_Message = nComment.Comment;
    var v_UserName = nComment.nUser;
    var v_Article = nComment.nArt;
    var v_Reply = nComment.v_Reply;
    var v_OrigComm = nComment.v_OrigComm;
    
    /*console.log(nComment.Comment);
    console.log(nComment.nUser);
    console.log(nComment.nArt);*/
    console.log(v_Reply+" "+v_OrigComm);
    
    if (v_Message == "" || v_Message == undefined)
        {
            return;
        }

    if (v_OrigComm == "" || v_OrigComm == undefined)
        {
            v_OrigComm = "0";
        }
    
    if (v_Reply == "" || v_Reply == undefined)
        {
            v_Reply = "0";
        }
    
    //var upMessage = v_Message.match(/@\w+/g);
    var upMessage = v_Message.replace(/(@)(\w+)/g, '<span ng-click="Card(\'$2\')"><a>$1$2</a></span>');/*function(match){
        console.log(match);
        return '<span ng-click="Card('+match+')"><a>'+match+'</a></span>';
    });*/
    console.log("UpMessage: "+upMessage)
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the add_Comment section');
            connection.release();
            callback(false);
            return;
        }
        
        if (v_UserName == undefined || v_UserName == "")
            {
                callback("Login");
                connection.release();
                return;
            }

        var post = [upMessage, v_UserName, v_Article, v_Reply, v_OrigComm];
        
        //console.log(post);
        
        connection.query("INSERT INTO `data`.`t_Message` (`v_Message`, `v_CreatedOn`, `v_UserName`, `v_Article`, `v_Reply`, `v_OrigComm`) VALUES (?, v_CreatedOn = NOW(), ?, ?, ?, ?);", post, function(err, rows){
                if(!err) {
                    console.log(v_UserName+" commented on article: "+v_Article);
                    callback(true);
                }else{
                    console.log(err);
                }
        });    
        
        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
}

var add_InbComment = function(nComment, callback){

    var v_Message = nComment.Comment;
    var v_UserName = nComment.nUser;
    var v_Article = nComment.nArt;
    //var v_Reply = nComment.v_Reply;
    //var v_OrigComm = nComment.v_OrigComm;
    
    /*console.log(nComment.Comment);
    console.log(nComment.nUser);
    console.log(nComment.nArt);*/
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the add_Comment section');
            connection.release();
            callback(false);
            return;
        }
        
        if (v_UserName == undefined || v_UserName == "")
            {
                callback("Login");
                connection.release();
                return;
            }
        
        var post = [v_Message, v_UserName, v_Article];

        connection.query("INSERT INTO `data`.`t_Inbox` (`v_Message`, `v_CreatedOn`, `v_Author`, `v_Conversation`) VALUES (?, NOW(), ?, ?);", post, function(err, rows){
                if(!err) {
                    console.log(v_UserName+" added to Conversation: "+v_Article);
                    callback(true);
                }else{
                    console.log(err);
                }
        });    
        
        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
}

var save_Article = function(Bookmark, callback){

    var v_User = Bookmark.pUser;
    var v_Article = Bookmark.pPage;
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the save_Article section');
            connection.release();
            callback(false);
            return;
        }

        var post = [v_User, v_Article];
        
        connection.query("INSERT INTO `data`.`t_SavedList` (`v_User`, `v_Article`) VALUES (?, ?);", post, function(err, rows){
                if(!err) {
                    console.log(v_User+" saved an article: "+v_Article);
                    callback(true);
                }else{
                    console.log(err);
                }
        });    
        
        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
}

var delete_Article = function(Bookmark, callback){

    var v_User = Bookmark.pUser;
    var v_Article = Bookmark.pPage;
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the delete_Article section');
            connection.release();
            callback(false);
            return;
        }
        
        var post = [v_User, v_Article];

        connection.query("DELETE FROM `data`.`t_SavedList` WHERE v_User=? AND v_Article=?", post, function(err, rows){
                if(!err) {
                    console.log(v_User+" deleted a saved article: "+v_Article);
                    callback(true);
                }else{
                    console.log(err);
                }
        });    
        
        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
}

var remove_Inbox = function(Bookmark, callback){

    var v_User = Bookmark.pUser;
    var v_Article = Bookmark.pPage;
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the delete_Article section');
            connection.release();
            callback(false);
            return;
        }

        var post = [v_User, v_Article];
        
        connection.query("DELETE FROM `data`.`t_InboxConv` WHERE v_Receive=? AND v_idMessage=?", post, function(err, rows){
                if(!err) {
                    console.log(v_User+" deleted an Inbox article: "+v_Article);
                    callback(true);
                }else{
                    console.log(err);
                }
        });    
        
        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
}

var new_Inbox = function(NInboxM, callback){
    
    //var v_Contact = NInboxM.iContact;
    var v_Message = NInboxM.iMessage;
    var v_Author = NInboxM.iUser;
    var v_Receive = NInboxM.iReceive;
    var v_Conv = NInboxM.iConv;
    var v_Link = NInboxM.iLink;
    
    console.log("Message: "+v_Message+" Author: "+v_Author+" Recieve: "+v_Receive+" Conversation: "+v_Conv+" Link: "+v_Link);
    
    //If v_Conv is not undefined, create a comment in t_Inbox. If v_Conv is undefined, create a new t_InboxConv. If generated from a comment, create a new linked thing for the email to link to the article. 
    
    /*console.log(nComment.Comment);
    console.log(nComment.nUser);
    console.log(nComment.nArt);*/
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the new_Inbox section');
            connection.release();
            callback(false);
            return;
        }
        
       /* if (v_Contact == undefined || v_Contact == "")
            {
                callback("Please put in preferred method of contact");
                connection.release();
                return;
            }*/
        
        if (v_Message == undefined || v_Message == "")
            {
                callback("Please type a message");
                connection.release();
                return;
            }
        
        if (v_Link == undefined || v_Link == "")
            {
                //Create a link to a message modal
                vLink = "";
            }
        
        if (v_Receive == "QFE")
            {
                //Default to Admin
                v_Receive = "JaxPandora";
            }
        
        if (v_Author == undefined || v_Author == "")
            {
                callback("Please log in");
                connection.release();
                return;
            }
        
        
        
        if(v_Conv == undefined || v_Conv == "")
            {
                
                var post = [v_Message, v_Author, v_Receive, v_Link];
                //Create a new Link to a reply or a new message
                connection.query("INSERT INTO `data`.`t_InboxConv` (`v_Message`, `v_CreatedOn`, `v_Author`, `v_Receive`, `v_Link`) VALUES (?, NOW(), ?, ?, ?);", post, function(err, rows){
                    if(!err) {
                        //console.log(v_UserName+" commented on article: "+v_Article);
                        callback(true);
                    }else{
                        console.log(err);
                    }
                });    

                connection.once('error', function(err) {
                    console.log("insert issue found");
                    callback(false);
                    connection.release();
                    return;
                });
                
            }else{
                
                var post = [v_Message, v_Author, v_Conv];
                
                connection.query("INSERT INTO `data`.`t_Inbox` (`v_Message`, `v_CreatedOn`, `v_Author`, `v_Conversation`) VALUES (?, NOW(), ?, ?)", post, function(err, rows){
                    if(!err) {
                        //console.log(v_UserName+" commented on article: "+v_Article);
                        callback(true);
                    }else{
                        console.log(err);
                    }
                });    
        
                connection.once('error', function(err) {
                    console.log("insert issue found");
                    callback(false);
                    connection.release();
                    return;
                });
            }

        
        connection.release();
        return;
    });
}

var add_News = function (i_Title, i_Author, i_Tags, i_Info, nFile, i_Type, callback){
    
    
    if (nFile == undefined)
        {
            callback("You'll need to upload an image to continue");
            connection.release();
            return;
        }else if((nFile.length / 1.3347268976) > 2733520.7){
            console.log("File too large: "+ nFile.length+ " Needs to be under: 2733520.7");
            return;
       }else{
        console.log("All good! Image size: "+ (nFile.length/1.3347268976))
       }
    
    if(i_Tags.match(/Graphic Design/g))
        {
            var CountGD = "1";
        } else{
            var CountGD = "0";
        }
    
    if(i_Tags.match(/Digital/g))
        {
            var CountD = "1";
        }else{
            var CountD = "0";
        }
    
    if(i_Tags.match(/Chaos Gen/g))
        {
            var CountCG = "1";
        }else{
            var CountCG = "0";
        }
    
    if(i_Tags.match(/Spacial Gen/g)) 
        {
            var CountSG = "1";
        }else{
            var CountSG = "0";
        }
    
    if(i_Tags.match(/3D/g))
        {
            var Count3D = "1";
        }else{
            var Count3D = "0";
        }
    
    if(i_Tags.match(/Sketches/g) || i_Tags.match(/Preview/g))
        {
            var CountS = "1";
        }else{
            var CountS = "0";
        }
    
    if(i_Tags.match(/Completed Systems/g))
        {
            var CountComS = "1";
        }else{
            var CountComS = "0";
        }
    
    if(i_Tags.match(/Just Demos/g))
        {
            var CountJD = "1";
        }else{
            var CountJD = "0";
        }
    
    if(i_Tags.match(/Angular/g) || i_Tags.match(/Css/g) || i_Tags.match(/Bootstrap/g))
        {
            var CountAng = "1";
        }else{
            var CountAng = "0";
        }
    
    if(i_Tags.match(/NodeJS/g))
        {
            var CountNode = "1";
        }else{
            var CountNode = "0";
        }
    
    if(i_Tags.match(/Html/g) || i_Tags.match(/Css/g) || i_Tags.match(/Bootstrap/g))
        {
            var CountHtml = "1";
        }else{
            var CountHtml = "0";
        }
    
    if(i_Tags.match(/Android/g))
        {
            var CountAndr = "1";
        }else{
            var CountAndr = "0";
        }
    
    if(i_Tags.match(/PHP/g) || i_Tags.match(/Socket/g))
        {
            var CountPHP = "1";
        }else{
            var CountPHP = "0";
        }
    
    if(i_Tags.match(/MySQL/g))
        {
            var CountMyS = "1";
        }else{
            var CountMyS = "0";
        }
    
    if(i_Tags.match(/UE4/g))
        {
            var CountUE4 = "1";
        }else{
            var CountUE4 = "0";
        }
    
    if(i_Tags.match(/Nvidia/g) || i_Tags.match(/Physx/g))
        {
            var CountNvi = "1";
        }else{
            var CountNvi = "0";
        }
    
    if(i_Tags.match(/Blender/g))
        {
            var CountBlen = "1";
        }else{
            var CountBlen = "0";
        }
    
    if(i_Tags.match(/Substance Designer/g))
        {
            var CountSDes = "1";
        }else{
            var CountSDes = "0";
        }
    
    if(i_Tags.match(/Substance Painter/g))
        {
            var CountSPaint = "1";
        }else{
            var CountSPaint = "0";
        }
    
    var artiNum;
    
    var data = nFile;
    
    
    
    //console.log(nFile);

    function decodeBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
    }

    var imageBuffer = decodeBase64Image(data);
    
    
    //console.log(imageBuffer);
    // { type: 'image/jpeg',
    //   data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 b4 00 00 00 2b 08 06 00 00 00 d1 fd a2 a4 00 00 00 04 67 41 4d 41 00 00 af c8 37 05 8a e9 00 00 ...> }
    /*var path = require('path');
    var extN = path.extname(data);
    var baseN = path.basename(data);
    console.log(extN);
    console.log(basen);*/
   
    fs.writeFile('files/assets/img/News/'+i_Title+'.jpg', imageBuffer.data, function(err) {});
    //fs.writeFile("files/assets/img/News/Text.txt", nFile,function(err){});
  
    /*fs.readFile('files/assets/img/News/'+i_Title+'.jpg', function(err, buffer) {
        //thumbnail
        lwip.open(buffer, 'jpg', function(err, image) {
            if (err) throw err;
            
            image.resize(200, 100, function(err, rzdImg) {
                rzdImg.writeFile('files/assets/img/Thumb/News/'+i_Title+'.jpg', function(err) {
                    if (err) throw err;
                });
            });
      });
    });*/
    
    lwip.open('files/assets/img/News/'+i_Title+'.jpg', 'jpg', function(err, image) {
        /*if (err) throw err;*/
        if (err){
            console.log("not jpg");
            lwip.open('files/assets/img/News/'+i_Title+'.jpg', 'png', function(err, image) {
                if (err){
                    console.log("not png");
                    lwip.open('files/assets/img/News/'+i_Title+'.jpg', 'gif', function(err, image) {
                        if (err){
                            console.log("not gif");
                            console.log("failed");
                            callback("notgif");
                            return;
                        }else{resizeIt(image);};
                    });   
                    
                }else{resizeIt(image);};
            });
        }else{resizeIt(image);}
    });
    
    function resizeIt(image) { 
        image.resize(200, 100, function(err, rzdImg) {
            rzdImg.writeFile('files/assets/img/Thumb/News/'+i_Title+'.jpg', function(err) {
                if (err) throw err;
            });
        });
    }
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the add_News section');
            connection.release();
            callback(false);
            return;
        }
        console.log("Commencing data entry");
        
        var post = [i_Title, i_Author, i_Info, i_Tags, i_Type];
                
        connection.query("INSERT INTO `data`.`t_News` (`v_Title`, `v_Author`, `v_Image`, `v_Article`, `v_Tags`, `v_CTime`,`v_Type`) VALUES (?, ?, 'assets/img/News/"+i_Title+".jpg', ?, ?, NOW(),?)", post, function(err, rows){
            if(!err) {
                console.log("Added news");
                artiNum = rows.insertId;
                console.log(artiNum);
                callback(artiNum);
            }
        });
        
        
        connection.query("SELECT * FROM `data`.t_Misc", function(err, rows){
            if(!err) {
                console.log("Check misc");
                console.log(rows);
                if(rows.length=="0")
                {
                    var newGD = 0 + parseInt(CountGD);
                    var newD = 0 + parseInt(CountD);
                    var newCG = 0 + parseInt(CountCG);
                    var newSG = 0 + parseInt(CountSG);
                    var new3D = 0 + parseInt(Count3D);
                    var newS = 0 + parseInt(CountS);
                    var newComS = 0 + parseInt(CountComS);
                    var newJD = 0 + parseInt(CountJD);
                    var newAng = 0 + parseInt(CountAng);
                    var newNode = 0 + parseInt(CountNode);
                    var newHtml = 0 + parseInt(CountHtml);
                    var newAndr = 0 + parseInt(CountAndr);
                    var newPHP = 0 + parseInt(CountPHP);
                    var newMyS = 0 + parseInt(CountMyS);
                    var newUE4 = 0 + parseInt(CountUE4);
                    var newNvi = 0 + parseInt(CountNvi);
                    var newBlen = 0 + parseInt(CountBlen);
                    var newSDes = 0 + parseInt(CountSDes);
                    var newSPaint = 0 + parseInt(CountSPaint);
                    
                    console.log("No results found, adding new misc.");
                    
                    var post = [newGD, newD, newCG, newSG, new3D, newS, newComS, newJD, newAng, newNode, newHtml, newAndr, newPHP, newMyS, newUE4, newNvi, newBlen, newSDes, newSPaint]
                    
                    connection.query("INSERT INTO `data`.`t_Misc` SET `v_id`='1', `v_GraphDes`=?, `v_Digital`=?, `v_Chaos`=?, `v_Spacial`=?, `v_ThreeDee`=?, `v_Sketches`=?, `v_ComplSys`=?, `v_JDemo`=?, `v_Angu`=?, `v_Node`=?, `v_Htm`=?, `v_Andr`=?, `v_PHPSc`=?, `v_MyS`=?, `v_UEFour`=?, `v_NviPhys`=?, `v_Blender`=?, `v_SubDes`=?, `v_SubPaint`=?", post, function(err, rows){
                        if(!err) {
                            console.log("Create misc");
                            //callback(true);
                        }
                    });
                }else{
                    var newGD = parseInt(rows[0].v_GraphDes) + parseInt(CountGD);
                    var newD = parseInt(rows[0].v_Digital) + parseInt(CountD);
                    var newCG = parseInt(rows[0].v_Chaos) + parseInt(CountCG);
                    var newSG = parseInt(rows[0].v_Spacial) + parseInt(CountSG);
                    var new3D = parseInt(rows[0].v_ThreeDee) + parseInt(Count3D);
                    var newS = parseInt(rows[0].v_Sketches) + parseInt(CountS);
                    var newComS = parseInt(rows[0].v_ComplSys) + parseInt(CountComS);
                    var newJD = parseInt(rows[0].v_JDemo) + parseInt(CountJD);
                    var newAng = parseInt(rows[0].v_Angu) + parseInt(CountAng);
                    var newNode = parseInt(rows[0].v_Node) + parseInt(CountNode);
                    var newHtml = parseInt(rows[0].v_Htm) + parseInt(CountHtml);
                    var newAndr = parseInt(rows[0].v_Andr) + parseInt(CountAndr);
                    var newPHP = parseInt(rows[0].v_PHPSc) + parseInt(CountPHP);
                    var newMyS = parseInt(rows[0].v_MyS) + parseInt(CountMyS);
                    var newUE4 = parseInt(rows[0].v_UEFour) + parseInt(CountUE4);
                    var newNvi = parseInt(rows[0].v_NviPhys) + parseInt(CountNvi);
                    var newBlen = parseInt(rows[0].v_Blender) + parseInt(CountBlen);
                    var newSDes = parseInt(rows[0].v_SubDes) + parseInt(CountSDes);
                    var newSPaint = parseInt(rows[0].v_SubPaint) + parseInt(CountSPaint);
                    
                    console.log("Starting update query");
                    
                    var post = [newGD, newD, newCG, newSG, new3D, newS, newComS, newJD, newAng, newNode, newHtml, newAndr, newPHP, newMyS, newUE4, newNvi, newBlen, newSDes, newSPaint];
                   
                    connection.query("UPDATE `data`.`t_Misc` SET `v_GraphDes`='?', `v_Digital`='?', `v_Chaos`='?', `v_Spacial`='?', `v_ThreeDee`='?', `v_Sketches`='?', `v_ComplSys`='?', `v_JDemo`='?', `v_Angu`='?', `v_Node`='?', `v_Htm`='?', `v_Andr`='?', `v_PHPSc`='?', `v_MyS`='?', `v_UEFour`='?', `v_NviPhys`='?', `v_Blender`='?', `v_SubDes`='?', `v_SubPaint`='?' WHERE `v_id`='1'", post, function(err, rows){
                        if(!err) {
                            console.log("Update misc");
                            //callback(true);
                        }
                    });
                }
                console.log(newGD);
                console.log(newD);
                console.log(newCG);
                console.log(newSG);
                console.log(new3D);
                console.log(newS);
                console.log(newS);
                console.log(newComS);
                console.log(newJD);
                console.log(newAng);
                console.log(newNode);
                console.log(newHtml);
                console.log(newAndr);
                console.log(newPHP);
                console.log(newMyS);
                console.log(newUE4);
                console.log(newNvi);
                console.log(newBlen);
                console.log(newSDes);
                console.log(newSPaint);
                
                //callback(true);
            }
        });
        
        
        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
    /*console.log("Finished tasks");*/
};

var auth_newLog = function (AuthCheck, callback){
    
    if (AuthCheck == undefined || AuthCheck == "")
        {
            callback("No Auth");
            return;
        }
    
    var AuthProtect = [AuthCheck];
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the auth_newLog section');
            connection.release();
            callback(false);
            return;
        }

        connection.query("SELECT v_User FROM `data`.t_Authenticate WHERE v_Verify = ?", AuthProtect, function(err, rows){
                if(!err && rows.length != undefined) {

                    /*var uNa = [rows[0].v_User];
                    console.log(uNa);*/
                    connection.query("UPDATE `data`.`t_Users` SET `v_Verified` = 'Trul'  WHERE v_Verified = ?", AuthProtect, function(err, rows){
                        if(!err) {
                             //DELETE FROM tutorials_tbl WHERE tutorial_id=3
                            connection.query("DELETE FROM `data`.`t_Authenticate` WHERE v_Verify = ?", AuthProtect, function(err, rows){
                                if(!err) {
                                    callback("s");
                                }else if (err){
                                    console.log("Failed to delete");
                                    console.log(AuthProtect);
                                    //console.log(err);
                                }
                            });                       
                        }else{
                            console.log("No Authentication found");
                            callback("NoAuthFound");
                            //console.log(err);
                        }
                    });

                }else{
                    console.log("No Authentication found");
                    callback("FailNoLog");
                    //console.log(err);
                }
            });        

            connection.once('error', function(err) {
                console.log("insert issue found");
                callback(false);
                connection.release();
                return;
            });

            connection.release();
            return;
        });
    /*console.log("Finished tasks");*/
};

var isLiked = function (nLiked, callback){
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the isLiked section');
            connection.release();
            callback(false);
            return;
        }
        
        var likeProtectA = [nLiked.article, nLiked.user, nLiked.artNum];
        var likeProtectB = [nLiked.artNum];
        //var likeProtectB = [nLiked.dir, nLiked.article, nLiked.user];
        console.log(nLiked.dir+" "+nLiked.article+" "+nLiked.user);
        
        if (nLiked.dir == "+")
        {
            var Direction = "1";  
        }else if (nLiked.dir == "-"){
            var Direction = "2"
        }else{
            var Direction = "0";
        }
        
        if (nLiked.user != undefined)
            {
                connection.query("SELECT v_idLiked FROM `data`.`t_Liked` WHERE `v_idMessage` = ? && `v_UserName` = ?", likeProtectA, function(err, rows){
                    if(!err && rows.length != undefined && rows.length != 0) {

                        console.log("Like found, updating");
                        connection.query("UPDATE `data`.`t_Liked` SET `v_isLiked` = '"+Direction+"'  WHERE v_idLiked ='"+rows[0].v_idLiked+"'", likeProtectA, function(err, rows){
                            if(!err) {
                                callback(true);               
                            }else{
                                console.log("Like Update failed");
                                /*callback("NoAuthFound");*/
                                console.log(err);
                            }
                        });

                    }else{
                        console.log("Like not found, creating");
                        console.log(rows);
                        connection.query("INSERT INTO `data`.`t_Liked` SET `v_isLiked` = '"+Direction+"', `v_idMessage` = ?, `v_UserName` = ?, `v_idArt` = ?", likeProtectA, function(err, rows){
                            if(!err) {
                                callback(true);              
                            }else{
                                console.log("Like Insert failed");
                                /*callback("NoAuthFound");*/
                                console.log(err);
                            }
                        });
                    }
                });
            }
        
                

            connection.once('error', function(err) {
                console.log("insert issue found");
                callback(false);
                connection.release();
                return;
            });

            connection.release();
            return;
        });
    /*console.log("Finished tasks");*/
};



var forgotPass = function(nUser, callback){
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the forgotPass db section');
            connection.release();
            callback(false);
            return;
        }
        
        /*if (nUser == undefined || nUser == "")
            {
                callback("Login");
                connection.release();
                return;
            }*/
        
        function getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }
        
        var LinkGen = getRandomInt(100000, 999999);

        var uName = [nUser.uName, nUser.uName];
        
        //console.log(post);
        
        connection.query("SELECT v_Email FROM `data`.`t_Users` WHERE `v_Email` = ? OR `v_UserName` = ? LIMIT 1", uName, function(err, rows){
                if(!err) {
                    if(rows.length != 0)
                        {
                            var authen = [LinkGen, rows[0].v_Email, "Forget"];
                            connection.query("INSERT INTO `data`.`t_Authenticate` (`v_Verify`, `v_Expiry`,`v_User`, `v_Version`) VALUES (?, NOW(), ?, ?)", authen, function(err, rows, fields){
                                if (err){
                                    console.log(err);
                                    callback(false);
                                    //connection.release();
                                    return;
                                }
                            });
                            
                            /*================Mail==========================*/
                                  console.log('Emailed to: '+ rows[0].v_Email);
                                  var mailOptions={
                                    to : 'Verifcation attempt <'+ rows[0].v_Email +'>',
                                    subject :'Cypu Verify',
                                    html :'Someone is trying to reset your password. If this is you, please enter this code: <h2>'+LinkGen+'</h2> into the box shown. Otherwise ignore this email. This verification code will expire in 1 hour.',
                                    from: 'NoReply <email@email.com>'
                                  }

                                  console.log(mailOptions);
                                  smtpTransport.sendMail(mailOptions, function(error, response){
                                      if(error){
                                        console.log(error);

                                      }else{
                                        console.log("Message sent: " + response.message);
                                      }
                                  });
                            /*==============================================*/
                            
                            /*connection.query("")*/
                            callback("Success");        
                        }else{
                            console.log("Failed");
                            callback("Failed");    
                        }
                    
                }else{
                    console.log(err);
                    callback(false);
                }
        });    
        
        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
}

var forgotVerify = function(nUser, callback){
    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue in the forgotPass db section');
            connection.release();
            callback(false);
            return;
        }
        
        /*if (nUser == undefined || nUser == "")
            {
                callback("Login");
                connection.release();
                return;
            }*/
        
        var nCode = [nUser.Code];
        
        //console.log(post);
        
        connection.query("SELECT v_User, v_Verify FROM `data`.`t_Authenticate` WHERE `v_Verify` = ? AND `v_Version` = 'Forget'", nCode, function(err, rows){
                if(!err) {
                    //console.log(rows);
                    //console.log(nCode[0]);
                    if(rows.length != 0)
                        {
                            var hash = bcrypt.hashSync(nCode[0], 10);
                            var authen = [hash, rows[0].v_User];
                            console.log("Updating: "+ rows[0].v_User);
                            connection.query("UPDATE `data`.`t_Users` SET `v_Pass`= ? WHERE `v_Email`= ?", authen, function(err, rows, fields){
                                if (err){
                                    console.log(err);
                                    callback(false);
                                    //connection.release();
                                    return;
                                }
                            });
                            var ema = [rows[0].v_User, rows[0].v_User]
                            
                            connection.query("SELECT v_Email FROM `data`.`t_Users` WHERE `v_Email` = ? LIMIT 1", ema, function(err, rows2){
                                if(!err) {
                                    //console.log(rows);
                                    //console.log(nCode[0]);
                                    if(rows2.length != 0)
                                        {
                                            /*================Mail==========================*/
                                                  console.log('Emailed to: '+ rows2[0].v_Email);
                                                  var mailOptions={
                                                    to : 'Updated <'+ rows2[0].v_Email +'>',
                                                    subject :'Cypu Password Updated',
                                                    html :'Someone has recently reset your password. If you believe this was in error, please respond to this email. Until changed, your password will be the last verification code sent to you. If you believe that you recieved this message in error, please disregard.',
                                                    from: 'NoReply <email@email.com>'
                                                  }

                                                  console.log(mailOptions);
                                                  smtpTransport.sendMail(mailOptions, function(error, response){
                                                      if(error){
                                                        console.log(error);

                                                      }else{
                                                        console.log("Message sent: " + response.message);
                                                      }
                                                  });
                                            /*==============================================*/
                                        }
                                }
                            })
                            
                            /*connection.query("")*/
                            callback("Success");        
                        }else{
                            console.log("Failed");
                            callback("Failed");    
                        }
                    
                }else{
                    console.log(err);
                    callback(false);
                }
        });    
        
        connection.once('error', function(err) {
            console.log("issue found in fogot_Verify");
            callback(false);
            connection.release();
            return;
        });
        
        connection.release();
        return;
    });
}

/*=================================================================================================
                                        Chat system
=================================================================================================*/
var chat_Create_Chat = function (cRoomList, callback){    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue connecting to the db in chat_Create_Chat');
            connection.release();
            callback(false);
            return;
        }
        var rName= cRoomList.rName;
        var rPassword= cRoomList.rPassword;
        var uName= cRoomList.uName;
        var lMessage= cRoomList.lMessage;
        var Sel1 = [rName, rPassword];
        var Ins1 = [rName, rPassword, uName, lMessage]
        
        connection.query("SELECT v_RoomName FROM `data`.`t_RoomList` WHERE `v_RoomName` = ? && `v_RoomPass` = ?", Sel1, function(err, rows){
            if(!err && rows.length != undefined && rows.length != 0) {
                console.log("Name Taken");
                callback("Taken");
            }else{
                console.log("Name Available, creating");
                connection.query("INSERT INTO `data`.`t_RoomList` (`v_RoomName`, `v_RoomPass`,`v_Admin`, `v_RoomMessage`) VALUES (?, ?, ?, ?)", Ins1, function(err, rows, fields){
                    if (err){
                        console.log(err);
                        callback(false);
                        //connection.release();
                        return;
                    }else{
                        console.log("Room Created successfully");
                        callback("Success");
                    }
                });
            }
        });
        
                

        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });

        connection.release();
        return;
    });
};

var chat_Get_Chat = function (cRoomList, callback){    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue connecting to the db in chat_Get_Chat');
            connection.release();
            callback(false);
            return;
        }
        console.log("1");
        //{RoomName: "Room2", RoomPass: "Public", RoomUser: nNewChat.uName}
        //console.log(cRoomList.length);
        var output = [];
        var RUsers = [];
        async.times(cRoomList.length, function(n, next) {
            console.log("2");
            var rName = cRoomList[n].RoomName;
            var rPassword = cRoomList[n].RoomPass;
            var rUser = cRoomList[n].RoomUser;
            var Sel1 = [rName, rPassword];
            //var Ins1 = [rName, rPassword, uName, lMessage]
            connection.query("SELECT v_RoomName, v_Admin, v_RoomMessage FROM `data`.`t_RoomList` WHERE `v_RoomName` = ? && `v_RoomPass` = ?", Sel1, function(err, rows){
                console.log("3");
                //console.log("rows: "+JSON.stringify(rows));
                if(!err && rows.length != undefined && rows.length != 0) {
                    console.log("4");
                    connection.query("SELECT v_User FROM `data`.`t_RoomUsers` WHERE `v_Room` = '"+rows[0].v_RoomName+"'", function(err, rows2){
                        console.log("5");
                        //console.log("Rows2 room: "+rows[0].v_RoomName+" returns: "+JSON.stringify(rows2));
                        var Messages = [{User:"*Admin* "+rows[0].v_Admin, Message:rows[0].v_RoomMessage}];
                        connection.query("SELECT v_User, v_Message FROM `data`.`t_RoomMessage` WHERE `v_Room` = ? ORDER BY -v_idRoomMessage LIMIT 5", Sel1, function(err, rows3){
                            console.log("6");
                            //console.log(rows3);
                                async.times(rows3.length, function(i, iNext) {
                                    console.log("7");
                                    Messages.unshift({User:rows3[i].v_User, Message:rows3[i].v_Message});
                                    //console.log("Messages "+Messages);
                                    iNext();
                                }, function(err) {
                                    console.log("8");
                                    if(!err && rows2.length != 0) {
                                        console.log("9");
                                        async.times(rows2.length, function(o, oNext) {
                                            console.log("10");
                                                RUsers.push({id: o, Name: rows2[o].v_User});
                                                oNext();
                                        }, function(err) {
                                            if(RUsers != []){
                                                console.log("11");
                                                //console.log(RUsers);
                                                output.push({id: output.length, RoomName:rows[0].v_RoomName, RoomMessage: Messages, Users: RUsers});
                                                //console.log("Output: "+output);
                                                next();
                                            }                
                                        });
                                    }else{
                                        console.log("12");
                                        output.push({id: output.length, RoomName:rows[0].v_RoomName, RoomMessage: Messages, Users: []});
                                        next();
                                    }
                                });
                        });
                    });
                    //console.log("Requesting: "+rows[0].v_RoomName);
                    //console.log(rows);
                    //console.log(output);
                }else{
                    console.log("13");
                    //console.log("Room Doesn't exist");
                    next();
                }
                
            });
        }, function(err) {
            console.log("14");
            //console.log("9Finished");
            //console.log("Output"+JSON.stringify(output));
            if(output.length != 0 && output.length != undefined){
                console.log("15");
                //console.log("Output: "+ output);
                callback(output);
            }
            //callback("test");
        });
        console.log("16");
        
                

        connection.once('error', function(err) {
            console.log("insert issue found");
            callback(false);
            connection.release();
            return;
        });

        connection.release();
        return;
    });
};

var chat_New_User = function (cUser, callback){    
    db.getConnection(function(err, connection){
        if(err){
            console.log('there was an issue connecting to the db in chat_New_User');
            connection.release();
            callback(false);
            return;
        }
        var nName = cUser.Name;
        var nRoom = cUser.Room;
        var Sel1 = [nName, nRoom];
        
        connection.query("SELECT v_User FROM `data`.`t_RoomUsers` WHERE `v_User` = ? && `v_Room` = ?", Sel1, function(err, rows){
            if(!err && rows.length != undefined && rows.length != 0) {
                console.log("Name is already taken");
                callback("F");
            }else{
                connection.query("INSERT INTO `data`.`t_RoomUsers` (`v_User`, `v_Room`) VALUES (?, ?)", Sel1, function(err, rows, fields){
                    if (err){
                        console.log(err);
                        callback(false);
                        //connection.release();
                        return;
                    }else{
                        console.log("User:"+Sel1[0]+" added to: "+Sel1[1]);
                        callback({Room: Sel1[1], User: Sel1[0]});
                        //console.log("Set Chat Name to: "+socket.chatName);
                        /*socket.emit('Setting UserName', "S");
                        chat_Users[0].Users.push({id: chat_Users[0].Users.length, Name: cUser});
                        chat_Users[1].Users.push({id: chat_Users[1].Users.length, Name: cUser});
                        console.log(chat_Users);
                        io.in(chat_Users[0].Room).emit('new_User', {Room: chat_Users[0].Room, id: chat_Users[0].Users.length, Name: socket.chatName});
                        io.in(chat_Users[1].Room).emit('new_User', {Room: chat_Users[1].Room, id: chat_Users[1].Users.length, Name: socket.chatName});*/
                    }
                });
                
            }
        });
    });
};