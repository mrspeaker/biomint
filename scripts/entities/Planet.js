var Planet = Class.extend({
	tiles: [],
	colors: [0x265b85, 0xd2b394],
	width: 50,
	height: 50,
	populate: function() {

		var inc = 0;
        var freq = 1/13;
        var  z = Math.random() * 1000;

		var n = new ClassicalNoise();   

		for(var j = 0; j < this.height; j++){
			var row = [];
			for(var i = 0; i < this.height; i++){
				var val = Math.floor(Math.abs(n.noise(i * freq, j * freq, z)) * 500);
				row.push(val > 100 ? 0 : 1);
			}
			this.tiles.push(row);
		}
		console.log(this.tiles);
	},
	tick: function() {
		this.mesh.rotation.y += 0.0005;

		var rotx = ( targetXRotation - poop.rotation.x ) * 0.01;
		if(Math.abs(rotx) < 0.001) {
			rotx = 0;
			targetXRotation = 0;
 		}
		poop.rotation.x += rotx;
		poop.rotation.y += ( targetYRotation - poop.rotation.y ) * 0.03;
		
		targetXRotation *= 0.95;
		if(Math.abs(targetXRotation - poop.rotation.x) > 0.001) {
			targetXRotation *= 0.9
		} else {
			targetXRotation  = 0;
			targetXRotation = poop.rotation.x;
		}
	},
	createPlanet: function() {
		// set up the sphere vars
		var radius = 100,
		    segments = this.width,
		    rings = this.height;

	    // create the sphere's material
	    var sphereMaterial = new THREE.MeshLambertMaterial({
	          color: 0xd4be92,
	          vertexColors: THREE.FaceColors,
	          blending: THREE.AdditiveBlending
	        });

		// create a new mesh with sphere geometry
		var sphereGeo = new THREE.SphereGeometry(
		    	radius,
		    	segments,
		    	rings),
			sphere = new THREE.Mesh(
				sphereGeo,
		  		sphereMaterial
		  	);	

		var self = this;
		sphere.geometry.faces.forEach(function(f, i){
			//f.color.setHex(map.tilesMath.random()*0xffffff);
			var row = ~~(i / self.width),
				col = i % self.width;
			f.color.setHex(self.colors[self.tiles[row][col]]);
		});


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
                          "float intensity = pow( 0.9 - dot( vNormal, vec3( 0.0, 0.0, 0.2 ) ), 10.0 );",
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