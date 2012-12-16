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

		this.addCash(3500000);
		this.run();
	},

	run: function(){
		this.tick();
		this.render();

		requestAnimationFrame(function(){
			main.run();
		});
	},

	tick: function() {

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
		this.setCash();
	},
	setCash: function() {
		$("#cash").text("$" + this.dollars);
	},

	render: function() {
		gfx.render();
	}
};
