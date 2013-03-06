var Trait = Class.extend({
	init: function() {},
	tick: function() {}
});

var TraitMoving = Trait.extend({
	init_behaviour: function() {
		this.xspeed = (Math.random() - 0.5) * 0.1;
		this.yspeed = (Math.random() - 0.5) * 0.1;
	},
	tick: function() {
		this.pos.x += this.xspeed;
		this.pos.y += this.yspeed;
		this.syncMesh();
	}
});

// TraitMesh
(function(){

	function createMesh(opts) {
		opts = opts || {};
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(opts.size || 2, 5, 5),
		  new THREE.MeshLambertMaterial({color: opts.color || this.color || 0xffffff }));

		//this.mesh.receiveShadow = true;
		//this.mesh.castShadow = true;
	};
	
	function syncMesh() {
		this.mesh.position = gfx.latLongToVec3(this.pos.y, this.pos.x, this.radius, this.altitude);
		this.mesh.lookAt(main.planet.worldMesh.position);
	}

	var TraitMesh = Trait.extend({
		init_behaviour: function(opts) {
			this.createMesh = this.createMesh || createMesh;
			this.syncMesh = syncMesh;

			this.createMesh(opts);
			this.syncMesh();
		}
	});

	window.TraitMesh = TraitMesh;
})();