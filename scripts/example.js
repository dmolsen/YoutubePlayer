// don't change these variables
var p 				= false;
var videoTimeRaw	= 0;
var currentTime 	= 0;
var defaultInterval	= 100;

// every 100ms do the following:
//   - see if a video is playing. if it is:
//   		-- increment the currentTime tracker 100	
//   		-- fires an event that matches that currentTime
timeCheck = setInterval(function() {	
	if (p != false) {
		currentTime += defaultInterval;
		YTVideo.fireEvent(currentTime.toString());
	}
}, defaultInterval);

// configure these variables
var vidId 				= 'videoEmbed';		// the ID of the div holding the video
var vidYTId				= 'XhLrlhFzAjA';	// the ID of the video from YouTube

// set-up the video
var YTVideo = new YoutubePlayer(vidId, vidYTId,{
    width: 640,
    height: 360,
	ytparams: { rel: 0, showsearch: 0, showinfo: 0, modestbranding: 1  },
    attrs:  { class: 'ytembed' }
});

// listen for the standard events and note that the video ISN'T playing
YTVideo.on('unstarted,paused,buffering,cued', function() {
	p = false;
});

YTVideo.on('ended', function() {
	p = false;

	// show the thank you message
	document.getElementById('outro').setAttribute('class', 'text show');
	document.getElementById('lights').setAttribute('class', 'lighten');
});

// listen for when the video is played. update the currentTime incrementor based on
// where the user is in the video. note that the video IS playing.
YTVideo.on('playing', function() {
	videoTimeRaw = document.getElementById(vidId).getCurrentTime();
	currentTime = Math.round(videoTimeRaw*10)*100;
	p = true;
	
	/* if you have anything else that should happen when a user hits play stick it here */
	
	// hide the intro & outro text
	document.getElementById('intro').setAttribute('class', 'text hide');
	document.getElementById('outro').setAttribute('class', 'text hide');
	document.getElementById('lights').setAttribute('class', 'darken');
});

// between 15secs and 21secs shoot off a firework every half a second
YTVideo.at('15000-21000', function() {
	createFirework(15,28,3,1,null,null,null,null,false,true);
}, 500);