(function (Class) {

	"use strict";

	var ParticleController,
		Particles;

	ParticleController = {

		particles: [],

		init: function () {
			this.particles = [];
		},

		create: function (pos) {

			var p = new Particles(pos, 100);

			this.particles.push(p);
			window.main.level.planet.worldMesh.add(p.particles);

		},

		tick: function () {

			this.particles = this.particles.filter(function (p) {

				var remove = !p.tick();

				if (remove) {
					window.main.level.planet.worldMesh.remove(p.particles);
				}
				return !remove;

			});

		}

	};

	Particles = Class.extend({

		particles: null,
		remove: false,

		init: function (pos, life) {
			this.pos = pos;
			this.life = life || 100;
			this.create();
		},

		create: function () {

			var colors = [],
				geometry = new THREE.Geometry(),
				vertex,
				material,
				particles,
				i;

			for (i = 0; i < 100; i++) {
				vertex = new THREE.Vector3();
				vertex.x = this.pos.x;
				vertex.y = this.pos.y;
				vertex.z = this.pos.z;

				geometry.vertices.push(vertex);

				colors[i] = new THREE.Color(0xffffff);
				colors[i].setHSL(i / 360, 0.75, 0.5);
			}

			geometry.colors = colors;

			material = new THREE.ParticleBasicMaterial({
				size: 3,
				vertexColors: true,
				blending: THREE.AdditiveBlending,
				transparent: true
			});
			material.color.setHSL(0, 0.75, 0.5);

			particles = new THREE.ParticleSystem(geometry, material);
			particles.sortParticles = true;

			this.particles = particles;

		},

		tick: function () {

			var i,
				j,
				vert;

			for (i = 0, j = this.particles.geometry.vertices.length; i < j; i++) {
				vert = this.particles.geometry.vertices[i];
				vert.x += (Math.random() * 0.5) - 0.25;
				vert.y += (Math.random() * 0.5) - 0.25;
				vert.z += Math.random() * 0.25;
			}

			if (this.life-- <= 0) {
				this.remove = true;
			}
			return !this.remove;

		}
	});

	window.ParticleController = ParticleController;

}(Class));
