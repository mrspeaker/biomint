(function (audio, utils, Class, Scout, Extractor, Rig, Explosive) {

	"use strict";

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

		init: function (planet) {

			this.planet = planet;
			this.changeTool("none");

		},

		reset: function () {

			this.planet.reset();

		},

		tick: function () {

			this.planet.tick();

		},

		changeTool: function (tool) {

			var cur = this.tools[tool],
				msg = cur.help;

			audio.get("button2").backPlay();
			this.tool = tool;
			if (cur.cost) {
				msg += " <span class='cost'>-$" + cur.cost + "</span>";
			}
			$("#status").html(msg);

		},

		useTool: function (xcell, ycell, xpos, ypos, geo) {

			var cur = this.tools[this.tool],
				cash = 0,
				currentTile,
				sound,
				ToolEntity;

			switch (this.tool) {
			case "search":
				sound = "scout";
				ToolEntity = Scout;
				cash = -cur.cost;
				break;

			case "explode":
				sound = "bomb";
				ToolEntity = Explosive;
				cash = -cur.cost;
				break;

			case "collect":
				sound = "scout";
				ToolEntity = Extractor;
				cur = -cur.cost;
				break;

			case "rig":
				currentTile = this.planet.tiles[ycell][xcell];
				if (currentTile.isWater) {
					sound = "scout";
					ToolEntity = Rig;
					cash = -cur.cost;
				} else {
					sound = "error";
					utils.flashMessage("Rigs can only be deployed in the ocean.");
				}
				break;
			}

			if (ToolEntity) {
				this.planet.add(new ToolEntity(this.planet, new THREE.Vector2(xpos, ypos), geo));
			}

			if (sound) {
				audio.get(sound).backPlay();
			}

			if (cash !== 0) {
				window.main.addCash(cash);
			}

		}

	});

	window.Level = Level;

}(audio, utils, Class, Scout, Extractor, Rig, Explosive));
