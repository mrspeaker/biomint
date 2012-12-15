var targetYRotation = targetXRotation = 0,
	targetYRotationOnMouseDown = targetXRotationOnMouseDown = 0,
	mouseX = 0, mouseY = 0,
	mouseXOnMouseDown = 0,
	windowHalfX = window.innerWidth / 2,
	windowHalfY = window.innerHeight / 2;
	

var input = {
	init: function(){
		function MouseWheelHandler(e) {
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			gfx.camera.position.z += delta * 10;
		}
		document.addEventListener("mousewheel", MouseWheelHandler, false);
		document.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
		
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		// document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		// document.addEventListener( 'touchmove', onDocumentTouchMove, false );

		var self = this;
		$(document).on("click", function(e){
			e.preventDefault();
			self.onClick(e);
		});
	},
	onClick: function(e){
		    if(Math.abs(targetYRotation - planet.worldMesh.rotation.y) > 0.2 ||
		    	Math.abs(targetXRotation - planet.worldMesh.rotation.x) > 0.2) {
		    	return;
		    }

		    // TODO: not quite relative to screen...
			var vector = new THREE.Vector3((e.clientX / gfx.WIDTH) * 2 - 1, - (e.clientY / gfx.HEIGHT) * 2 + 1, 0.5);
		    
		    gfx.projector.unprojectVector(vector, gfx.camera);
		    var ray = new THREE.Ray(gfx.camera.position, vector.subSelf(gfx.camera.position).normalize()),
		    	intersects = ray.intersectObjects(planet.worldMesh.children);

		    if(!intersects.length) {
		    	return;
		    }
			// //determine faceNr and id
			// var faceNr = -1;
			// var FC = intersects[0].face;
			// var fc;
			// var geo = intersects[0].object.geometry;
			// if (!geo) {return console.log('nothing');}
			// for (var f = 0; f < geo.faces.length; ++f) {
			//     fc = geo.faces[f];
			//     if (FC.a===fc.a && FC.b===fc.b && FC.c===fc.c && FC.d===fc.d) {
			//         faceNr = f;
			//         break;
			//     }
			// }

			intersects[0].face.color = new THREE.Color(0xf2e6e1);
			intersects[0].object.geometry.colorsNeedUpdate = true;

			console.log(intersects[0].face)

			planet.updateTexture();

			var cube = new THREE.Mesh( new THREE.CubeGeometry( 10, 10, 10 ), new THREE.MeshNormalMaterial() );
			var pos = THREE.Vector3();


 			//pos.copy(intersects[0].face.normal );

			//pos//.add( intersector.point, intersector.object.matrixRotationWorld.multiplyVector3( tmpVec ) );

			
			//cube.z;

 			
 			//THREE.GeometryUtils.merge(planet.mesh.geometry, cube);

 		// 	//cube.position.copy(pos);
 		// 	cube.position = intersects[0].face.normal
			// //cube.matrixAutoUpdate = false;
			// //cube.updateMatrix();
 		// 	//gfx.scene.add(cube);
 		// 	planet.worldMesh.add(cube);
			
 		// 	//THREE.GeometryUtils.merge(geometry, otherGeometry);
 			//THREE.GeometryUtils.merge(planet.mesh.geometry, cube);
 			//gfx.scene.add(cube);

	}
};


function onDocumentMouseDown( event ) {
	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseXOnMouseDown = event.clientX - windowHalfX;
	mouseYOnMouseDown = event.clientY - windowHalfY;
	targetYRotationOnMouseDown = targetYRotation;
	targetXRotationOnMouseDown = targetXRotation;
}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;

	targetYRotation = targetYRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
	targetXRotation = targetXRotationOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.02;

}

function onDocumentMouseUp(event) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut(event) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentTouchStart( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;
	}
}

function onDocumentTouchMove( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
	}
}
