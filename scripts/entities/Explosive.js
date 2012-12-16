var Explosive = Entity.extend({
	init: function(planet, pos, col) {
		this._super(planet, pos);
		this.has([TraitMesh, TraitState]);
	},

	init_post: function() {
		this._super("born");
	},

	tick: function() {
		switch(this.state.current) {
			case "born":
				console.log("here we go bomb...")
				this.state.change("countdown");
				break;
			case "countdown":
				if(this.state.count === 100) {
					console.log("BOOOOM!");
					this.state.change("dead");
				}
				break;
			case "dead":
				if(this.state.count === 0) {
					console.log("all overrr");
				}
				break;
		}
		this._super();
	},
	createMesh: function(opts) {
		opts = opts || {};
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(opts.size || 2, 3, 3),
		  new THREE.MeshLambertMaterial({color: 0x550000 }));
	}
});