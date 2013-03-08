(function (gfx) {

	"use strict";

	var mouseX = 0, mouseY = 0,
		mouseYOnMouseDown = 0,
		mouseXOnMouseDown = 0,
		targetYRotationOnMouseDown = 0,
		targetXRotationOnMouseDown = 0,
		targetRotationOnMouseDown = 0,
		targetRotation = 0,
		input;

	input = {

		targetYRotation: 0,
		targetXRotation: 0,

		init: function () {

			function MouseWheelHandler(e) {

				var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

				gfx.camera.position.z += delta * 10;

			}

			// FIXME: unmunge all this crap
			document.addEventListener("mousewheel", MouseWheelHandler, false);
			document.addEventListener("mousedown", onDocumentMouseDown, false);
			document.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
			// document.addEventListener( 'touchstart', onDocumentTouchStart, false );
			// document.addEventListener( 'touchmove', onDocumentTouchMove, false );

			var self = this;
			$(document).on("mousedown", function (e) {

				e.preventDefault();
				self.onDown(e);

			}).on("mouseup", function (e) {

				e.preventDefault();
				self.onUp(e);

			});

		},

		onUp: function (e) {

			var vector,
				ray,
				intersects;

			this.down = false;

			vector = new THREE.Vector3((e.clientX / gfx.WIDTH) * 2 - 1, -(e.clientY / gfx.HEIGHT) * 2 + 1, 0.5);
			gfx.projector.unprojectVector(vector, gfx.camera);

			ray = new THREE.Raycaster(gfx.camera.position, vector.sub(gfx.camera.position).normalize());
			intersects = ray.intersectObjects([window.main.level.planet.mesh]);


			if (!intersects.length) {
				return;
			}

			window.main.level.planet.clicked(intersects[0], true);

		},

		onDown: function (e) {

			var vector,
				ray,
				intersects;

			this.down = true;

			if (window.main.level.planet.spinning) {
				return;
			}

			vector = new THREE.Vector3((e.clientX / gfx.WIDTH) * 2 - 1, -(e.clientY / gfx.HEIGHT) * 2 + 1, 0.5);
			gfx.projector.unprojectVector(vector, gfx.camera);
			ray = new THREE.Raycaster(gfx.camera.position, vector.sub(gfx.camera.position).normalize());
			intersects = ray.intersectObjects([window.main.level.planet.mesh]);

			if (!intersects.length) {
				return;
			}

			window.main.level.planet.clicked(intersects[0], false);

		}

	};

	function onDocumentMouseDown(event) {

		event.preventDefault();

		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);
		document.addEventListener('mouseout', onDocumentMouseOut, false);

		mouseXOnMouseDown = event.clientX - gfx.HALF_W;
		mouseYOnMouseDown = event.clientY - gfx.HALF_H;
		targetYRotationOnMouseDown = input.targetYRotation;
		targetXRotationOnMouseDown = input.targetXRotation;

	}

	function onDocumentMouseMove(event) {

		mouseX = event.clientX - gfx.HALF_W;
		mouseY = event.clientY - gfx.HALF_H;

		input.targetYRotation = targetYRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
		input.targetXRotation = targetXRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;

	}

	function onDocumentMouseUp(event) {

		document.removeEventListener('mousemove', onDocumentMouseMove, false);
		document.removeEventListener('mouseup', onDocumentMouseUp, false);
		document.removeEventListener('mouseout', onDocumentMouseOut, false);

	}

	function onDocumentMouseOut(event) {

		document.removeEventListener('mousemove', onDocumentMouseMove, false);
		document.removeEventListener('mouseup', onDocumentMouseUp, false);
		document.removeEventListener('mouseout', onDocumentMouseOut, false);

	}

	function onDocumentTouchStart(event) {

		if (event.touches.length === 1) {
			event.preventDefault();
			mouseXOnMouseDown = event.touches[0].pageX - gfx.HALF_W;
			targetRotationOnMouseDown = targetRotation;
		}

	}

	function onDocumentTouchMove(event) {

		if (event.touches.length === 1) {
			event.preventDefault();
			mouseX = event.touches[0].pageX - gfx.HALF_W;
			targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;
		}

	}

	window.input = input;

}(gfx));
