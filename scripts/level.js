var Level = Class.extend({
	tool: "",
	planet: null,
	init: function(planet){
		this.planet = planet;
		this.changeTool("search");
	},
	changeTool: function(tool) {
		this.tool = tool;
		console.log("Chagnged tool to ", tool)
	},
	useTool: function(xcell, ycell, xpos, ypos) {
		if(this.tool === "search") {
			var col = 0xFFFF00;
			var e = new Entity(this, col);
			e.pos = new THREE.Vector2(xpos, ypos);
			e.xspeed = 0;
			e.yspeed = 0;
		}
		if(this.tool === "mine") {
			this.planet.tiles[ycell][xcell] = this.planet.tiles[ycell][xcell] === 1 ? 0 : 1;
			this.planet.updateTexture();
		}
	},
});