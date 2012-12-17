var audiores= [
	{ name: "button", path: "resources/audio/button", volume: 0.8, loop: false},
	{ name: "button2", path: "resources/audio/button2", volume: 0.8, loop: false},
	{ name: "bomb", path: "resources/audio/deploy", volume: 0.8, loop: false},
	{ name: "explode", path: "resources/audio/explode", volume: 0.7, loop: false },
	{ name: "scout", path: "resources/audio/scout", volume: 0.7, loop: false },
	{ name: "drone", path: "resources/audio/drone", volume: 0.2, loop: true }
];


var main = {
	planet: null,
	level: null,
	drongo: false,

	dollars: 0,
	sharePrice: 1.05,
	
	bankrupt: false,
	
	init: function() {
		gfx.init();
		input.init();
		audio.init(audiores);

		ParticleController.init();

		this.planet = new Planet();
		this.level = new Level(this.planet);

		gfx.scene.add(this.planet.worldMesh);
		
		var self = this;
		$("#gui").on("click", "li", function(){
			var tool = $(this).data("tool");
			self.level.changeTool(tool);
			$("#gui li").removeClass("selected");
			$(this).addClass("selected");
		});

		this.reset();

		$("#splash").show().delay(2500).fadeOut(2500);

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
		this.addCash(1500000);
	},

	run: function(){
		this.tick();
		this.render();

		requestAnimationFrame(function(){
			main.run();
		});
	},


	flashMessage: function(msg) {
		var stat = $("#status");
		(function flash(count){
			if(count >= 0){
				stat.text(count %2 == 0 ? msg : "");
				setTimeout(function(){
					flash(--count);
				}, 400);
			}
		}(6));

	},

	tick: function() {

		if(this.bankrupt) {
			//$("#")
				
			return;
		}

		ParticleController.tick();

		if(!this.drongo) {
			if(audio.get("drone").loaded) {
				audio.get("drone").backPlay();
				this.drongo = true;
			}
		}

		this.planet.tick();
	},

	addCash: function(amount) {
		this.dollars += amount;

		console.log(this.dollars <= 0)
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
