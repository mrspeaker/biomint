var Scout = Entity.extend({
	init: function(planet, pos, geo) {
		this._super(planet, pos);
		this.geo = geo;
		this.planet = planet;
		this.has([TraitMesh, TraitMoving, TraitState]);
	},
	init_post: function() {
		this._super();
		this.aimScout();
		this.state.change("born");
		this.xspeed *= 0.5;
		this.yspeed *= 0.5;
		this.altitude = 5;
		this.mesh.scale.set(3,3,3);
	},
	aimScout: function() {
		this.mesh.lookAt(new THREE.Vector3(0,0,0));
		//this.mesh.rotation.x += 90 * (Math.PI / 180);
	},
	createMesh: function(opts) {
		opts = opts || {};
		var size = opts.size || 2;

		this.mesh = main.models.scout.clone();
		this.mesh.children[0].material = new THREE.MeshLambertMaterial();

		console.log(this.mesh)
		return;
		this.mesh = new THREE.Mesh(
		  
		  //new THREE.SphereGeometry(opts.size || 2, 5, 5),
		  //g.topRad, g.botRad, g.height, g.radSegs, g.heightSegs
		  //new THREE.CylinderGeometry(0, size * 2, 200, 5, 5 ),
		  new THREE.CubeGeometry(3, 3, 10 , 1, 1, 1),
		  //new THREE.PlaneGeometry(1000, 1000, 5, 5),
		  //new THREE.TetrahedronGeometry(15, 0),
		  new THREE.MeshLambertMaterial({color: 0x00eeee })
		  //new THREE.MeshBasicMaterial( { color: 0xffff00})
		);	

		//this.mesh.rotation.x = 90;//Math.random() * 200 - 100;
		
		//this.mesh.lookAt(this.geo.face.normal);
		
		//this.mesh.rotation = this.geo.face.normal.clone();
		console.log(this.mesh);//.rotateY(90);
		//this.mesh.rotation.x += 90 * Math.PI / 180;

	},
	tick: function() {
		switch(this.state.current) {
			case "born":
				this.state.change("countdown");
				break;
			case "countdown":
				if(this.state.count === 700) {
					this.state.change("dead");
				}

				this.scan();
				this.aimScout();
				break;
			case "dead":
				if(this.state.count === 0) {
					this.remove = true;
				}
				break;
		}
		this._super();
	},
	scan: function() {
		var val = this.planet.getBlockFromPos(this.pos, true);
		var maxColor = 120; // green
		var color = ((100 - val) / 100) * maxColor;
		console.log(color);
		this.mesh.children[0].material.color = new THREE.Color().setHSL(color/360, 0.75, 0.50) ;
		
		//val /= 100;
		//val *= 300;

		//this.mesh.scale.x = 0.5 + val;
		//this.mesh.scale.y = 0.5 + val;
		
	}
});