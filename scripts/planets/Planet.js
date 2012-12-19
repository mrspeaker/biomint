var Planet = Class.extend({
	tiles: [],
	resources: [],

	colors: [
		"#265b85", "#d2b394", "#c2a384", "#b2a374", "#a29364", "#928354", "#827344", 
		"#726334", "#625324", "#5b8234", "#4b7224", "#3b6214", "#2b5204"], // "#0000FF", "#FF0000", "#0000FF", "#FFFF00"],
	
	width: 100,
	height: 100,

	segments: 50,
	rings: 50,
	radius: 100,

	spinning: false,

	worldMesh: new THREE.Object3D(),

	entities: [],

	init: function() {
		this.createCanvas();

		this.populate();
		var self = this;
		this.renderTexture(function(tex){
			self.worldMesh.add(self.createPlanet(tex));
		});
	},

	reset: function() {

		
		this.populate();
		
		this.updateTexture();
		
		var self = this;
		this.entities = this.entities.filter(function(e){
			self.remove(e);
			return false;
		});

	},

	add: function(ent) {
		this.entities.push(ent);
		this.worldMesh.add(ent.mesh);
	},

	remove: function(ent) {
		this.worldMesh.remove(ent.mesh);
	},

	populate: function() {

		var inc = 0;
        var freq = 1/18;
        var resfreq = 1/10;
        var z = Math.random() * 1000;

		var n = new ClassicalNoise();   

		this.tiles = [];
		var resources = [];
		var nonEmptyResources = [];
		for(var j = 0; j < this.height; j++){
			var row = [],
				resRow = [];
			for(var i = 0; i < this.width; i++){
				var val = Math.floor(Math.abs(n.noise(i * freq, j * freq, z)) * 500);

				if(val < 50) {
					val = 0;
				} else {
					val = Math.floor(val / 17);
				}

				if(val > this.colors.length - 1) { val = this.colors.length - 1;}
				var block = new Block(this, [i, j], val);
				row.push(block);

				// Resources
				val = Math.floor(Math.abs(n.noise(i * resfreq, j * resfreq, z)) * 300);
				if(val < 85) val = 0;
				if(val != 0) nonEmptyResources.push(val);
				resRow.push(val);
			}
			this.tiles.push(row);
			resources.push(resRow);
		}

		// Normalize resources - 1 to 100
		var min = Math.min.apply(null, nonEmptyResources),
			max = Math.max.apply(null, nonEmptyResources),
			range = max - min;
		this.resources = resources.map(function(row){
			return row.map(function(cell){
				if(cell == 0) return 0;	
				return Math.floor(((cell - min) / range) * 100);
			});
		});

	},

	tick: function() {
		// Todo - shouldn't process display stuff in tick
		if(!this.mesh) { return; }
		
		var rotx = ( targetXRotation - this.worldMesh.rotation.x ) * 0.01;
		if(Math.abs(rotx) < 0.001) {
			rotx = 0;
			targetXRotation = 0;
 		}
		this.worldMesh.rotation.x += rotx;
		this.worldMesh.rotation.y += ( targetYRotation - this.worldMesh.rotation.y ) * 0.03;
		
		targetXRotation *= 0.95;
		if(Math.abs(targetXRotation - this.worldMesh.rotation.x) > 0.001) {
			targetXRotation *= 0.9
		} else {
			targetXRotation  = 0;
			targetXRotation = this.worldMesh.rotation.x;
		}

		if(Math.abs(targetYRotation - main.planet.worldMesh.rotation.y) > 0.4 ||
	    	Math.abs(targetXRotation - main.planet.worldMesh.rotation.x) > 0.2) {
	    	this.spinning = true;
	    } else {
	    	this.spinning = false;
	    	// World spins on its own
	    	if(Math.abs(targetYRotation - main.planet.worldMesh.rotation.y) < 0.005) {
	    		targetYRotation = this.worldMesh.rotation.y - 0.005;
	    	}
	    }

	    // Update all the entities on the planet
		this.entities.forEach(function(ent){
			ent.tick();
		});

		// Remove anyone who's dead
		var self = this;
		this.entities = this.entities.filter(function(ent){
			if(ent.remove) {
				self.remove(ent);
			}
			return !ent.remove;
		});

		// Make the planet breathe a little
		var val = 0.02 * Math.abs(Math.sin(Date.now() / 4000));
		val = 0.98 + val;
		this.worldMesh.scale.x = val;
		this.worldMesh.scale.y = val;
		this.worldMesh.scale.z = val;

	},

	getBlockFromPos: function(pos, useResourcesNotPlanet) {
		var tilePos = this.latLngToMap(pos);
		return this.getBlockFromTile(tilePos, useResourcesNotPlanet);
	},
	getBlockFromTile: function(tile, useResourcesNotPlanet) {
		var map = useResourcesNotPlanet ? this.resources : this.tiles;

		if(!this.checkMapBounds(tile, useResourcesNotPlanet)){
			return null;
		}

		return map[tile[1]][tile[0]];

	},

	latLngToMap: function(pos) {
		var xcell = ((pos.x + 180 ) / 360) * this.width | 0,
			ycell = ((180 - (pos.y + 90)) / 180) * this.height | 0;

		return [xcell, ycell];
	},

	// mapToLatLng: function(xcell, ycell) {
	// 	//var xcell = ((pos.x + 180 ) / 360) * this.width,
	// 	//	  ycell = ((180 - (pos.y + 90)) / 180) * this.height;

	// 	var posx = xcell,
	// 		posy = ycell 

	// 	return new THREE.Vector2(posx, posy);
	// },

	clicked: function(geo, selected) {
		// WWWWW TTTTTT FFFFF?!
		// I AM A GODDDDD!
		var inv = new THREE.Matrix4().getInverse(geo.object.matrixRotationWorld.clone().rotateY(Math.PI));
		var rotatedPoint = inv.multiplyVector3(geo.point);
		var pos = gfx.vec3ToLatLong(rotatedPoint, this.radius);

		// Old way: from geo.face.
		// var ring = Math.floor((geo.faceIndex / this.rings) *(this.width/this.rings)), 
		// 	segment = Math.floor((geo.faceIndex % this.segments) * (this.width/this.segments));
		// this.tiles[ring][segment] = this.tiles[ring][segment] === 1 ? 0 : 1;

		var xpos = pos.x + 180,
			ypos = 180 - (pos.y + 90);

		var xcell = (xpos / 360) * this.width | 0,
			ycell = (ypos / 180) * this.height | 0;

		if(!selected) {
			this._downOn = [xcell, ycell];
		} else {
			if(xcell === this._downOn[0] && ycell === this._downOn[1]) {
				main.level.useTool(xcell, ycell, pos.x, pos.y);
			}
		}
		
	},

	explode: function(pos) {
		var mapRef = this.latLngToMap(pos),
			xcell = mapRef[0],
			ycell = mapRef[1],
			map = this.tiles,
			self = this;

		var unearthedEmtpy = 0,
			unearthedMinerals = 0;

		utils.neighbours(2, function(x, y){
			if(!self.checkMapBounds([x + xcell, y + ycell])){
				return;
			}
			
			var damage = 0;
			if(x == 0 && y == 0) damage = 30;
			else if(Math.abs(x) < 2 && Math.abs(y) < 2) damage = 15;
			else damage = 8;

			var block = map[y + ycell][x + xcell],
				wasUnearthed = block.unearthed;

			block.addDamage(damage);

			if(block.unearthed && !wasUnearthed) {
				if(block.mineralValue == 0) {
					unearthedEmtpy++;
				} else {
					unearthedMinerals++;
				}
			}
		});
		
		if(unearthedEmtpy > 0 && unearthedMinerals == 0) {
			this.badDigging();
		}
		
		this.updateTexture();
	},

	badDigging: function() {
		var digCost = 10000;
		main.addCash(-digCost);
		audio.get("error").backPlay();
		main.flashMessage("Exploratory drilling failed: share price drops.  <span class='cost'>-$" + digCost + "</span>");
	},

	collectBlock: function(block) {
		block.collected = true;
		this.updateTexture();
	},

	createCanvas: function() {
		var $canvas = $("<canvas></canvas>", {
				id: "tex"
			}),
			ctx = $canvas[0].getContext("2d");

		ctx.canvas.width = this.width * 5;
		ctx.canvas.height = this.height * 5;

		ctx.canvas.webkitImageSmoothingEnabled = false;
		ctx.canvas.imageSmoothingEnabled = false;

		this.ctx = ctx;

		$canvas.on("click", function(){
			//main.planet.populate();
			//main.planet.updateTexture();
		}).appendTo("#minimap");


		// Resourecs
		$canvas = $("<canvas></canvas>", {
				id: "resources"
			}),
			ctx = $canvas[0].getContext("2d");

		ctx.canvas.width = this.width * 5;
		ctx.canvas.height = this.height * 5;

		$canvas.appendTo("#minimap");
		
	},

	updateTexture: function() {
		var self = this;
		this.renderTexture(function(tex){
			self.mesh.material.map = tex
		});
	},

	renderTexture: function(cb) {
		var c = this.ctx,
			w = c.canvas.width / this.width | 0,
			h = c.canvas.height / this.height | 0;

		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {
				var block = this.tiles[y][x];
				
				var type = this.colors[block.height];

				if(block.unearthed){
					if(block.mineralValue < 5){
						type = "#444";
					} 
					else if(block.collected) {
						type = "#303030";
					}
					else {
						var lumin = (block.mineralValue * 0.5) + 50 | 0;
						type = "hsl(340,"+ lumin +"%, 70%)";
					}
				}
				if(block.isIce) {
					type = 	"#eee";
				}
				
				
				c.fillStyle = type;
				c.fillRect(x * w, y * h, w, h);
			}
		}

		function drawPolarCap() {
			var w = c.canvas.width,
				steps = w / 120,
				h = 100;

			c.beginPath();
			c.moveTo(0, 0);
			c.lineTo(w, 0);
			c.lineTo(w, h);

			for(var i = 120; i > 0; i--) {
				c.lineTo(i * steps, (h - 10) + (Math.random() * (h / 3)));
			}
			c.lineTo(0, h);
			c.lineTo(0, 0);
			var lingrad = c.createLinearGradient(0,0,0,h);
	    	lingrad.addColorStop(0, 'rgba(255,255,255,1)');
	    	lingrad.addColorStop(0.5, 'rgba(255,255,255,1)');
	    	lingrad.addColorStop(1, 'rgba(255,255,255,0.2)');
			c.fillStyle = lingrad;
			c.fill();
			c.closePath();	
		}
		
		drawPolarCap();
		c.save();
		c.translate(0, c.canvas.height);
		c.scale(1, -1);
		drawPolarCap();
		c.restore();


		var img = new Image(),
			self = this;
		img.onload = function(){
			var texture = new THREE.Texture(img, {});
			texture.needsUpdate = true;
			cb && cb(texture);
			$("#map").replaceWith(img);
		}
		img.src = c.canvas.toDataURL("image/png");

		/// Resourecs
		var c = $("#resources")[0].getContext("2d"),
			w = c.canvas.width / this.width | 0,
			h = c.canvas.height / this.height | 0;

		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {
				var block = this.resources[y][x];
				
				if(block == 0) {
					c.fillStyle = "rgba(0,0,0,0)";
				} else {
					c.fillStyle = "hsl(" + block + ", 80%, 50%)";
				}
				c.fillRect(x * w, y * h, w, h);
			}
		}

	},

	checkMapBounds: function (tile, useResourcesNotPlanet) {
		var map = useResourcesNotPlanet ? this.resources : this.tiles;

		if(tile[1] < 0 || tile[1] > map.length - 1 ||
			tile[0] < 0  || tile[0] > map[0].length - 1) {
			return false;
		}
		return true;
	},

	createPlanet: function(texture) {
		var sphereMaterial = new THREE.MeshLambertMaterial({
	          color: 0xd4be92,
	          map: texture
	        });

		var sphereGeo = new THREE.SphereGeometry(
		    	this.radius,
		    	this.segments,
		    	this.rings),
			sphere = new THREE.Mesh(
				sphereGeo,
		  		sphereMaterial
		  	);	
		
		var atmosphere = {
      			uniforms: {},

                  vertexShader: [
                      "varying vec3 vNormal;",
                      "void main() {",
                          "vNormal = normalize( normalMatrix * normal );",
                          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                      "}"
                  ].join("\n"),

                  fragmentShader: [
                      "varying vec3 vNormal;",
                      "void main() {",
                          "float intensity = pow( 0.95 - dot( vNormal, vec3( 0.0, 0.0, 0.2 ) ), 10.0 );",
                          "gl_FragColor = vec4( 0.3, 0.1, 0.1, 0.3 ) * intensity;",

                      "}"
                  ].join("\n")
    	};


		var shader = atmosphere,
		    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

	    material = new THREE.ShaderMaterial({

	          uniforms: uniforms,
	          vertexShader: shader.vertexShader,
	          fragmentShader: shader.fragmentShader,
	          side: THREE.BackSide

	        });

	    mesh = new THREE.Mesh(sphereGeo, material);
	    mesh.flipSided = true;
	    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.2;
	   	gfx.sceneAtmosphere.add(mesh);
			

    	sphere.castShadow = true;
    	sphere.receiveShadow = true;

		this.mesh = sphere;
		return sphere;
	}
});