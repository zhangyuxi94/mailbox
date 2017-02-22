/**
 * Created by zhangyuxi on 2017/2/22.
 */
(function(){
    var userdata=[];
    var xhttp=new XMLHttpRequest();
    if(localStorage.getItem("userdata")===null){
        xhttp.onreadystatechange=function(){
            if(xhttp.readyState==4&&xhttp.status==200){
                var userdataString=xhttp.responseText;
                localStorage.setItem("userdata",userdataString);
                userdata=JSON.parse(userdataString);
            }
        };
        xhttp.open("GET","userdata.json",true);
        xhttp.send();
    }else{
        var userdataString=localStorage.getItem("userdata");
        userdata=JSON.parse(userdataString);
    }
    mainControl();
    function mainControl(){
        var app=angular.module("loginApp",["ngRoute"]);
        app.config(function($routeProvider){
            $routeProvider.when("/",{
                templateUrl:"../views/login.html",
                controller:"loginController"
            })
                .when("/profile",{
                    templateUrl:"../views/profile.html",
                    controller:"profileController"
                })
                .when("/inbox",{
                    templateUrl:"../views/messageInbox.html",
                    controller:"messageController"
                })
                .when("/sentmail",{
                    templateUrl:"../views/messageSentMail.html",
                    controller:"messageController"
                })
                .when("/compose",{
                    templateUrl:"../views/messageCompose.html",
                    controller:"messageController"
                })
                .otherwise({
                    redirectTo:"/"
                })
        });
        app.factory("userData",function(){
            return{
                userInfo:userdata
            }
        });
        app.directive("myNavbar",function(){
            return{
                templateUrl:"../views/navTemplate.html"
            }
        });
        app.controller("loginController",loginController);
        app.controller("profileController",profileController);
        app.controller("messageController",messageController);
        function loginController($scope,$location,userData){}
        function profileController($scope,userData,$routeParams){}
        function messageController($scope,userData,$routeParams){}
        function findUserById(userid,userData){
            for(var i=0;i<userData.length;i++){
                if(userData[i].userid===userid){
                    return userData[i];
                }
            }
        }
        function findUserByUsername(username,userData){
            for(var i=0;i<userData.length;i++){
                if(userData[i].username===username){
                    return userData[i];
                }
            }
        }
        function updateLocalstorage(dataObject,lsName){
            var dataStr=JSON.stringify(dataObject);
            localStorage.removeItem(lsName);
            localStorage.setItem(lsName,dataStr);
        }
        function findMailboxByUserid(whichBox,RorS,userData,userid){
            var mailbox=[];
            for(var i=0;i<userData.length;i++){
                // find the sendbox of the sender
                if(whichBox==="sentmail"&&RorS==="S"){
                    for(var j=0;j<userData[i].sentmail.length;j++){
                        if(userData[i].sentmail[j].senderid===userid){
                            mailbox.push(userData[i].sentmail[j]);
                        }
                    }
                }
                // find the receivebox which has the sender's message
                else if(whichBox==="inbox"&&RorS==="S"){
                    for(var j1=0;j1<userData[i].inbox.length;j1++){
                        if(userData[i].inbox[j1].senderid===userid){
                            mailbox.push(userData[i].inbox[j1]);
                        }
                    }
                }
                // find others sendbox which has the sender's mail
                else if(whichBox==="sentmail"&&RorS==="R"){
                    for(var j2=0;j2<userData[i].sentmail.length;j2++){
                        if(userData[i].sentmail[j2].recieverid===userid){
                            console.log(userData[i]);
                            mailbox.push(userData[i].sentmail[j2]);
                        }
                    }
                }
                // find the receivebox of the sender
                else if(whichBox==="inbox"&&RorS==="R"){
                    for(var j3=0;j3<userData[i].inbox.length;j3++){
                        if(userData[i].inbox[j3].recieverid===userid){
                            mailbox.push(userData[i].inbox[j3]);
                        }
                    }
                }
            }
            return mailbox;
        }
    }
})();