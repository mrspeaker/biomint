(function () {

	"use strict";

	var utils = {
		neighbours: function (radius, cb, onlyOuterRing) {
			var j, i;
			for(j = -radius; j <= radius; j++) {
				for(i = -radius; i <= radius; i++) {
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
	};

	window.utils = utils;

}());