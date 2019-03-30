var appid = "2157ed7e-83ee-4e1f-a06c-97eedec16570";
var ongoingCalls = {
  screenShare: null,
  audioCall: null
};
var baseUrl = getUrl();

console.log('baseUrl: ', baseUrl);

var room = "abcdef";

var client = new respoke.Client({
  appId: appid,
  developmentMode: true
});

client.listen('connect', function() {
  $('.share .link').text(room);
});

// called when we disconnect to the Respoke service
client.listen('disconnect', function() {
  $('#callControls').hide();
});

// listen for and answer incoming calls
client.listen('call', function(evt) {
  var call = evt.call;
  if (call.caller !== true) {
    if (call.incomingMedia.hasScreenShare()) {
      call.answer({
        onConnect: onConnect,
        onLocalMedia: onLocalVideo,
        onHangup: function() {
          ongoingCalls.screenShare = null;
          $('#callControls').hide();
        }
      });
    } else {
      call.answer({
        constraints: {
          audio: true,
          video: false
        },
        onConnect: function (evt) {
          ongoingCalls.audioCall = evt.target;
        },
        onHangup: function () {
          ongoingCalls.audioCall = null;
        }
      });
    }
  }
});

$('#hangupButton').click(function hangup() {
  if (ongoingCalls.screenShare) {
    ongoingCalls.screenShare.hangup();
  }
  if (ongoingCalls.audioCall) {
    ongoingCalls.audioCall.hangup();
  }
});

console.log('connect()');

var endpoint = makeRandomString();

console.log('client: ', client);
console.log('client.calls.length: ', client.calls.length);

client.connect({
  endpointId: endpoint
}).then(function connectDone() {
  console.log('connected');

  return client.join({
    id: room,
    onLeave: someoneLeft
  });
}).then(function roomJoined(group) {
  console.log(group);

  return group.getMembers();
}).done(function getMembers(members) {
  console.log('members: ', members);
  console.log('members.length: ', members.length);

  if(members.length > 2) {
    console.log('members.length > 2');

    $('.share .text').text("Sorry, that room is full. Join this room to screenshare:");
    $('.share .link').text(room);
  } else {
    console.log('members.length <= 2');

    members.forEach(function processEachMember(member) {
      handleNewEndoint(client.endpointId, member.endpointId);
    });
  }
});

function someoneLeft(evt) {
  console.log('someone left: ', evt);

  if (ongoingCalls.screenShare && !evt.target.connections.length) {
    ongoingCalls.screenShare.hangup();
    $('#callControls').hide();
  }
}

function handleNewEndoint(myName, theirName) {
  if (myName === theirName) {
    // don't call myself
    return;
  }

  var otherEndpoint = client.getEndpoint({
    id: theirName
  });

  otherEndpoint.startScreenShare({
    onConnect: onConnect,
    onLocalMedia: onLocalVideo,
    onHangup: function () {
      ongoingCalls.screenShare = null;
      $('#callControls').hide();
    }
  });

  setTimeout(function () {
      otherEndpoint.startAudioCall({
        onConnect: function (evt) {
          ongoingCalls.audioCall = evt.target;
        },
        onHangup: function () {
          ongoingCalls.audioCall = null;
        }
      });
  }, 100);
}

function onConnect(evt) {
  console.log('onConnect()', evt);

  ongoingCalls.screenShare = evt.target;
  $('#callControls').show();

  if (!evt.element) {
    console.log('no remote media to display');
    return;
  }

  var $videoContainer = $('#videoContainer');
  var $remoteVideo = $videoContainer.find('video');

  console.log('attaching remote video', evt.element);

  if($remoteVideo.length) {
    console.log('attaching to', $remoteVideo);
    $remoteVideo.replaceWith(evt.element);
  } else {
    console.log('appending to', $videoContainer);
    $videoContainer.append(evt.element);
  }
}

function onLocalVideo(evt) {
  console.log('onLocalVideo()', evt);

  var $videoContainer = $('#videoContainer');
  var $localVideo = $videoContainer.find('video');

  console.log('attaching local video', evt.element);
  if($localVideo.length) {
    console.log('attaching to', $localVideo);
    $localVideo.replaceWith(evt.element);
  } else {
    console.log('appending to', $videoContainer);
    $videoContainer.append(evt.element);
  }
}

function makeRandomString() {
  var newName = '';
  var space = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';

  for (var i = 0; i <= 6; i += 1) {
      newName += space.charAt(Math.floor(Math.random() * space.length));
  }

  return newName;
}

function getUrl() {
	var components = window.location.href.split( '/' );
	return components[0] + '//' + components[2] + '/' + components[3] + '/';
}
