var Level = Class.extend({
	tool: "",
	tools: {
		"none": { name: "None", help: "Behold the earth, and it's unlimited bounty!"},
		"search": { name: "None", help: "Deploy scouts to probe for opportunties."},
		"explode": { name: "None", help: "Blow up some dirt. Blow up ALL the dirt!"},
		"collect": { name: "None", help: "Your treasure awaits you - take it!"}
	},
	planet: null,
	init: function(planet){
		this.planet = planet;
		this.changeTool("none");
	},
	changeTool: function(tool) {
		audio.get("button2").backPlay();
		this.tool = tool;
		$("#status").text(this.tools[tool].help)
	},
	useTool: function(xcell, ycell, xpos, ypos) {
		

		if(this.tool === "search") {
			audio.get("scout").backPlay();
			var col = 0xFFFF00;
			this.planet.add(new Scout(this.planet, new THREE.Vector2(xpos, ypos), col));
			main.addCash(-130000);
		}

		if(this.tool === "explode") {
			audio.get("bomb").backPlay();
			this.planet.add(new Explosive(this.planet, new THREE.Vector2(xpos, ypos)));	
			main.addCash(-25600);
		}

		if(this.tool === "collect") {
			var current = this.planet.tiles[ycell][xcell];
			if(current === 1) {
				main.addCash(270000)

				this.planet.tiles[ycell][xcell] = 0;
				this.planet.updateTexture();
			} 
		}
	},
});