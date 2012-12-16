

var main = {
	planet: null,
	level: null,

	dollars: 0,
	sharePrice: 1.05,
	
	
	init: function() {
		gfx.init();
		input.init();
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
