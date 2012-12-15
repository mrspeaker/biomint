
var main = {
	planet: null,
	init: function() {
		gfx.init();
		input.init();
		
		this.planet = new Planet();

		gfx.scene.add(this.planet.worldMesh);
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
		this.planet.tick();
	},

	render: function() {
		gfx.render();
	}
};
