var Rover = Entity.extend({
	init: function(planet, pos) {
		this._super(planet, pos);
		this.planet = planet;
		this.has([TraitMesh, TraitState]);
	},
	init_post: function() {
		this._super();
		this.state.change("born");
		this.haul = 0;
	},
	tick: function() {
		switch(this.state.current) {
			case "born":
				this.state.change("center");
				break;
			case "center":
				if(this.state.count === 100) {
					
					this.haul += this.checkPos(this.pos);

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
						curX = 0,
						val = 0;

					for(var j = -1; j <= 1; j++) {
						curY = j + ycell;
						for(var i = -1; i <= 1; i++) {
							curX = i + xcell;
							
							this.haul += this.checkCell([curX, curY]);
						}
					}
					
					audio.get("pulse").backPlay();
					this.mesh.scale.multiplyScalar(1.5);
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
						curX = 0,
						val = 0;

					for(var j = -2; j <= 2; j++) {
						curY = j + ycell;
						for(var i = -2; i <= 2; i++) {
							curX = i + xcell;
							
							this.haul += this.checkCell([curX, curY]);
						}
					}

					var fin = Math.floor(this.haul * 999);
					if(fin === 0) {
						main.flashMessage("No minerals here! Only deploy on exposed minerals.");
					} else {
						audio.get("win").backPlay();
						main.addCash(fin);
						main.flashMessage("Expedition haul: $" + fin);
					}
					
					
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
		var val = this.planet.getTileFromPos(pos, true),
			block = this.planet.getTileFromPos(pos, false);

		if(block.unearthed && !block.collected) {
			val -= 40;
			val /= 60;

			this.planet.collectBlock(block);
			return val;
		}
		return 0;
	},
	// Copypasta from above...
	checkCell: function(tile) {
		// Mine it... go to next rign
		if(!this.planet.checkMapBounds(tile)) {
			return 0;
		}

		var val = this.planet.resources[tile[1]][tile[0]],
			block = this.planet.tiles[tile[1]][tile[0]];

		if(block.unearthed && !block.collected) {
			//val -= 40;
			//val /= 60;

			this.planet.collectBlock(block);
			return val;
		}
		return 0;
	},

	createMesh: function(opts) {
		opts = opts || {};
		this.mesh = new THREE.Mesh(
		  new THREE.SphereGeometry(opts.size || 3, 5, 5),
		  new THREE.MeshLambertMaterial({color: 0x0000ff }));
	}
});