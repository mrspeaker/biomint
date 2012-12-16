var Scout = Entity.extend({
	init: function(planet, pos, col) {
		this._super(planet, pos);
		this.has([TraitMesh, TraitMoving, TraitState]);
	},
	init_post: function() {
		this._super();
		this.state.change("born");
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
				if(this.state.count === 1000) {
					this.state.change("dead");
				}
				break;
			case "dead":
				if(this.state.count === 0) {
					this.remove = true;
				}
				break;
		}
		this._super();
	}
});