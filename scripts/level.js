var Level = Class.extend({
	tool: "",
	planet: null,
	init: function(planet){
		this.planet = planet;
		this.changeTool("none");
	},
	changeTool: function(tool) {
		this.tool = tool;
		console.log("Chagnged tool to ", tool)
	},
	useTool: function(xcell, ycell, xpos, ypos) {
		if(this.tool === "search") {
			var col = 0xFFFF00;
			this.planet.add(new Probe(this.planet, new THREE.Vector2(xpos, ypos), col));
		}

		if(this.tool === "explode") {
			this.planet.add(new Explosive(this.planet, new THREE.Vector2(xpos, ypos)));	
		}

		if(this.tool === "mine") {
			var current = this.planet.tiles[ycell][xcell];
			if(current === 1) {
				main.dollars += 270000;
				main.setCash();
				this.planet.tiles[ycell][xcell] = 0;
				this.planet.updateTexture();
			} 
		}
	},
});