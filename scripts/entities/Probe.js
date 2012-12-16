var Probe = Entity.extend({
	init: function(planet, pos, col) {
		this._super(planet, pos);
		this.has([TraitMesh]);
	},
	createMesh: function(opts) {
		opts = opts || {};
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(opts.size || 2, 5, 5),
		  new THREE.MeshLambertMaterial({color: opts.color || this.color || 0xffff00 }));
	}
});