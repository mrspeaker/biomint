var Level = Class.extend({
	tool: "",
	tools: {
		"none": { help: "Behold the earth, and its unlimited bounty!"},
		"search": { cost: 130000, help: "Deploy scouts on the land to probe for opportunties."},
		"explode": { cost: 25600, help: "Scouts found something? Blow up some dirt! Click click!"},
		"collect": { cost: 270000, help: "Once you've uncovered it, you have to mine it."},
		"rig": { cost: 750000, help: "Scout in the deep blue sea: a costly affair."}
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
	useTool: function(xcell, ycell, xpos, ypos, geo) {
		var cur = this.tools[this.tool];
	
		if(this.tool === "search") {
			audio.get("scout").backPlay();
			this.planet.add(new Scout(this.planet, new THREE.Vector2(xpos, ypos), geo));
			main.addCash(-cur.cost);
		}

		if(this.tool === "explode") {
			audio.get("bomb").backPlay();
			this.planet.add(new Explosive(this.planet, new THREE.Vector2(xpos, ypos), geo));	
			main.addCash(-cur.cost);
		}

		if(this.tool === "collect") {
			audio.get("scout").backPlay();
			this.planet.add(new Extractor(this.planet, new THREE.Vector2(xpos, ypos)));
			main.addCash(-cur.cost);
		}

		if(this.tool === "rig") {
			var current = this.planet.tiles[ycell][xcell];
			if(current.isWater) {
				this.planet.add(new Rig(this.planet, new THREE.Vector2(xpos, ypos), geo));
				main.addCash(-cur.cost);
			} else {
				audio.get("error").backPlay();
				main.flashMessage("Rigs can only be deployed in the ocean.")
			}
		}
	},
});