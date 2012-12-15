var gfx = {
	WIDTH: 0,
	HEIGHT: 0,
	init: function() {
		// set the scene size
		this.WIDTH = window.innerWidth - 10,
		this.HEIGHT = window.innerHeight - 10;

		// set some camera attributes
		var VIEW_ANGLE = 45,
			ASPECT = this.WIDTH / this.HEIGHT,
			NEAR = 0.1,
			FAR = 10000;

		// create a WebGL renderer, camera
		// and a scene
		this.renderer = new THREE.WebGLRenderer({ clearColor: 0x181111, clearAlpha: 1});
		this.scene = new THREE.Scene();
		this.sceneAtmosphere = new THREE.Scene();
		this.projector = new THREE.Projector();
		this.camera = new THREE.PerspectiveCamera(
			    VIEW_ANGLE,
			    ASPECT,
			    NEAR,
			    FAR);

		this.scene.add(this.camera);
		this.camera.position.z = 350;

		this.scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.000025 );
		var ambientLight = new THREE.AmbientLight( 0x111111 );
		this.scene.add( ambientLight );


		this.addStars();

		// start the renderer
		this.renderer.setSize(this.WIDTH, this.HEIGHT);
		this.renderer.autoClear = false;
		this.renderer.sortObjects = false;


		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;

		this.renderer.shadowCameraNear = 3;
		this.renderer.shadowCameraFar = this.camera.far;
		this.renderer.shadowCameraFov = 50;

		this.renderer.shadowMapBias = 0.0039;
		this.renderer.shadowMapDarkness = 0.5;
		this.renderer.shadowMapWidth = 1024;
		this.renderer.shadowMapHeight = 1024;

		document.body.appendChild(this.renderer.domElement);

		this.addLight();
	},
	// convert the positions from a lat, lon to a position on a sphere.
    latLongToVec3: function(lat, lon, radius, height) {
    	//x = R * cos(lat) * cos(lon)
		//y = R * cos(lat) * sin(lon)
		//z = R *sin(lat)
		
    	height = height || 1;
        var phi =  lat * (Math.PI / 180),
        	theta = (lon - 180) * (Math.PI / 180);
 
        var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
        var y = (radius+height) * Math.sin(phi);
        var z = (radius+height) * Math.cos(phi) * Math.sin(theta);
 
        return new THREE.Vector3(x,y,z);
    },
    vec3ToLatLong: function(vec, radius, height) {
    	height = height || 1;
		var lat = 90 - (Math.acos(vec.y / (radius+height))) * 180 / Math.PI;
		var lng = ((270 + (Math.atan2(vec.x , vec.z)) * 180 / Math.PI) % 360) - 180;
    	return new THREE.Vector2(lng, lat);
    },
    // vec3ToLatLong2: function(vec, radius) {
    // 	var polar:Vector2;

    // 	    //calc longitude
    // 	    polar.y = Mathf.Atan2(point.x,point.z);

    // 	    //this is easier to write and read than sqrt(pow(x,2), pow(y,2))!
    // 	    var xzLen = Vector2(point.x,point.z).magnitude; 
    // 	    //atan2 does the magic
    // 	    polar.x = Mathf.Atan2(-point.y,xzLen);

    // 	    //convert to deg
    // 	    polar *= Mathf.Rad2Deg;

    // 	    return polar;
    // },
	resize: function() {},
	render: function() {
		this.renderer.clear();
    	this.renderer.render(this.scene, this.camera);
    	this.renderer.render(this.sceneAtmosphere, this.camera); 
	},
	addStars: function() {
		// stars

		var radius = 70, i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

		for ( i = 0; i < 250; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1;
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			vertex.multiplyScalar( r );

			starsGeometry[ 0 ].vertices.push( vertex );

		}

		for ( i = 0; i < 1500; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1;
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			vertex.multiplyScalar( r );

			starsGeometry[ 1 ].vertices.push( vertex );

		}

		var stars;
		var starsMaterials = [
			new THREE.ParticleBasicMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
		];

		for ( i = 10; i < 30; i ++ ) {

			stars = new THREE.ParticleSystem( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

			stars.rotation.x = Math.random() * 6;
			stars.rotation.y = Math.random() * 6;
			stars.rotation.z = Math.random() * 6;

			s = i * 10;
			stars.scale.set( s, s, s );

			stars.matrixAutoUpdate = false;
			stars.updateMatrix();

			this.scene.add( stars );

		}

	},
	addLight: function() {
		// create a point light
		var pointLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
		pointLight.position.x = -10;
		pointLight.position.y = 0;
		pointLight.position.z = 10;

		pointLight.castShadow = true;
		// add to the scene
		this.scene.add(pointLight);

	}
}