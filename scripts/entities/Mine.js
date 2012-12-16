var Mine = Entity.extend({
	init: function(planet, pos, col) {
		this._super(planet, pos, col);
		this.has([TraitMesh]);

		main.dollars -= 130000;
		main.setCash();
	},
	createMesh: function(opts) {
		opts = opts || {};
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(opts.size || 3, 5, 5),
		  new THREE.MeshLambertMaterial({color: opts.color || this.color || 0xffffff }));
	}
});