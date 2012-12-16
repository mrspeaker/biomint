var Entity = Class.extend({
	mesh: null,
	pos: null,
	altitude: 2.5,
	behaviours: null,
	has: function(traits) {
		var self = this;
		traits.forEach(function(t){
			self.behaviours.push(t);
		});
	},
	init: function(planet, color){

		this.radius = planet.radius;
		this.color = color || Math.random() * 0xffffff;

		this.pos = new THREE.Vector2(0, 0);
		this.behaviours = [];
		
		this.createMesh();
		this.syncMesh();

		planet.add(this);
	},
	init_post: function() {
		for(var i = 0; i < this.behaviours.length; i++) {
			this.behaviours[i].init_behaviour.call(this);
		}
	},
	createMesh: function() {
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(2, 5, 5),
		  new THREE.MeshLambertMaterial({color: this.color}));

		this.mesh.receiveShadow = true;
		this.mesh.castShadow = true;
	},
	tick: function() {
		for(var i = 0; i < this.behaviours.length; i++) {
			this.behaviours[i].tick.call(this);
		}
	},
	syncMesh: function() {
		this.mesh.position = gfx.latLongToVec3(this.pos.y, this.pos.x, this.radius, this.altitude);
	}
});
