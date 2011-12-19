## About

YoutubePlayer is a JavaScript wrapper for YouTube's flash player that provides a simple interface for listening to the video playback events from YouTube's JavaScript API. You can add multiple videos on the page by creating an object of YoutubePlayer for each video, and can subscribe to events on that object. You can also also listen to the video time to launch events to happen at certain moments of a video.
	
Thanks to James Coglan for coming up with some [great ideas](http://blog.jcoglan.com/2008/05/22/dispatching-youtube-api-events-to-individual-javascript-objects/) on overcoming the limited Flash-JavaScript communication offered by the YouTube APIs with a very well designed interface. Thanks to Anurag Mishra for putting together the [initial release](https://github.com/AnuragMishra/YoutubePlayer).Thanks to Ryan Schneider for [providing code](https://github.com/ryanschneider/YoutubePlayer/blob/master/YoutubePlayer.js) to customize the player.

## Usage

Include `YoutubePlayer.js` and its dependency `SWFObject`.

	<script src="http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>
	<script src="YoutubePlayer.js"></script>

For each video that is to be embedded on the page, add a placeholder div element on the page and give it an `id`.

	<div id="inception"></div>
	<div id="easyA"></div>

To replace the placeholder div with the actual flash player, simply instantiate an object of YoutubePlayer and pass it the id of the placeholder div and the id of the Youtube video.

	var inceptionTrailer = new YoutubePlayer('inception', '66TuSJo4dZM');
	var easyATrailer = new YoutubePlayer('easyA', 'DL7W6pEuAW0');
	
YoutubePlayer takes an optional 3rd object parameter to overload the default behavior:

	var inceptionTrailer = new YoutubePlayer('inception', '66TuSJo4dZM', {
	    width: 640,
	    height: 360,
	    params: { allowFullScreen: 1 },
			ytparams: { rel: 0, showinfo: 0 },
	    attrs:  { class: 'ytembed' }
	});

	All fields are optional, the defaults will be used if not included. 'ytparams' are for the [YouTube Embedded Player Paramters](http://code.google.com/apis/youtube/player_parameters.html).

To listen to playback events, add a handler to the above objects for the supported events.

	inceptionTrailer.on('paused', function() {
		alert("Paused Inception's trailer");
	});

	easyATrailer.on('playing', function() {
		alert("Started playing Easy-A's trailer");
	});
	
To listen to time events, add a handler to the above objects for the supported events.

	inceptionTrailer.at('5000', function() {
		alert("You're five seconds into the Inception trailer.");
	});

See a demo of the script at [http://dmolsen.com/youtube-player/](http://dmolsen.com/youtube-player/).

## List of Supported Events Using videoObj.on

Any of these events can be combined simply by referencing them once and separating with a single comma.

	unstarted
	ended
	playing
	paused
	buffering
	cued
	
## List of Supported Events Using videoObj.at

	single time (ex. 5000 for 5 seconds)
	combined times with a single comma (ex. 5000,6000,7000 to run the same function at 5 seconds, 6 seconds, and 7 seconds respectively)
	a range of times with a dash (ex. 5000-7000 to run the same function at the optional interval. defaults to 500ms)

## Dependencies

This library depends on the SWFObject library for embedding videos on the page. See the [source code](http://code.google.com/p/swfobject/source/checkout) and [documentation](http://code.google.com/p/swfobject/wiki/documentation) for SWFObject. 

Google Code provides a [hosted version](http://code.google.com/p/swfobject/wiki/hosted_library) of the library which can be included (compressed)

	http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js
	
or (uncompressed)

	http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject_src.js