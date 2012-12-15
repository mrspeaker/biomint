
var planet;

var main = {
	init: function() {
		gfx.init();
		input.init();
		
		planet = new Planet();
		
		for(var i = 0; i < 200; i++) {
			var e = new Entity(planet);
			e.pos = new THREE.Vector2(Math.random() * 180 - 90 | 0, Math.random() * 360 - 180 | 0);
		}

		
		gfx.scene.add(planet.worldMesh);

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
		planet.tick();
	},

	render: function() {
		gfx.render();
	}
};
