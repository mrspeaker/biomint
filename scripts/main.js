
var main = {
	planet: null,
	level: null,

	dollars: 3000000,
	
	
	init: function() {
		gfx.init();
		input.init();

		this.planet = new Planet();
		this.level = new Level(this.planet);

		gfx.scene.add(this.planet.worldMesh);
		this.run();


		var self = this;
		$("#gui").on("click", "li", function(){
			var tool = $(this).data("tool");
			self.level.changeTool(tool);
			$("#gui li").removeClass("selected");
			$(this).addClass("selected");
		});

	},

	run: function(){
		this.tick();
		this.render();

		requestAnimationFrame(function(){
			main.run();
		});
	},

	tick: function() {
		this.planet.tick();
	},

	setCash: function() {
		$("#cash").text("$" + this.dollars);
	},

	render: function() {
		gfx.render();
	}
};
