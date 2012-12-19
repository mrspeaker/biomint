var Rig = Entity.extend({
	init: function(planet, pos) {
		this._super(planet, pos);
		this.planet = planet;
		this.has([TraitMesh, TraitState]);
	},
	init_post: function() {
		this._super();
		this.state.change("born");
	},
	tick: function() {
		switch(this.state.current) {
			case "born":
				this.state.change("center");
				break;
			case "center":
				if(this.state.count === 100) {
					
					this.checkPos(this.pos);

					this.mesh.scale.multiplyScalar(2);
					audio.get("pulse").backPlay();
					this.state.change("middle");
				}
				break;
			case "middle":
				if(this.state.count === 100) {
					var mapRef = this.planet.latLngToMap(this.pos),
						xcell = mapRef[0],
						ycell = mapRef[1],
						curY = 0,
						curX = 0;

					for(var j = -2; j <= 2; j++) {
						curY = j + ycell;
						for(var i = -2; i <= 2; i++) {
							curX = i + xcell;
							
							this.checkCell([curX, curY]);
						}
					}
					
					audio.get("pulse").backPlay();
					this.mesh.scale.multiplyScalar(1.5);

					this.planet.updateTexture();
					this.state.change("outer");
				}
				break;
			
			case "outer":
				if(this.state.count === 100) {
					// Copy pasta form above
					var mapRef = this.planet.latLngToMap(this.pos),
						xcell = mapRef[0],
						ycell = mapRef[1],
						curY = 0,
						curX = 0

					for(var j = -4; j <= 4; j++) {
						curY = j + ycell;
						for(var i = -4; i <= 4; i++) {
							curX = i + xcell;
							
							this.checkCell([curX, curY]);
						}
					}

					// var fin = Math.floor(this.haul * 9000);
					// if(fin === 0) {
					// 	audio.get("error").backPlay();
					// 	main.flashMessage("No minerals here! Only deploy on exposed minerals.");
					// } else {
					// 	audio.get("win").backPlay();
					// 	main.addCash(fin);
					// 	main.flashMessage("Expedition haul: $" + fin);
					// }
					
					this.planet.updateTexture();
					this.state.change("dead");
				}
				break;

			case "dead":
				if(this.state.count === 0) {
					this.remove = true;
				}
				break;
		}
		this._super();
	},

	checkPos: function(pos) {
		// Mine it... go to next rign
		var block = this.planet.getTileFromPos(pos, false);

		if(block.isWater) {
			block.unearth();
		}
	},
	// Copypasta from above...
	checkCell: function(tile) {
		// Mine it... go to next rign
		if(!this.planet.checkMapBounds(tile)) {
			return 0;
		}

		var block = this.planet.tiles[tile[1]][tile[0]];

		if(block.isWater) {
			block.unearth();
		}
	},

	createMesh: function(opts) {
		opts = opts || {};
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(opts.size || 4, 3, 3),
		  new THREE.MeshLambertMaterial({color: 0x00ffff }));
	}
});