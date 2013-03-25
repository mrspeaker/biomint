(function (Entity, TraitMesh, TraitMoving, TraitState) {

	"use strict";

	var Scout = Entity.extend({

		init: function (planet, pos, geo) {

			this._super(planet, pos);
			this.planet = planet;
			this.geo = geo;
			this.has([TraitMesh, TraitMoving, TraitState]);

		},

		init_post: function () {

			this._super();
			this.state.change("born");
			this.aimScout();
			this.xspeed *= 0.5;
			this.yspeed *= 0.5;
			this.altitude = 5;
			this.mesh.scale.set(3, 3, 3);

		},

		aimScout: function () {

			this.mesh.lookAt(new THREE.Vector3(0, 0, 0));

		},

		createMesh: function (opts) {

			this.mesh = window.main.models.scout.clone();
			this.mesh.children[0].material = new THREE.MeshLambertMaterial();

		},

		tick: function () {

			switch (this.state.current) {
			case "born":
				this.state.change("countdown");
				break;
			case "countdown":
				if (this.state.count === 700) {
					this.state.change("dead");
				}

				this.scan();
				this.aimScout();
				break;
			case "dead":
				if (this.state.count === 0) {
					this.remove = true;
				}
				break;
			}
			this._super();

		},

		scan: function () {

			var val = this.planet.getBlockFromPos(this.pos, true),
				maxColor = 120, // green in HSL
				color = ((100 - val) / 100) * maxColor;

			this.mesh.children[0].material.color = new THREE.Color().setHSL(color / 360, 0.75, 0.50);

		}

	});

	window.Scout = Scout;

}(Entity, TraitMesh, TraitMoving, TraitState));
