(function(global) {
	
	var playerId = "";
	
    /**
     * Creates a new YoutubePlayer object
     *
     * @constructor
     * @param {String} HTML id of the element containing the Youtube flash player
     * @param {String} Youtube video id
     * @param (Object) Optional extra configuration data (from @ryanschneider's version of YoutubePlayer)
	 * 
     * @returns {YoutubePlayer} An object of YoutubePlayer
     */
    function YoutubePlayer(elementId, videoId, options) {
        this.id = elementId;
        this.videoId = videoId;
        this.handlers = {};
		this.ref = null;

		this.width = '425';
		this.height = '356';
		this.flashVersion = '8';
		this.chromeless = false;
		this.objparams = { allowScriptAccess: 'always' };
		this.ytparams = { version: 3 };
		this.attrs = { id: this.id };

		var mergeOptions = function(from, into) {
			for( var key in from) {
				into[key] = from[key];
			}
		};
		if(options) {
			if (options.objparams)
				mergeOptions(options.objparams, this.objparams);
			if (options.ytparams)
				mergeOptions(options.ytparams, this.ytparams);
			if (options.attrs)
				mergeOptions(options.attrs, this.attrs);
			if (options.width)
				this.width = options.width;
			if (options.height)
				this.height = options.height;
			if (options.flashVersion)
				this.flashVersion = options.flashVersion;
			if (options.chromeless)
				this.chromeless = options.chromeless;
		}

        this.embed();

        YoutubePlayer.register(this);
    }

    /**
     * Embeds the Youtube video on the page replacing the placeholder
     * element whose id was passed in the constructor.
     *
     * The <object> element that replaces the placeholder gets the same
     * id as that of the placeholder
     *
     * This relies on the SWFObject library.
     * @requires swfobject See http://code.google.com/p/swfobject/wiki/hosted_library
     *
     * @private
     *
     */
    YoutubePlayer.prototype.embed = function() {

		var yturlparams = '';
		for (val in this.ytparams) {
			yturlparams += '&'+val+'='+this.ytparams[val];
		}
		
		if (this.chromeless) {
			var videoUrl = 'http://www.youtube.com/apiplayer?video_id={videoId}&version=3&enablejsapi=1&playerapiid={playerId}';	
		} else {
			var videoUrl = 'http://www.youtube.com/v/{videoId}?enablejsapi=1&playerapiid={playerId}{yturlparams}';
		}
        videoUrl = videoUrl.replace('{videoId}', this.videoId);
        videoUrl = videoUrl.replace('{playerId}', this.id);
		videoUrl = videoUrl.replace('{yturlparams}', yturlparams);

        if(!swfobject) {
            throw new ReferenceError('YoutubePlayer depends on the SWFObject library but it is missing.');
        }
		
		var player = this;
		swfobject.embedSWF(videoUrl, this.id, this.width, this.height,
							this.flashVersion, null, null, this.objparams,
							this.attrs, function(e){
								player.ref = e.ref;
							});
    };

    /**
     * Add the given handler as a listener for the given event
     *
     * @param eventName {String} name of the event, if multiple events are being supplied the same exact handler just separate by a comma
     * @param handler {Function} callback for the event
	 * @param delay {Integer} used for range events to set how long to hold between repeating the function
	 * 
	 * 'on' makes sense to me for events to fire based on states
	 * 'at' makes sense to me for events fired at a particular time in the video
     */
    YoutubePlayer.prototype.on = YoutubePlayer.prototype.at = function(eventName, handler, range) {
		range = (typeof range == 'undefined') ? 500 : range;
		if (eventName.indexOf("-") != -1) {
			eventNames = eventName.split("-");
			startTime = parseInt(eventNames[0]);
			endTime = parseInt(eventNames[1]);
			while (endTime >= startTime) {
				this.handlers[startTime.toString()] = this.handlers[startTime.toString()] || [];
		        this.handlers[startTime.toString()].push(handler);
				startTime += range;
			}
		} else if (eventName.indexOf(",") != -1) {
			eventNames = eventName.split(",");
			for (var i in eventNames) {
				this.handlers[eventNames[i]] = this.handlers[eventNames[i]] || [];
		        this.handlers[eventNames[i]].push(handler);
			}
		} else {
			this.handlers[eventName] = this.handlers[eventName] || [];
	        this.handlers[eventName].push(handler);
		}
        
    };

    /**
     * Sets up event handlers for player state
     * changes once it's available.
     *
     * @private
     *
     */
    YoutubePlayer.prototype.onReady = function() {
        var player = document.getElementById(this.id);
		playerId = this.id;
		player.addEventListener("onStateChange", "YoutubePlayer.dispatchEvent");
    };
	
    /**
     * Receives notification of player state changes
     *
     * @private
     * @param eventId {String} Youtube player event id
     *
     */
    YoutubePlayer.prototype.notifyEvent = function(eventId) {
        var states = YoutubePlayer.STATES;

        for(var eventName in states) {
            if(states[eventName] == eventId) {
                this.fireEvent(eventName);
            }
        }
    };

    /**
     * Notify each registered subscriber of this event
     *
     * @param eventName {String} Name of the player event
     */
    YoutubePlayer.prototype.fireEvent = function(eventName) {
        var handlers = this.handlers[eventName];
        if(!handlers) {
            return;
        }

        for(var i = 0; i < handlers.length; i++) {
            handlers[i](eventName);
        }
    };

    /**
     * Holds instances of player objects to be able to
     * dispatch events to them globally
     *
     * @private
     */
    YoutubePlayer.instances = [];

    /**
     * @private
     */
    YoutubePlayer.register = function(player) {
        this.instances.push(player);
    };

    /**
     * Search the player object by its HTML id.
     * Useful when dispatching events to the player object
     * sent from the Youtube flash player

     * @param playerId {String} HTML id of the player object
     * @returns {YoutubePlayer} The object of YoutubePlayer that wraps this player
     *
     * @private
     */
    YoutubePlayer.findById = function(playerId) {
        var player = null;

        for(var i = 0; i < this.instances.length; i++) {
            if(this.instances[i].id == playerId) {
                player = this.instances[i];
            }
        }

        return player;
    };

    /**
     * Central event dispatcher which receives all player
     * events directly from the flash player and dispatches
     * them to the player object for which the event occurred.
     *
     * @param playerId
     *
     * @private
     */
    YoutubePlayer.dispatchEvent = function(eventId) {
		var player = YoutubePlayer.findById(playerId);
		player.notifyEvent(eventId);
    };

    /**
     * Various state change events that the Youtube flash player triggers
     *
     * @private
     */
    YoutubePlayer.STATES = {
        unstarted:  -1,
        ended:      0,
        playing:    1,
        paused:     2,
        buffering:  3,
        cued:       5
    };

    /**
     * Make the YoutubePlayer available globally
     */
    global.YoutubePlayer = YoutubePlayer;

    /**
     * Create a global handler that receives notification of when
     * the Youtube flash player has been initialized
     * on the page
     *
     * @param playerId {String}
     */
    global.onYouTubePlayerReady = function(playerId) {
        YoutubePlayer.findById(playerId).onReady();
    };

})(window);

