var Planet = Class.extend({
	tiles: [],
	colors: ["#265b85", "#d2b394"],
	
	width: 60,
	height: 60,

	segments: 50,
	rings: 50,
	radius: 100,

	spinning: false,

	worldMesh: new THREE.Object3D(),

	entities: [],

	init: function() {
		var self = this;
		this.populate();
		
		this.createCanvas();
		this.renderTexture(function(tex){
			self.worldMesh.add(self.createPlanet(tex));
		});

		this.reset();
	},

	reset: function() {
		this.entities = [];

		for(var i = 0; i < 100; i++) {
			var e = new Entity(this);
			e.pos = new THREE.Vector2(Math.random() * 180 - 90 | 0, Math.random() * 360 - 180 | 0);
		}
	},

	add: function(ent) {
		this.entities.push(ent);
		this.worldMesh.add(ent.mesh);
	},

	populate: function() {

		var inc = 0;
        var freq = 1/13;
        var  z = Math.random() * 1000;

		var n = new ClassicalNoise();   

		this.tiles = [];
		for(var j = 0; j < this.height; j++){
			var row = [];
			for(var i = 0; i < this.width; i++){
				var val = Math.floor(Math.abs(n.noise(i * freq, j * freq, z)) * 500);
				row.push(val > 100 ? 0 : 1);
			}
			this.tiles.push(row);
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

		if(Math.abs(targetYRotation - main.planet.worldMesh.rotation.y) > 0.2 ||
	    	Math.abs(targetXRotation - main.planet.worldMesh.rotation.x) > 0.2) {
	    	this.spinning = true;
	    } else {
	    	this.spinning = false;
	    }

	    this.worldMesh.rotation.y += 0.005;


		this.entities.forEach(function(ent){
			ent.tick();
		})
	},

	clicked: function(geo) {
		// geo.face.color = new THREE.Color(0xf2e6e1);
		// geo.object.geometry.colorsNeedUpdate = true;

		var ring = Math.floor((geo.faceIndex / this.rings) *(this.width/this.rings)), 
			segment = Math.floor((geo.faceIndex % this.segments) * (this.width/this.segments));


		this.tiles[ring][segment] = this.tiles[ring][segment] === 1 ? 0 : 1;

		console.log(ring, segment)

		this.updateTexture();
		
	},

	createCanvas: function() {
		var c = $("<canvas></canvas>", {
			id: "tex"
		})[0].getContext("2d");

		c.canvas.width = this.width * 10;
		c.canvas.height = this.height * 10;

		c.canvas.webkitImageSmoothingEnabled = false;
		c.canvas.imageSmoothingEnabled = false;

		this.ctx = c;

		$("body").append(c.canvas);
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
				var tile = this.tiles[y][x];
				var type = this.colors[tile];
				
				c.fillStyle = type;
				c.fillRect(x * w, y * h, w, h);
			}
		}

		var img = new Image(),
			self = this;
		img.onload = function(){
			var texture = new THREE.Texture(img, {});
			texture.needsUpdate = true;
			cb(texture);
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