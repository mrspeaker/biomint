var Extractor = Entity.extend({
	init: function(planet, pos) {
		this._super(planet, pos);
		this.planet = planet;
		this.has([TraitMesh, TraitState]);
	},
	init_post: function() {
		this._super();
		this.state.change("born");
		this.haul = 0;

		function lookAwayFrom(me, target) {
			var origin = new THREE.Vector3().subVectors(me.position, target.position);
			me.lookAt(new THREE.Vector3().addVectors(me.position, origin));
		}

		lookAwayFrom(this.mesh, this.planet.worldMesh);
    	//this.mesh.lookAwayFrom(this.planet.worldMesh);
		this.haul = 10000;

	},
	tick: function() {
		switch(this.state.current) {
			case "born":
				this.state.change("center");
				break;
			case "center":
				if(this.state.count === 100) {
					
					this.haul += this.checkHaulInRadius(0);
					
					this.mesh.scale.multiplyScalar(2);
					audio.get("pulse").backPlay();
					this.state.change("middle");
				}
				break;
			case "middle":
				if(this.state.count === 100) {

					this.haul += this.checkHaulInRadius(1);
					
					audio.get("pulse").backPlay();
					this.mesh.scale.multiplyScalar(1.5);
					this.state.change("outer");
				}
				break;
			
			case "outer":
				if(this.state.count === 100) {

					this.haul += this.checkHaulInRadius(2);
					
					// FIXME: move to planet/level
					var fin = Math.floor(this.haul * 9000);
					if(fin === 0) {
						audio.get("error").backPlay();
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

	checkHaulInRadius: function(radius) {
		var mapRef = this.planet.latLngToMap(this.pos),
			xcell = mapRef[0],
			ycell = mapRef[1],
			haul = 0,
			self = this;

		utils.neighbours(radius, function(x, y){
			haul += self.checkHaulAtTile([x + xcell, y + ycell]);
		}, true);

		return haul;
	},

	checkHaulAtTile: function(tile) {
		var val = this.planet.getBlockFromTile(tile, true);
			block = this.planet.getBlockFromTile(tile);

		if(block && block.unearthed && !block.collected) {
			this.planet.collectBlock(block);
			return val;
		}
		return 0;
	},

	createMesh: function(opts) {
		opts = opts || {};
		this.mesh = main.models.extractor.clone();
		// this.mesh = new THREE.Mesh(
		//   new THREE.SphereGeometry(opts.size || 3, 5, 5),
		//   new THREE.MeshLambertMaterial({color: 0x0000ff }));
	}
});