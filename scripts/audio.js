(function () {

	"use strict";

	var audio = {

		snd: {},

		get: function (name) {

			return this.snd[name];

		},

		init: function (sounds, cb) {

			var toLoad = sounds.length,
				self = this,
				ext = document.createElement('audio').canPlayType('audio/mpeg;') === "" ? ".ogg" : ".mp3";

			// Todo: put a timeout incase something doesn't load.
			sounds.forEach(function (asset) {

				var audio = new window.Audio();

				audio.src = asset.path + ext;
				audio.volume = asset.volume;
				audio.loop = asset.loop;
				audio.addEventListener("canplaythrough", function () {

					audio.loaded = true;
					if (!(--toLoad)) {
						cb && cb();
					}

				});
				audio.load();
				// Adding to prototype doesn't work in Ejecta
				audio.backPlay = function () {

					if (!this.loaded) {
						return;
					}
					this.end();
					this.play();

				};
				audio.end = function () {

					if (!this.loaded) {
						return;
					}

					this.pause();
					this.currentTime = 0;
				};
				self.snd[asset.name] = audio;
			});

		},

		play: function (name) {

		},

		stop: function (name) {

		},

		stopAll: function () {

			var self = this,
				x;

			for (x in self.snd) {
				self.get(x).end();
			}

		}

	};

	window.audio = audio;

}());
