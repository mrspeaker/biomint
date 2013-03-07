var utils = {
	neighbours: function(radius, cb, onlyOuterRing) {
		for(var j = -radius; j <= radius; j++) {
			for(var i = -radius; i <= radius; i++) {
				if(onlyOuterRing && (Math.abs(i) !== radius && Math.abs(j) !== radius)){
					continue;
				}
				cb && cb(i, j);
			}
		}
	},
	lookAwayFrom: function(me, target) {
		var v = new THREE.Vector3();
		v.subVectors(me.position, target.position).add(me.position);
		me.lookAt(v);
	}
}