(function (gfx, utils, audio, Class, Block, ClassicalNoise) {

	"use strict";

	var Planet = Class.extend({
		tiles: [],
		resources: [],

		colors: [
			"#265b85", "#d2b394", "#c2a384", "#b2a374", "#a29364", "#928354", "#827344",
			"#726334", "#625324", "#5b8234", "#4b7224", "#3b6214", "#2b5204"],

		width: 80,
		height: 80,

		segments: 50,
		rings: 50,
		radius: 100,

		spinning: false,

		worldMesh: new THREE.Object3D(),

		entities: [],

		polarCapPath: [],

		init: function () {
			this.createCanvas();
			this.makePolarCap();

			this.populate();

			var self = this;
			this.renderTexture(function (tex) {
				self.worldMesh.add(self.createPlanet(tex));

				// var len = self.mesh.geometry.vertices.length;
				// for (var i = 0; i < len; i++ ) {
				//	self.mesh.geometry.vertices[i].y += (Math.random() * 10 | 0) - 50;
				// }
				// self.mesh.geometry.verticesNeedUpdate = true;
			});
		},

		makePolarCap: function () {
			var i,
				path = [],
				w = this.ctx.canvas.width,
				h = 80,
				steps = w / 120,
				lingrad;

			path.push([0, 0]);
			path.push([w, 0]);
			path.push([w, h]);

			for (i = 120; i > 0; i--) {
				path.push([i * steps, (h - 10) + (Math.random() * (h / 3))]);
			}
			path.push([0, h]);
			path.push([0, 0]);

			this.polarCapPath = path;

			// Set the gradient
			lingrad = this.ctx.createLinearGradient(0, 0, 0, h);
			lingrad.addColorStop(0, 'rgba(255,255,255,1)');
			lingrad.addColorStop(0.5, 'rgba(255,255,255,1)');
			lingrad.addColorStop(1, 'rgba(255,255,255,0.2)');
			this.polarCapGradient = lingrad;
		},

		reset: function () {

			this.populate();

			this.updateTexture();

			this.resetPlanetGeometry();

			var self = this;
			this.entities = this.entities.filter(function (e) {
				self.remove(e);
				return false;
			});

		},

		add: function (ent) {
			this.entities.push(ent);
			this.worldMesh.add(ent.mesh);
		},

		remove: function (ent) {
			this.worldMesh.remove(ent.mesh);
		},

		populate: function () {
			var inc = 0,
				freq = 1 / 18,
				resfreq = 1 / 10,
				z = Math.random() * 1000,
				resources = [],
				nonEmptyResources = [],
				n = new ClassicalNoise(),

				i,
				j,
				row,
				resRow,
				val,
				block,

				min,
				max,
				range,
				o;

			this.tiles = [];

			for (j = 0; j < this.height; j++) {
				row = [];
				resRow = [];
				for (i = 0; i < this.width; i++) {
					val = Math.floor(Math.abs(n.noise(i * freq, j * freq, z)) * 500);

					if (val < 50) {
						val = 0;
					} else {
						val = Math.floor(val / 17);
					}

					if (val > this.colors.length - 1) { val = this.colors.length - 1; }
					block = new Block(this, [i, j], val);
					row.push(block);

					// Resources
					val = Math.floor(Math.abs(n.noise(i * resfreq, j * resfreq, z)) * 300);
					if (val < 85) {
						val = 0;
					}
					if (val !== 0) {
						nonEmptyResources.push(val);
					}
					resRow.push(val);
				}
				this.tiles.push(row);
				resources.push(resRow);
			}

			// Normalize resources - 1 to 100
			min = Math.min.apply(null, nonEmptyResources);
			max = Math.max.apply(null, nonEmptyResources);
			range = max - min;
			o = {};

			this.resources = resources.map(function (row) {
				return row.map(function (cell) {
					val = 0;
					if (cell !== 0) {
						val = Math.floor(((cell - min) / range) * 100);
					}
					o[val] = o[val] ? o[val] + 1 : 1;
					return val;
				});
			});
			console.log(o);
		},

		tick: function () {

			var self = this,
				rotx,
				mesh,
				breatheVal;

			// Todo - shouldn't process display stuff in tick
			if (!this.mesh) {
				return;
			}

			// This code wasn't even written under pressure. So embarassing.
			rotx = (input.targetXRotation - this.worldMesh.rotation.x) * 0.01;
			if (Math.abs(rotx) < 0.001) {
				rotx = 0;
				input.targetXRotation = 0;
			}
			this.worldMesh.rotation.x += rotx;
			this.worldMesh.rotation.y += (input.targetYRotation - this.worldMesh.rotation.y) * 0.03;

			input.targetXRotation *= 0.95;
			if (Math.abs(input.targetXRotation - this.worldMesh.rotation.x) > 0.001) {
				input.targetXRotation *= 0.9;
			} else {
				input.targetXRotation = this.worldMesh.rotation.x;
			}

			mesh = window.main.level.planet.worldMesh;
			if (Math.abs(input.targetYRotation - mesh.rotation.y) > 0.4 ||
					Math.abs(input.targetXRotation - mesh.rotation.x) > 0.2) {
				this.spinning = true;
			} else {
				this.spinning = false;
				// World spins on its own
				if (Math.abs(input.targetYRotation - mesh.rotation.y) < 0.005) {
					input.targetYRotation = this.worldMesh.rotation.y - 0.005;
				}
			}

			// Update all the entities on the planet
			this.entities.forEach(function (ent) {
				ent.tick();
			});

			// Remove anyone who's dead
			this.entities = this.entities.filter(function (ent) {
				if (ent.remove) {
					self.remove(ent);
				}
				return !ent.remove;
			});

			// Make the planet breathe a little
			breatheVal = 0.02 * Math.abs(Math.sin(Date.now() / 4000));
			breatheVal = 0.98 + breatheVal;
			this.worldMesh.scale.x = breatheVal;
			this.worldMesh.scale.y = breatheVal;
			this.worldMesh.scale.z = breatheVal;

		},

		checkMapBounds: function (tile, useResourcesNotPlanet) {
			var map = useResourcesNotPlanet ? this.resources : this.tiles;

			if (tile[1] < 0 || tile[1] > map.length - 1 ||
					tile[0] < 0  || tile[0] > map[0].length - 1) {
				return false;
			}
			return true;
		},

		getBlockFromPos: function (pos, useResourcesNotPlanet) {
			var tilePos = this.latLngToMap(pos);
			return this.getBlockFromTile(tilePos, useResourcesNotPlanet);
		},
		getBlockFromTile: function (tile, useResourcesNotPlanet) {
			var map = useResourcesNotPlanet ? this.resources : this.tiles;

			if (tile[0] < 0) { tile[0] = this.width + tile[0]; }
			tile[0] = tile[0] % this.width;
			if (tile[1] < 0) { tile[1] = this.height + tile[1]; }
			tile[1] = tile[1] % this.height;
			return map[tile[1]][tile[0]];

		},

		latLngToMap: function (pos) {
			var xcell = ((pos.x + 180) / 360) * this.width | 0,
				ycell = ((180 - (pos.y + 90)) / 180) * this.height | 0;

			return [xcell, ycell];
		},

		// mapToLatLng: function (xcell, ycell) {
		//	//var xcell = ((pos.x + 180 ) / 360) * this.width,
		//	//	  ycell = ((180 - (pos.y + 90)) / 180) * this.height;

		//	var posx = xcell,
		//		posy = ycell 

		//	return new THREE.Vector2(posx, posy);
		// },

		sinkEarth: function (geo) {
			var ring = Math.floor((geo.faceIndex / this.rings) * (this.width / this.rings)),
				segment = Math.floor((geo.faceIndex % this.segments) * (this.width / this.segments)),
				am = 1 - (Math.random() * 0.02);
			if (segment === 0 || segment === this.width) {
				// Edge piece - don't sink
				return;
			}
			//this.mesh.geometry.vertices[geo.face.a].multiplyScalar(am);
			this.mesh.geometry.vertices[geo.face.b].multiplyScalar(am);
			this.mesh.geometry.vertices[geo.face.c].multiplyScalar(am);
			//this.mesh.geometry.vertices[geo.face.d].multiplyScalar(am);

			this.mesh.geometry.verticesNeedUpdate = true;
		},

		clicked: function (geo, selected) {
			var inv,
				rotatedPoint,
				pos,
				xpos,
				ypos,
				xcell,
				ycell;
			// WWWWW TTTTTT FFFFF?!
			// I AM A GODDDDD!
			inv = new THREE.Matrix4().getInverse(geo.object.matrixRotationWorld.clone().rotateY(Math.PI));
			rotatedPoint = geo.point.applyProjection(inv); //inv.multiplyVector3(geo.point);
			pos = gfx.vec3ToLatLong(rotatedPoint, this.radius);

			//	Old way: from geo.face.
			//	var ring = Math.floor((geo.faceIndex / this.rings) *(this.width/this.rings)), 
			//		segment = Math.floor((geo.faceIndex % this.segments) * (this.width/this.segments));
			//	this.tiles[ring][segment] = this.tiles[ring][segment] === 1 ? 0 : 1;

			xpos = pos.x + 180;
			ypos = 180 - (pos.y + 90);

			xcell = (xpos / 360) * this.width | 0;
			ycell = (ypos / 180) * this.height | 0;

			if (!selected) {
				this._downOn = [xcell, ycell];
			} else {
				if (this._downOn && xcell === this._downOn[0] && ycell === this._downOn[1]) {
					window.main.level.useTool(xcell, ycell, pos.x, pos.y, geo);
				}
			}

		},

		explode: function (pos, geo) {
			var self = this,
				mapRef = this.latLngToMap(pos),
				xcell = mapRef[0],
				ycell = mapRef[1],
				map = this.tiles,
				unearthedEmpty = 0,
				unearthedMinerals = 0;

			this.sinkEarth(geo);

			utils.neighbours(2, function (x, y) {
				var damage = 0,
					block,
					wasUnearthed;
				if (x === 0 && y === 0) {
					damage = 30;
				} else if (Math.abs(x) < 2 && Math.abs(y) < 2) {
					damage = 15;
				} else {
					damage = 8;
				}

				block = self.getBlockFromTile([x + xcell, y + ycell]);
				if (!block) {
					return;
				}
				wasUnearthed = block.unearthed;

				block.addDamage(damage);

				if (block.unearthed && !wasUnearthed) {
					if (block.mineralValue === 0) {
						unearthedEmpty++;
					} else {
						unearthedMinerals++;
					}
				}
			});

			if (unearthedEmpty > 0 && unearthedMinerals === 0) {
				this.badDigging();
			}

			this.updateTexture();
		},

		badDigging: function () {
			var digCost = 10000;
			window.main.addCash(-digCost);
			audio.get("error").backPlay();
			window.main.flashMessage("Exploratory drilling failed: share price drops.  <span class='cost'>-$" + digCost + "</span>");
		},

		collectBlock: function (block) {
			block.collected = true;
			this.updateTexture();
		},

		createCanvas: function () {
			var $canvas = $("<canvas></canvas>", {
					id: "tex"
				}),
				ctx = $canvas[0].getContext("2d");

			ctx.canvas.width = this.width * 5;
			ctx.canvas.height = this.height * 5;

			ctx.canvas.webkitImageSmoothingEnabled = false;
			ctx.canvas.imageSmoothingEnabled = false;

			this.ctx = ctx;

			// Resourecs
			$canvas = $("<canvas></canvas>", {
				id: "resources"
			});
			ctx = $canvas[0].getContext("2d");

			ctx.canvas.width = this.width * 5;
			ctx.canvas.height = this.height * 5;

			$canvas.appendTo("#minimap");

		},

		updateTexture: function () {
			var self = this;
			this.renderTexture(function (tex) {
				self.mesh.material.map = tex;
			});
		},

		renderTexture: function (cb) {
			var self = this,
				c = this.ctx,
				w = c.canvas.width / this.width | 0,
				h = c.canvas.height / this.height | 0,
				x,
				y,
				block,
				type,
				luminosity,
				img;

			for (y = 0; y < this.height; y++) {
				for (x = 0; x < this.width; x++) {
					block = this.tiles[y][x];

					type = this.colors[block.height];

					if (block.unearthed) {
						if (block.mineralValue < 5) {
							type = "#444";
						} else if (block.collected) {
							type = "#303030";
						} else {
							luminosity = (block.mineralValue * 0.5) + 50 | 0;
							type = "hsl(340," + luminosity + "%, 70%)";
						}
					}
					if (block.isIce) {
						type = "#eee";
					}

					c.fillStyle = type;
					c.fillRect(x * w, y * h, w, h);
				}
			}

			function drawPolarCap() {
				var i,
					j,
					p = self.polarCapPath[0];

				c.beginPath();
				c.moveTo(p[0], p[1]);
				for (i = 1, j = self.polarCapPath.length; i < j; i++) {
					p = self.polarCapPath[i];
					c.lineTo(p[0], p[1]);
				}
				c.fillStyle = self.polarCapGradient;
				c.fill();
				c.closePath();
			}

			drawPolarCap();
			c.save();
			c.translate(0, c.canvas.height);
			c.scale(1, -1);
			drawPolarCap();
			c.restore();


			img = new Image();
			img.onload = function () {
				var texture = new THREE.Texture(img, {});
				texture.needsUpdate = true;
				cb && cb(texture);
				$("#map").replaceWith(img);
			};
			img.src = c.canvas.toDataURL("image/png");

			/// Resourecs
			c = $("#resources")[0].getContext("2d");
			w = c.canvas.width / this.width | 0;
			h = c.canvas.height / this.height | 0;

			for (y = 0; y < this.height; y++) {
				for (x = 0; x < this.width; x++) {
					block = this.resources[y][x];

					if (block === 0) {
						c.fillStyle = "rgba(0,0,0,0)";
					} else {
						c.fillStyle = "hsl(" + block + ", 80%, 50%)";
					}
					c.fillRect(x * w, y * h, w, h);
				}
			}
		},

		resetPlanetGeometry: function () {
			var i,
				sphere;

			if (!this.mesh) {
				return;
			}

			sphere = new THREE.SphereGeometry(
				this.radius,
				this.segments,
				this.rings
			);
			for (i = 0; i < sphere.vertices.length; i++) {
				this.mesh.geometry.vertices[i] = sphere.vertices[i].clone();
			}
			this.mesh.geometry.verticesNeedUpdate = true;
		},

		createPlanet: function (texture) {
			var sphereMaterial = new THREE.MeshLambertMaterial({
					color: 0xd4be92,
					map: texture
				}),

				sphereGeo = new THREE.SphereGeometry(
					this.radius,
					this.segments,
					this.rings
				),

				sphere = new THREE.Mesh(
					sphereGeo,
					sphereMaterial
				),

				atmosphere = {
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
							"float intensity = pow( 0.8 - dot( vNormal, vec3( 0.0, 0.0, 0.2 ) ), 11.0 );",
							"gl_FragColor = vec4( 0.3, 0.1, 0.1, 0.1 ) * intensity;",
						"}"
					].join("\n")
				},

				uniforms = THREE.UniformsUtils.clone(atmosphere.uniforms),

				material = new THREE.ShaderMaterial({
					uniforms: uniforms,
					vertexShader: atmosphere.vertexShader,
					fragmentShader: atmosphere.fragmentShader,
					side: THREE.BackSide
				}),

				mesh = new THREE.Mesh(sphereGeo, material);

			mesh.flipSided = true;
			mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.2;
			gfx.sceneAtmosphere.add(mesh);

			// Remove shadows - get weird cycling FPS 60-40-60-40...
			//sphere.castShadow = true;
			//sphere.receiveShadow = true;

			this.mesh = sphere;

			return sphere;
		}
	});

	window.Planet = Planet;

}(gfx, utils, audio, Class, Block, ClassicalNoise));
