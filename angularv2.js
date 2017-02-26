/**
 * Created by zhangyuxi on 2017/2/22.
 */
(function(){
    var userdata=[];
    var currentUser=null;
    var currentMsg=null;
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
                .when("/view",{
                    templateUrl:"../views/messageView.html",
                    controller:"viewMsgController"
                })
                .otherwise({
                    redirectTo:"/"
                })
        });
        app.factory("userData",function($location){
            return{
                userInfo:userdata,
                currentUser:currentUser,
                currentMsg:currentMsg,
                logout:function(){
                    // currentUser=undefined;
                    sessionStorage.removeItem("currentUser");
                    currentUser=sessionStorage.getItem("currentUser");
                    $location.path('/');
                }
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
        app.controller("viewMsgController",viewMsgController);
        function loginController($scope,$location,userData){
            $scope.matchornot=true;
            $scope.notFillUname=false;
            $scope.userLogin=function(username,password){
                if(username===""||username===undefined||password===""||password===undefined){
                    $scope.matchornot=true;
                    if(username===""||username===undefined){
                        $scope.notFillUname=true;
                    }
                    if(password===""||password===undefined){
                        $scope.notFillPswd=true;
                    }
                }else{
                    $scope.notFillUname=false;
                    $scope.notFillPswd=false;
                    var currentUserData=findUserByUsernameAndPswd(username,password,userData.userInfo);
                    if(currentUserData===undefined){
                        $scope.matchornot=false;
                    }else{
                        userData.currentUser=currentUserData;
                        updateSessionstorage(currentUserData,"currentUser");
                        $location.path('/profile');
                    }
                }
            }
        }
        function profileController($scope,userData,$location){
            if(userData.currentUser===null){
                $location.path('/');
            }
            else{
                $scope.showEditBtn=false;
                $scope.editInfoSuccess=false;
                var currentUserData=userData.currentUser;
                var currentUserId=currentUserData.userid;
                var inputFiled=document.getElementById("profileForm").getElementsByClassName("form-control");
                $scope.currentUserData=currentUserData;
                $scope.copy=angular.copy(currentUserData);

                $scope.userdataEdit=function(){
                    for(var i=0;i<inputFiled.length;i++){
                        inputFiled[i].removeAttribute("disabled");
                    }
                    $scope.showEditBtn=true;
                };
                $scope.submitEdit=function(username,password,name,email,phone,location){
                    for(var i=0;i<inputFiled.length;i++){
                        inputFiled[i].setAttribute("disabled","true");
                    }
                    var editedThisUserData={
                        "userid":currentUserId,
                        "username":username,
                        "password":password,
                        "name":name,
                        "email":email,
                        "phone":phone,
                        "location":location
                    };
                    for(var j=0;j<userData.userInfo.length;j++){
                        for(var j1=0;j1<userData.userInfo[j].inbox.length;j1++){
                            if(userData.userInfo[j].inbox[j1].senderid===currentUserId){
                                userData.userInfo[j].inbox[j1].sender=username;
                            }
                            if(userData.userInfo[j].inbox[j1].recieverid===currentUserId){
                                userData.userInfo[j].inbox[j1].reciever=username;
                            }
                        }
                        for(var j2=0;j2<userData.userInfo[j].sentmail.length;j2++){
                            if(userData.userInfo[j].sentmail[j2].senderid===currentUserId){
                                userData.userInfo[j].sentmail[j2].sender=username;
                            }
                            if(userData.userInfo[j].sentmail[j2].recieverid===currentUserId){
                                userData.userInfo[j].sentmail[j2].reciever=username;
                            }
                        }
                    }
                    editedThisUserData.inbox=userData.userInfo[currentUserId-1].inbox;
                    editedThisUserData.sentmail=userData.userInfo[currentUserId-1].sentmail;
                    userData.userInfo.splice(currentUserId-1,1,editedThisUserData);
                    updateLocalstorage(userData.userInfo,"userdata");
                    userData.currentUser=userData.userInfo[currentUserId-1];
                    updateSessionstorage(userData.userInfo[currentUserId-1],"currentUser");
                    $scope.showEditBtn=false;
                    $scope.editInfoSuccess=true;
                    $(".editInfoSuccess").removeClass("ng-hide");
                };
                $scope.cancelEdit=function(){
                    $scope.currentUserData=$scope.copy;
                    $scope.copy=angular.copy($scope.currentUserData);
                };
                $scope.logout=userData.logout;
                $(document).on("click","#deletePopup",function(){
                    $(".editInfoSuccess").addClass("ng-hide");
                })
            }
        }
        function messageController($scope,userData,$location){
            if(userData.currentUser===null){
                $location.path('/');
            }else{
                var currentUserData=userData.currentUser;
                var currentUserId=currentUserData.userid;
                $scope.currentUserData=currentUserData;
                var thisUserMsgs=currentUserData.inbox;
                var thisUserSent=currentUserData.sentmail;
                $scope.thisUserMsgs=thisUserMsgs;
                $scope.thisUserSent=thisUserSent;
                $(document).ready(function(){
                    for(var aa=0;aa<thisUserMsgs.length;aa++){
                        if(thisUserMsgs[aa].star===true){
                            $("#stared"+aa).removeClass("notstared")
                                            .addClass("stared");
                        }else if(thisUserMsgs[aa].star===false){
                            $("#stared"+aa).removeClass("stared")
                                            .addClass("notstared");
                        }
                    }
                    for(var bb=0;bb<thisUserSent.length;bb++){
                        if(thisUserSent[bb].star===true){
                            $("#sentStared"+bb).removeClass("notstared")
                                .addClass("stared");
                        }else if(thisUserSent[bb].star===false){
                            $("#sentStared"+bb).removeClass("stared")
                                .addClass("notstared");
                        }
                    }
                });
                $scope.viewMsg=function (trIndex) {
                    $location.path('/view');
                    userData.currentMsg=thisUserMsgs[trIndex];
                };
                $scope.viewSent=function (trIndex) {
                    $location.path('/view');
                    userData.currentMsg=thisUserSent[trIndex];
                    // console.log(userData.currentMsg);
                };
                $scope.deleteMsg=function(trIndex){
                    thisUserMsgs.splice(trIndex,1);
                    updateLocalstorage(userData.userInfo,"userdata");
                    updateSessionstorage(currentUserData,"currentUser");
                };
                $scope.deleteSent=function(trIndex){
                    thisUserSent.splice(trIndex,1);
                    updateLocalstorage(userData.userInfo,"userdata");
                    updateSessionstorage(currentUserData,"currentUser");
                };
                $scope.starMsg=function(trIndex){
                    if(thisUserMsgs[trIndex].star===false){
                        $("#stared"+trIndex).removeClass("notstared")
                            .addClass("stared");
                        thisUserMsgs[trIndex].star=true;
                    }else if(thisUserMsgs[trIndex].star===true){
                        $("#stared"+trIndex).removeClass("stared")
                            .addClass("notstared");
                        thisUserMsgs[trIndex].star=false;
                    }
                    updateLocalstorage(userData.userInfo,"userdata");
                    updateSessionstorage(currentUserData,"currentUser");
                };
                $scope.starSent=function(trIndex){
                    var sentStarted=$("#sentStarted"+trIndex);
                    if(thisUserSent[trIndex].star===false){
                        $("#sentStared"+trIndex).removeClass("notstared")
                            .addClass("stared");
                        thisUserSent[trIndex].star=true;
                    }else if(thisUserSent[trIndex].star===true){
                        $("#sentStared"+trIndex).removeClass("stared")
                            .addClass("notstared");
                        thisUserSent[trIndex].star=false;
                    }
                    updateLocalstorage(userData.userInfo,"userdata");
                    updateSessionstorage(currentUserData,"currentUser");
                };
                //compose
                $scope.usernameNotFind=false;
                $scope.sendMail=function(mailReceiver,mailSubject,mailContent){
                    var receiverInfo=findUserByUsername(mailReceiver,userData.userInfo);
                    var senderInfo=findUserById(currentUserId,userData.userInfo);
                    if(receiverInfo===undefined){
                        $scope.usernameNotFind=true;
                    }else{
                        var thisTime=Date.now();
                        var newSent={
                            "msgid":"msg"+thisTime,
                            "recieverid":receiverInfo.userid,
                            "reciever":receiverInfo.username,
                            "senderid":currentUserId,
                            "sender":senderInfo.username,
                            "subject":mailSubject,
                            "content":mailContent,
                            "star":false
                        };
                        var newMsg={
                            "msgid":"msg"+thisTime,
                            "recieverid":receiverInfo.userid,
                            "reciever":receiverInfo.username,
                            "senderid":currentUserId,
                            "sender":senderInfo.username,
                            "subject":mailSubject,
                            "content":mailContent,
                            "star":false
                        };
                        thisUserSent.push(newSent);
                        userData.userInfo[receiverInfo.userid-1].inbox.push(newMsg);
                        updateLocalstorage(userData.userInfo,"userdata");
                        updateSessionstorage(currentUserData,"currentUser");
                        $location.path('/sentmail');
                    }
                };
                $scope.cancelSendMail=function () {
                    $scope.usernameNotFind=false;
                    $scope.mailReceiver=undefined;
                    $scope.mailSubject=undefined;
                    $scope.mailContent=undefined;
                }
                $scope.logout=userData.logout;
            }
        }

        function viewMsgController($scope,$location,userData){
            if(userData.currentMsg===null){
                $location.path('/');
            }else{
                // console.log(userData.currentMsg);
                $scope.currentMsgView= userData.currentMsg;
            }
        }

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
        function findUserByUsernameAndPswd(username,password,userData){
            for(var i=0;i<userData.length;i++){
                if(userData[i].username===username&&userData[i].password===password){
                    return userData[i];
                }
            }
        }
        function updateLocalstorage(dataObject,lsName){
            var dataStr=JSON.stringify(dataObject);
            localStorage.removeItem(lsName);
            localStorage.setItem(lsName,dataStr);
        }
        function updateSessionstorage(dataObject,lsName){
            var dataStr=JSON.stringify(dataObject);
            sessionStorage.removeItem(lsName);
            sessionStorage.setItem(lsName,dataStr);
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