var Entity = Class.extend({
	mesh: null,
	pos: null,
	altitude: 2.5,
	init: function(planet){
		this.radius = planet.radius;
		this.color = Math.random() * 0xffffff;

		this.pos = new THREE.Vector2(-20, -120);
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(2, 5, 5),
		  new THREE.MeshLambertMaterial({color: this.color}));

		this.mesh.receiveShadow = true;
		this.mesh.castShadow = true;
		
		this.syncMesh();

		planet.add(this);
	},
	tick: function() {
		this.pos.x += 0.1;
		this.pos.y += 0.2;
		
		this.syncMesh();
	},
	syncMesh: function() {
		this.mesh.position = gfx.latLongToVec3(this.pos.x, this.pos.y, this.radius, this.altitude);
	}
});