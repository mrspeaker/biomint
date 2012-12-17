var Level = Class.extend({
	tool: "",
	tools: {
		"none": { name: "None", help: "Behold the earth, and its unlimited bounty!"},
		"search": { name: "None", cost: 130000, help: "Deploy scouts to probe for opportunties."},
		"explode": { name: "None", cost: 25600, help: "Blow up some dirt. Blow up ALL the dirt!"},
		"collect": { name: "None", cost: 270000, help: "Once you've uncovered it, you have to mine it."}
	},
	planet: null,
	init: function(planet){
		this.planet = planet;
		this.changeTool("none");
	},
	changeTool: function(tool) {
		audio.get("button2").backPlay();
		this.tool = tool;
		var cur = this.tools[tool]
		var msg = cur.help;
		if(cur.cost) msg += " <span class='cost'>-$" + cur.cost + "</span>";
		$("#status").html(msg);
	},
	useTool: function(xcell, ycell, xpos, ypos) {
		var cur = this.tools[this.tool];
	
		if(this.tool === "search") {
			audio.get("scout").backPlay();
			var col = 0xFFFF00;
			this.planet.add(new Scout(this.planet, new THREE.Vector2(xpos, ypos), col));
			main.addCash(-cur.cost);
		}

		if(this.tool === "explode") {
			audio.get("bomb").backPlay();
			this.planet.add(new Explosive(this.planet, new THREE.Vector2(xpos, ypos)));	
			main.addCash(-cur.cost);
		}

		if(this.tool === "collect") {
			var current = this.planet.tiles[ycell][xcell];
			if(current === 1) {
				main.addCash(-cur.cost)

				this.planet.tiles[ycell][xcell] = 0;
				this.planet.updateTexture();
			} 
		}

		if(this.tool === "collect") {
			audio.get("scout").backPlay();
			this.planet.add(new Rover(this.planet, new THREE.Vector2(xpos, ypos)));
			main.addCash(-cur.cost);
		}
	},
});