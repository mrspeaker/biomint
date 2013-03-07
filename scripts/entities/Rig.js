(function (utils, audio, Entity, TraitMesh, TraitState) {

	"use strict";

	var Rig = Entity.extend({

		init: function (planet, pos, geo) {
			this.geo = geo;
			this._super(planet, pos);
			this.planet = planet;
			this.has([TraitMesh, TraitState]);
		},

		init_post: function () {
			this._super();
			this.state.change("born");
		},

		tick: function () {
			switch (this.state.current) {
			case "born":
				this.state.change("center");
				break;
			case "center":
				if (this.state.count === 100) {
					this.unearthRadius(0);
					this.planet.sinkEarth(this.geo);
					this.mesh.scale.multiplyScalar(2);
					audio.get("pulse").backPlay();
					this.state.change("middle");
				}
				break;
			case "middle":
				if (this.state.count === 200) {
					this.unearthRadius(2);

					audio.get("pulse").backPlay();
					this.mesh.scale.multiplyScalar(1.5);
					this.planet.updateTexture();
					this.state.change("outer");
				}
				break;

			case "outer":
				if (this.state.count === 200) {
					this.unearthRadius(4);
					this.planet.updateTexture();
					this.state.change("dead");
				}
				break;
			case "dead":
				if (this.state.count === 0) {
					this.remove = true;
				}
				break;
			}
			this._super();
		},

		unearthRadius: function (radius) {
			var mapRef = this.planet.latLngToMap(this.pos),
				xcell = mapRef[0],
				ycell = mapRef[1],
				self = this;

			utils.neighbours(radius, function (x, y) {
				var tile = [x + xcell, y + ycell],
					block = self.planet.getBlockFromTile(tile);
				if (block && block.isWater) {
					block.unearth();
				}
			});
		},

		createMesh: function (opts) {
			opts = opts || {};
			this.mesh = new THREE.Mesh(
				new THREE.SphereGeometry(opts.size || 4, 3, 3),
				new THREE.MeshLambertMaterial({color: 0x00ffff})
			);
		}
	});

	window.Rig = Rig;

}(utils, audio, Entity, TraitMesh, TraitState));
