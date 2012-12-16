var Planet = Class.extend({
	tiles: [],
	colors: [
		"#265b85", "#d2b394", "#c2a384", "#b2a374", "#a29364", "#928354", "#827344", 
		"#726334", "#625324", "#5b8234", "#4b7224", "#3b6214", "#2b5204"], // "#0000FF", "#FF0000", "#0000FF", "#FFFF00"],
	
	width: 60,
	height: 60,

	segments: 50,
	rings: 50,
	radius: 100,

	spinning: false,

	worldMesh: new THREE.Object3D(),

	entities: [],

	init: function() {
		this.createCanvas();

		this.reset();
	},

	reset: function() {

		var self = this;
		this.populate();
		

		this.renderTexture(function(tex){
			self.worldMesh.add(self.createPlanet(tex));
		});

		this.entities = [];

		// for(var i = 0; i < 20; i++) {
		// 	var e = new Rover(this, new THREE.Vector2(Math.random() * 360 - 180 | 0, Math.random() * 180 - 90 | 0));
		// 	this.add(e);
		// }

		// for(var i = -180; i < 180; i += 45) {
		// 	var col = i === -180 ? 0xFF0000 : i === 0 ? 0xFFFFFF : 0x555555;
		// 	var e = new Mine(this, new THREE.Vector2(i, 0), col);
		// 	this.add(e);
		// }
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
        var z = Math.random() * 1000;

		var n = new ClassicalNoise();   

		this.tiles = [];
		var resources = [];
		var max = -1000, min = 1000;
		for(var j = 0; j < this.height; j++){
			var row = [],
				resRow = [];
			for(var i = 0; i < this.width; i++){
				var val = Math.floor(Math.abs(n.noise(i * freq, j * freq, z)) * 500);
				if(val < min) min = val;
				if(val > max) max = val;

				if(val < 50) {
					val = 0;
				} else {
					val = Math.floor(val / 17);
				}

				if(val > this.colors.length - 1) { val = this.colors.length - 1;}
				var block = new Block(this, [i, j], val);
				row.push(block);

				val = Math.floor(Math.abs(n.noise(i * freq, j * freq, z)) * 500);
				resRow.push(val);
			}
			this.tiles.push(row);
			resources.push(row);
		}

		
	
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
	    }

	    this.worldMesh.rotation.y += 0.005;


		this.entities.forEach(function(ent){
			ent.tick();
		});

		var self = this;
		this.entities = this.entities.filter(function(ent){
			if(ent.remove) {
				self.remove(ent);
			}
			return !ent.remove;
		});

	},

	latLngToMap: function(pos) {
		var xcell = ((pos.x + 180 ) / 360) * this.width | 0,
			ycell = ((180 - (pos.y + 90)) / 180) * this.height | 0;

		return [xcell, ycell];
	},

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
			curY = 0,
			curX = 0;

		for(var j = -2; j <= 2; j++) {
			curY = j + ycell;
			for(var i = -2; i <= 2; i++) {
				curX = i + xcell;
				if(curY < 0 || curY > map.length - 1) continue;
				if(curX < 0 || curX > map[0].length - 1) continue;

				var damage = 0;
				if(i == 0 && j == 0) damage = 30;
				else if(Math.abs(i) == 1 || Math.abs(j) == 1) damage = 15;
				else damate = 8;
				map[curY][curX].addDamage(damage);
			}
		}
		//var block = this.tiles[mapRef[1]][mapRef[0]];
		
		//block.addDamage(30);
		
		this.updateTexture();
	},


	createCanvas: function() {
		var $canvas = $("<canvas></canvas>", {
				id: "tex"
			}),
			ctx = $canvas[0].getContext("2d");

		ctx.canvas.width = this.width * 10;
		ctx.canvas.height = this.height * 10;

		ctx.canvas.webkitImageSmoothingEnabled = false;
		ctx.canvas.imageSmoothingEnabled = false;

		this.ctx = ctx;

		$canvas.on("click", function(){
			main.planet.populate();
			main.planet.updateTexture();
		}).appendTo("#minimap");


		// Resourecs
		
	},

	updateTexture: function() {
		//this.populate();
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
				
				c.fillStyle = type;
				c.fillRect(x * w, y * h, w, h);
			}
		}

		var img = new Image(),
			self = this;
		img.onload = function(){
			var texture = new THREE.Texture(img, {});
			texture.needsUpdate = true;
			cb && cb(texture);
			$("#map").replaceWith(img);
		}
		img.src = c.canvas.toDataURL("image/png");

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