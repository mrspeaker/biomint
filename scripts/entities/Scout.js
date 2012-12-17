var Scout = Entity.extend({
	init: function(planet, pos, col) {
		this._super(planet, pos);
		this.planet = planet;
		this.has([TraitMesh, TraitMoving, TraitState]);
	},
	init_post: function() {
		this._super();
		this.state.change("born");
		this.xspeed *= 0.5;
		this.yspeed *= 0.5;
	},
	createMesh: function(opts) {
		opts = opts || {};
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(opts.size || 2, 5, 5),
		  new THREE.MeshLambertMaterial({color: 0x00ff00 }));
	},
	tick: function() {
		switch(this.state.current) {
			case "born":
				this.state.change("countdown");
				break;
			case "countdown":
				if(this.state.count === 700) {
					this.state.change("dead");
				}

				this.scan();
				break;
			case "dead":
				if(this.state.count === 0) {
					this.remove = true;
				}
				break;
		}
		this._super();
	},
	scan: function() {
		var val = this.planet.getTileFromPos(this.pos, true);
		val -= 40;
		val /= 60;

		this.mesh.scale.x = 0.5 + (val * 2);
		this.mesh.scale.y = 0.5 + (val * 2);
		
	}
});