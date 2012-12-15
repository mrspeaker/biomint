var Entity = Class.extend({
	mesh: null,
	pos: null,
	altitude: 2.5,
	init: function(planet, color){
		this.radius = planet.radius;
		this.color = color || Math.random() * 0xffffff;

		this.pos = new THREE.Vector2(0, 0);
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(2, 5, 5),
		  new THREE.MeshLambertMaterial({color: this.color}));

		this.mesh.receiveShadow = true;
		this.mesh.castShadow = true;
		
		this.syncMesh();

		this.xspeed = Math.random() - 0.5;
		this.yspeed = Math.random() - 0.5;


		planet.add(this);
	},
	tick: function() {

		this.pos.x += this.xspeed;
		this.pos.y += this.yspeed;
		
		this.syncMesh();
	},
	syncMesh: function() {
		this.mesh.position = gfx.latLongToVec3(this.pos.y, this.pos.x, this.radius, this.altitude);
	}
});