var selfEasyrtcid = "";
var waitingForRoomList = true;
var isConnected = false;
var roomName = "";
function genRoomOccupantName(roomName) {
    return "roomOccupant_" + roomName;
}

function buildPeerBlockName(easyrtcid) {
  return "peerzone_" + easyrtcid;
}
 
function buildDragNDropName(easyrtcid) {
  return "dragndrop_" + easyrtcid;
}
 
function buildReceiveAreaName(easyrtcid) {
  return "receivearea_" + easyrtcid;
}
$("#share-file").click(function(){ 
	$("#fselect").click();
});

function formatFileSize(bytes,decimalPoint) {
   if(bytes == 0) return '0 Bytes';
   var k = 1000,
       dm = decimalPoint || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

$("#fselect").on('change',function(e) {
	var statusDiv = document.getElementById("sdivy");
	function updateStatusDiv(state) {
      switch (state.status) {
        case "waiting":
          statusDiv.innerHTML = "waiting for other party<br\>to accept file.";
          break;
        case "started_file":
          statusDiv.innerHTML = "started file: " + state.name;
        case "working":
          statusDiv.innerHTML = state.name + ":" + formatFileSize(state.position,2) + "/" + formatFileSize(state.size,2) + "(" + state.numFiles + " files)";
           break;
        case "rejected":
          statusDiv.innerHTML = "cancelled";
          setTimeout(function() {
            statusDiv.innerHTML = "";
          }, 2000);
          break;
        case "done":
          statusDiv.innerHTML = "done";
          setTimeout(function() {
            statusDiv.innerHTML = "";
          }, 3000);
          break;
      }
      return true;
    }
	var xfiles = e.target.files;
	for (var ssid of easyrtc.getRoomOccupantsAsArray(roomName)){
		if(ssid !== selfEasyrtcid) {
			fileSender = easyrtc_ft.buildFileSender(ssid, updateStatusDiv);
			fileSender(xfiles, true /* assume binary */);
			console.log("Sending files to: " + ssid);
		}
	}
});
  function buildDropDiv(easyrtcid) {
    var statusDiv = document.createElement("div");
	statusDiv.id = "sdivy";
    statusDiv.className = "dragndropStatus";
    var dropArea = document.createElement("div");
	dropArea.className = "dragndrop connected";
    dropArea.id = "dragndrop";
    dropArea.innerHTML = "File drop area";
    function updateStatusDiv(state) {
      switch (state.status) {
        case "waiting":
          statusDiv.innerHTML = "waiting for other party<br\>to accept file.";
          break;
        case "started_file":
          statusDiv.innerHTML = "started file: " + state.name;
        case "working":
          statusDiv.innerHTML = state.name + ":" + formatFileSize(state.position,2) + "/" + formatFileSize(state.size,2) + "(" + state.numFiles + " files)";
           break;
        case "rejected":
          statusDiv.innerHTML = "cancelled";
          setTimeout(function() {
            statusDiv.innerHTML = "";
          }, 2000);
          break;
        case "done":
          statusDiv.innerHTML = "done";
          setTimeout(function() {
            statusDiv.innerHTML = "";
          }, 3000);
          break;
      }
      return true;
    }
    var noDCs = {}; // which users don"t support data channels
 
    var fileSender = null;
    function filesHandler(files) {
      var timer = null;
      if (!fileSender) {
			for (var ssid of easyrtc.getRoomOccupantsAsArray(roomName)){
				if(ssid !== selfEasyrtcid) {
					fileSender = easyrtc_ft.buildFileSender(ssid, updateStatusDiv);
					fileSender(files, true /* assume binary */);
					console.log("Sending files to: " + ssid);
				}
			}
		}
	}
    easyrtc_ft.buildDragNDropRegion(dropArea, filesHandler);
    var container = document.createElement("div");
    container.appendChild(dropArea);
    container.appendChild(statusDiv);
    return container;
  }
  function buildReceiveDiv(easyrtcid) {
    var div = document.createElement("div");
    div.id = "receivearea";
    div.className = "receiveBlock";
    div.style.display = "none";
    return div;
	}
	
function acceptRejectCB(otherGuy, fileNameList, wasAccepted) {
  var receiveBlock = document.getElementById("receivearea");
  jQuery(receiveBlock).empty();
  receiveBlock.style.display = "inline-block";
 
  receiveBlock.appendChild(document.createTextNode("Files offered"));
  receiveBlock.appendChild(document.createElement("br"));
  for (var i = 0; i < fileNameList.length; i++) {
    receiveBlock.appendChild(
        document.createTextNode("  " + fileNameList[i].name + "(" + formatFileSize(fileNameList[i].size,2) + " )"));
    receiveBlock.appendChild(document.createElement("br"));
  }
  var button = document.createElement("button");
  button.appendChild(document.createTextNode("Accept"));
  button.className = "acceptBtn";
  button.onclick = function() {
    jQuery(receiveBlock).empty();
    wasAccepted(true);
  };
  receiveBlock.appendChild(button);
 
  button = document.createElement("button");
  button.appendChild(document.createTextNode("Reject"));
  button.className = "rejectBtn";
  button.onclick = function() {
    wasAccepted(false);
    receiveBlock.style.display = "none";
  };
  receiveBlock.appendChild(button);
}
  
function receiveStatusCB(otherGuy, msg) {
  var receiveBlock = document.getElementById("receivearea");
  if( !receiveBlock) return;
 
  switch (msg.status) {
    case "started":
      break;
    case "eof":
      receiveBlock.innerHTML = "Finished file";
      break;
    case "done":
      receiveBlock.innerHTML = "Stopped because " +msg.reason;
      setTimeout(function() {
        receiveBlock.style.display = "none";
      }, 1000);
      break;
    case "started_file":
      receiveBlock.innerHTML = "Beginning receive of " + msg.name;
      break;
    case "progress":
      receiveBlock.innerHTML = msg.name + " " + formatFileSize(msg.received,2)+ "/" + formatFileSize(msg.size,2);
      break;
    default:
      console.log("strange file receive cb message = ", JSON.stringify(msg));
  }
  return true;
}
 window.blobby = [];
 function saveBlob(idx) {
	     easyrtc_ft.saveAs(blobby[idx-1][1], blobby[idx-1][0]);
 }
function blobAcceptor(otherGuy, blob, filename) {
	var id = blobby.push([filename,blob]);
	$("#sflist").append("<a onclick=saveBlob("+id+")>"+filename+"</a>");
}

function start() {
	easyrtc.enableAudio(false);
	easyrtc.enableVideo(false);
	$("#open-or-join-room").text('Joining....');
	connect();
	addRoom(null, null, true); 
	roomName = document.getElementById("room-id").value;
	$("#fileslist").html('');
	$("#fileslist").prepend(buildDropDiv(selfEasyrtcid));
	$("#fileslist").prepend(buildReceiveDiv(selfEasyrtcid));
}
     easyrtc.setStreamAcceptor(function(callerEasyrtcid, stream) {
		 if(stream.getVideoTracks().length > 0) {
			var video = '';
			if($('#'+callerEasyrtcid).length > 0) {
				video = document.getElementById(callerEasyrtcid);
			}
			else {
				window.chus = callerEasyrtcid;
				window.chstre = stream;
				var box = "<div class='caller-box' id='b"+callerEasyrtcid+"'><label>"+easyrtc.idToName(callerEasyrtcid)+"</label><video id='"+callerEasyrtcid + "' controls></video></div>";
				$("#videos-container").append(box);
				video = document.getElementById(callerEasyrtcid);
			}
		}
		else {
			if($('#'+callerEasyrtcid).length > 0) {
				video = document.getElementById(callerEasyrtcid);
			}
			else {
				var box = "<audio id='"+callerEasyrtcid + "' style='display: none;' autoplay></audio>";
				$("#videos-container").append(box);
				video = document.getElementById(callerEasyrtcid);
			}
		}
        easyrtc.setVideoObjectSrc(video, stream);
    });

     easyrtc.setOnStreamClosed( function (callerEasyrtcid) {
        easyrtc.setVideoObjectSrc(document.getElementById(callerEasyrtcid), "");
		if(callerEasyrtcid == selfEasyrtcid) $("#myvidbox").hide();
		$("#b"+callerEasyrtcid).remove();
    });
function closeAll(){
  easyrtc.disconnect();
}
function audCall(type) {
	if(type=='audio') {		
		easyrtc.enableAudio(true);
		easyrtc.enableVideo(false);
	}
	else if(type == 'video') {
		easyrtc.enableAudio(true);
		easyrtc.enableVideo(true);
		$("#myvidbox").show();
		easyrtc.initMediaSource(
         function(mediastream){
             easyrtc.setVideoObjectSrc( document.getElementById("myvid"), mediastream);
			 window.mystream = mediastream;
         },
         function(errorCode, errorText){
              console.log(errorCode + "  " + errorText);
         });
	}
	else if(type=='screen') {
		easyrtc.enableAudio(true);
		navigator.mediaDevices.getDisplayMedia({video: true}).then(stream => {
			$("#myvidbox").show();
				window.ssc = stream;
				easyrtc.buildLocalMediaStream("screen",
				ssc.getVideoTracks(),
            ssc.getVideoTracks());
				easyrtc.register3rdPartyLocalMediaStream(ssc,"screen");				
		easyrtc.setVideoObjectSrc( document.getElementById("myvid"), ssc);
				var ids = easyrtc.getRoomOccupantsAsMap(roomName);
				for (var p in ids) {
					easyrtc.addStreamToCall(p,"screen",function(s,t) { });
				}
				return;
             });
	}
	var ids = easyrtc.getRoomOccupantsAsMap(roomName);
	for (var p in ids) {
		performCall(p,["default"]);
	}
}
function hangup() {
	easyrtc.hangupAll();
	easyrtc.enableAudio(false);
	easyrtc.enableVideo(false);
	$("#myvidbox").hide();
}
function updateStatusDiv(state) {
	console.log(state);
}
function performCall(easyrtcid, streams) {
	if (easyrtc.getConnectStatus(easyrtcid) === easyrtc.IS_CONNECTED) {
	}
	else {
        easyrtc.call(
           easyrtcid,
           function(easyrtcid) { console.log("completed call to " + easyrtcid);},
           function(errorCode, errorText) { console.log("err:" + errorText);},
           function(accepted, bywho) {
              console.log((accepted?"accepted":"rejected")+ " by " + bywho);
           }, streams
       );
    }
}
function addRoom(roomName, parmString, userAdded) {
    if (!roomName) {
        roomName = document.getElementById("room-id").value;
    }
    var roomid = genRoomDivName(roomName);
    if (document.getElementById(roomid)) {
        return;
    }
    var parmString = '{"admin":"'+getCookie("admin")+'"}';
	var roomParms = null;
    if (parmString && parmString !== "") {
        try {
            roomParms = JSON.parse(parmString);
        } catch (error) {
            roomParms = null;
            easyrtc.showError(easyrtc.errCodes.DEVELOPER_ERR, "Room Parameters must be an object containing key/value pairs. eg: {\"fruit\":\"banana\",\"color\":\"yellow\"}");
            return; 
        }
    }
    if (userAdded) {
        console.log("calling joinRoom(" + roomName + ") because it was a user action " + roomParms);
        easyrtc.joinRoom(roomName, roomParms,
                function() {
                },
                function(errorCode, errorText, roomName) {
                    easyrtc.showError(errorCode, errorText + ": room name was(" + roomName + ")");
                });
    }
}
function roomEntryListener(entered, roomName) {
    if (entered) { // entered a room
        document.getElementById("msgbox").innerHTML = "Joined " + roomName;
		$("#init").hide();
		$("#mbb").show();
		$("#buttons").show();
        addRoom(roomName, null, false);
    }
}

function peerListener(who, msgType, content, targeting) {
	nick = (easyrtc.idToName(who));
    addToConversation(nick, msgType, content, targeting);
}
function occupantListener(roomName, occupants, isPrimary) {
    if (roomName === null) {
        return;
    }
    var roomId = genRoomOccupantName(roomName);
    var roomDiv = document.getElementById(roomId);
    if (!roomDiv) {
        addRoom(roomName, "", false);
        roomDiv = document.getElementById(roomId);
    }
    else {
        jQuery(roomDiv).empty();
    }
	$('#userlist').html('');
    for (var easyrtcid in occupants) {
		$("#userlist").append(easyrtc.idToName(easyrtcid));
		var button = document.createElement("button");
        button.onclick = (function(roomname, easyrtcid) {
            return function() {
                sendMessage(easyrtcid, roomName);
            };
        })(roomName, easyrtcid);
        var presenceText = "";
        if (occupants[easyrtcid].presence) {
            presenceText += "(";
            if (occupants[easyrtcid].presence.show) {
                presenceText += "show=" + occupants[easyrtcid].presence.show + " ";
            }
            if (occupants[easyrtcid].presence.status) {
                presenceText += "status=" + occupants[easyrtcid].presence.status;
            }
            presenceText += ")";
        }
        var label = document.createTextNode(easyrtc.idToName(easyrtcid) + presenceText);
        button.appendChild(label);
    }
}
function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    $("#open-or-join-room").text('Join');
	easyrtc_ft.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
    isConnected = true;
}

function loginFailure(errorCode, message) {
    easyrtc.showError("LOGIN-FAILURE", message);
    //document.getElementById('connectButton').disabled = false;
    //jQuery('#rooms').empty();
}

function genRoomDivName(roomName) {
    return "roomblock_" + roomName;
}
function serverListener(msgtype,msgdata,targeting) {
  if(msgtype==="leave") {
    easyrtc.disconnect();
  }
}
function connect() {
    easyrtc.setPeerListener(peerListener);
	easyrtc.enableDataChannels(true);
    easyrtc.setRoomOccupantListener(occupantListener);
    easyrtc.setRoomEntryListener(roomEntryListener);
    easyrtc.setServerListener(serverListener);
    easyrtc.setDisconnectListener(function() {
        console.log("disconnect listener fired");
		$("#init").show();
		$("#mbb").hide();
		$("#buttons").hide();
    });
	window.unm = getCookie("name").replace("+"," ");
	if( !easyrtc.setUsername(unm)){  
       console.error("bad user name");
   }
	easyrtc.setSocketUrl(":8449");
	easyrtc.connect("e.flrApp", loginSuccess, loginFailure);
}
function disconnect() {
    easyrtc.disconnect();
}

function getGroupId() {
        return null;
}

function sendMessage(destTargetId, destRoom) {
    var text = document.getElementById('itc').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }
    var dest;
	destRoom = roomName;
    var destGroup = getGroupId();
    if (destRoom || destGroup) {
        dest = {};
        if (destRoom) {
            dest.targetRoom = destRoom;
        }
        if (destGroup) {
            dest.targetGroup = destGroup;
        }
        if (destTargetId) {
            dest.targetEasyrtcid = destTargetId;
        }
    }
    else if (destTargetId) {
        dest = destTargetId;
    }
    else {
        easyrtc.showError("user error", "no destination selected");
        return;
    }

    if( text === "empty") {
         easyrtc.sendPeerMessage(dest, "message");
    }
    else {
    easyrtc.sendDataWS(dest, "message", text, function(reply) {
        if (reply.msgType === "error") {
            easyrtc.showError(reply.msgData.errorCode, reply.msgData.errorText);
        }
    });
    }
    addToConversation("Me", "message", text);
    document.getElementById('itc').value = "";
	$("#itc").focus();
}


function addToConversation(who, msgType, content, targeting) {
    // Escape html special characters, then add linefeeds.
    if( !content) {
        content = "**no body**";
    }
    content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    content = content.replace(/\n/g, '<br />');
    var targetingStr = "";
    if (targeting) {
        if (targeting.targetEasyrtcid) {
            targetingStr += "user=" + targeting.targetEasyrtcid;
        }
        if (targeting.targetRoom) {
            targetingStr += " room=" + targeting.targetRoom;
        }
        if (targeting.targetGroup) {
            targetingStr += " group=" + targeting.targetGroup;
        }
    }
    document.getElementById('msgbox').innerHTML +=
            "<br>" + who +":</b>&nbsp;" + content ;
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

$("#itc").keyup(function(event) {
    if (event.keyCode === 13) {
        sendMessage();
    }
	else return false;
});