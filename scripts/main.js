var audiores= [
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


var main = {
	planet: null,
	level: null,
	drongo: false,

	initalDollars: 1500000,
	dollars: 0,
	sharePrice: 1.05,

	nextHeartbeat: 0,

	zooming: {
		go: false,
		start: 90000,
		finish: 350,
		length: 5500,
		startTime: Date.now()
	},

	bankrupt: false,
	
	init: function() {
		gfx.init();
		input.init();
		audio.init(audiores);

		ParticleController.init();

		this.planet = new Planet();
		this.level = new Level(this.planet);

		gfx.scene.add(this.planet.worldMesh);

		gfx.camera.position.z = this.zooming.start;

		this.setHeartbeat();
		
		var self = this;
		$("#gui").on("click", "li", function(){
			var tool = $(this).data("tool");
			self.level.changeTool(tool);
			$("#gui li").removeClass("selected");
			$(this).addClass("selected");
		});

		this.reset();

		$("#splash").show().delay(2500).fadeIn(1, function(){
			self.zooming.go = true;
		}).fadeOut(2500);

		$("#gameover, #splash").on("mousedown", function(e){
			e.preventDefault();
			e.stopPropagation();
		})
		
		this.run();
	},

	reset: function() {
		this.bankrupt = false;
		this.planet.reset();
		this.dollars = 0;
		this.addCash(this.initalDollars);
		this.setHeartbeat();
	},

	run: function(){
		this.tick();
		this.render();

		requestAnimationFrame(function(){
			main.run();
		});
	},

	setHeartbeat: function() {
		var time = Math.min(this.dollars, this.initalDollars) / this.initalDollars,
			next = Math.max(1000, time * 1000 * 10);
		this.nextHeartbeat = Date.now() + next;
	},


	flashMessage: function(msg) {
		var stat = $("#status");
		(function flash(count){
			if(count >= 0){
				stat.html(count %2 == 0 ? msg : "");
				setTimeout(function(){
					flash(--count);
				}, 400);
			}
		}(6));

	},

	tick: function() {

		if(this.bankrupt) {
			return;
		}

		ParticleController.tick();

		if(!this.drongo) {
			if(audio.get("drone").loaded) {
				audio.get("drone").backPlay();
				this.drongo = true;
			}
		}

		if(Date.now() > this.nextHeartbeat){
			audio.get("heartbeat").backPlay();
			this.setHeartbeat();
		}

		function smoothstep (a, b, v) {
			var x = Math.max(0, Math.min((v-a)/(b-a), 1));
			return x * x * (3 - 2 * x);
		}

		if(this.zooming.go) {

			var v = Date.now() - this.zooming.startTime;
			//v = SMOOTHSTEP(v);
			var p = smoothstep(0, this.zooming.length, v);
			  //X = (A * v) + (B * (1 - v));

			var p = 1 - (1 - p) * (1 - p) * (1 - p) * (1 - p);
			//(A * v) + (B * (1 - v));
			gfx.camera.position.z = (1-p) * this.zooming.start + this.zooming.finish * p;

			if(p >= 1) {
				this.zooming.go = false;
			}
		}

		this.planet.tick();
	},

	addCash: function(amount) {
		this.dollars += amount;

		if(this.dollars <= 0) {
			if(!this.bankrupt) {

				var self = this;
				$("#gameover").fadeIn(1500).delay(5500).fadeOut(2500, function(){
					self.reset();	
				});	
			}
			this.bankrupt = true;
			return;
		}

		this.setCash();
	},
	setCash: function() {
		$("#cash").text("$" + this.dollars);
	},

	render: function() {
		gfx.render();
	}
};
