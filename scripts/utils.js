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

		},

		flashMessage: function (msg) {

			var stat = $("#status");

			(function flash(count) {

				if (count >= 0) {
					stat.html(count % 2 === 0 ? msg : "");
					window.setTimeout(function () {

						flash(--count);

					}, 400);

				}

			}(6));

		}

	};

	window.utils = utils;

}());