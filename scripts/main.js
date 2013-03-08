(function (gfx, audio, input, Planet, Level, ParticleController) {

	"use strict";

	var audiores,
		models,
		main;

	// TODO: group asset loading
	audiores = [
		{ name: "button", path: "resources/audio/button", volume: 0.8, loop: false},
		{ name: "button2", path: "resources/audio/button2", volume: 0.8, loop: false},
		{ name: "bomb", path: "resources/audio/deploy", volume: 0.8, loop: false},
		{ name: "explode", path: "resources/audio/explode", volume: 0.7, loop: false },
		{ name: "scout", path: "resources/audio/scout", volume: 0.7, loop: false },
		{ name: "pulse", path: "resources/audio/pulse", volume: 1, loop: false },
		{ name: "error", path: "resources/audio/error", volume: 0.8, loop: false },
		{ name: "heartbeat", path: "resources/audio/heartbeat", volume: 0.3, loop: false },
		{ name: "win", path: "resources/audio/win", volume: 0.7, loop: false },
		{ name: "drone", path: "resources/audio/drone", volume: 0.2, loop: true }
	];

	models = [
		{ name: "scout", path: "resources/scout.dae" },
		{ name: "extractor", path: "resources/mine.dae" },
		{ name: "rig", path: "resources/rig.dae" }
	];

	main = {

		level: null,
		models: {},

		initalDollars: 1500000,
		dollars: 0,
		sharePrice: 1.05,
		bankrupt: false,

		droneGo: false,
		nextHeartbeat: 0,

		zooming: {
			go: false,
			start: 90000,
			finish: 350,
			length: 5500,
			startTime: Date.now()
		},

		init: function () {

			// FIXME: lots of game logic in main.
			// move to level.
			var self = this,
				planet;

			gfx.init();
			input.init();

			// Load the collada models
			models.forEach(function (model) {

				new THREE.ColladaLoader().load(model.path, function (collada) {

					self.models[model.name] = collada.scene;

				});

			});

			audio.init(audiores);
			ParticleController.init();

			planet = new Planet();
			this.level = new Level(planet);

			gfx.scene.add(planet.worldMesh);
			gfx.camera.position.z = this.zooming.start;

			this.setHeartbeat();

			$("#gui")
				.on("click", "li", function (e) {

					var tool = $(this).data("tool");
					e.stopPropagation();
					self.level.changeTool(tool);
					$("#gui li").removeClass("selected");
					$(this).addClass("selected");

				})
				.on("mouseup", function (e) {

					e.stopPropagation();

				});

			this.reset();

			// Do the splash screen fade out
			$("#splash")
				.show()
				.delay(2500)
				.fadeIn(1, function () {

					self.zooming.go = true;

				})
				.fadeOut(2500);

			// Stop clicks from propagating to the game from other screens
			$("#gameover, #splash").on("mousedown", function (e) {

				e.preventDefault();
				e.stopPropagation();

			});

			this.run();

		},

		reset: function () {

			this.bankrupt = false;
			this.level.reset();
			this.dollars = 0;
			this.addCash(this.initalDollars);
			this.setHeartbeat();

		},

		run: function () {

			this.tick();
			this.render();

			window.requestAnimationFrame(function () {
				main.run();
			});

		},

		setHeartbeat: function () {

			var time = Math.min(this.dollars, this.initalDollars) / this.initalDollars,
				next = Math.max(1000, time * 1000 * 10);

			this.nextHeartbeat = Date.now() + next;

		},

		tick: function () {

			if (this.bankrupt) {
				return;
			}

			ParticleController.tick();

			if (!this.droneGo) {
				if (audio.get("drone").loaded) {
					audio.get("drone").backPlay();
					this.droneGo = true;
				}
			}

			if (Date.now() > this.nextHeartbeat) {
				audio.get("heartbeat").backPlay();
				this.setHeartbeat();
			}

			function smoothstep(a, b, v) {

				var x = Math.max(0, Math.min((v - a) / (b - a), 1));

				return x * x * (3 - 2 * x);

			}

			if (this.zooming.go) {

				var v = Date.now() - this.zooming.startTime,
					p = smoothstep(0, this.zooming.length, v);

				p = 1 - (1 - p) * (1 - p) * (1 - p) * (1 - p);

				gfx.camera.position.z = (1 - p) * this.zooming.start + this.zooming.finish * p;

				if (p >= 1) {
					this.zooming.go = false;
				}

			}

			this.level.tick();

		},

		addCash: function (amount) {

			var self = this;

			this.dollars += amount;

			if (this.dollars <= 0) {
				if (!this.bankrupt) {
					// Show game over screen, then restart
					$("#gameover")
						.fadeIn(1500)
						.delay(5500)
						.fadeOut(2500, function () {

							self.reset();

						});
				}
				this.bankrupt = true;
				return;

			}

			this.setCash();

		},

		setCash: function () {

			$("#cash").text("$" + this.dollars);

		},

		render: function () {

			gfx.render();

		}
	};

	// Export global main object
	window.main = main;

// TODO: namespace theses suckas
}(gfx, audio, input, Planet, Level, ParticleController));
