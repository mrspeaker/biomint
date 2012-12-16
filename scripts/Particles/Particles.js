var ParticleController = {
	particles: [],
	init: function() {
		this.particles = [];
	},
	create: function(pos) {
		var p = new Particles(pos, 100);
		this.particles.push(p);
		main.planet.worldMesh.add(p.particles);
	},
	tick: function() {
		this.particles = this.particles.filter(function(p){
			var remove = !p.tick();
			if(remove) {
				main.planet.worldMesh.remove(p.particles);
			}
			return !remove;
		});
	}
}

var Particles = Class.extend({
	particles: null,
	remove: false,
	init: function(pos, life) {
		this.pos = pos;
		this.life = life || 100;
		this.create();
	},
	create: function() {
		var colors = [],
			geometry = new THREE.Geometry();

		for ( i = 0; i < 100; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = this.pos.x;
			vertex.y = this.pos.y;// + (Math.random() - 0.5);
			vertex.z = this.pos.z;// + (22 * Math.random() - 1);

			geometry.vertices.push( vertex );

			colors[ i ] = new THREE.Color( 0xffffff );
			colors[ i ].setHSV( i / 600, 1, 1 );

		}

		geometry.colors = colors;

		var material = new THREE.ParticleBasicMaterial( { size: 3, vertexColors: true, blending: THREE.AdditiveBlending,
    transparent: true } );
		material.color.setHSV( 1.0, 0.2, 0.8 );

		var particles = new THREE.ParticleSystem( geometry, material );
		particles.sortParticles = true;

		this.particles = particles;
	},

	tick: function() {

		for(var i = 0, j = this.particles.geometry.vertices.length; i < j; i++) {
			var vert = this.particles.geometry.vertices[i];
			vert.x += (Math.random() * 0.5) - 0.25;
			vert.y += (Math.random() * 0.5) - 0.25;
			vert.z += Math.random() * 0.25;
		}

		if(this.life-- <= 0) {
			this.remove = true;
		}
		return !this.remove;
	}
});
