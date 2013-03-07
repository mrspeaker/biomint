(function (Class) {

	"use strict";

	var Entity = Class.extend({
		pos: null,
		altitude: 2.5,
		behaviours: null,

		remove: false,

		has: function (traits) {
			var self = this;
			traits.forEach(function (t) {
				self.behaviours.push(t);
			});
		},

		init: function (planet, pos, color) {
			this.radius = planet.radius;
			this.color = color || Math.random() * 0xffffff;

			this.pos = pos;
			this.behaviours = [];

		},

		init_post: function () {
			var i;
			for (i = 0; i < this.behaviours.length; i++) {
				this.behaviours[i] = new this.behaviours[i]();
				this.behaviours[i].init_behaviour.apply(this, arguments);
			}
		},

		tick: function () {
			var self = this;
			this.behaviours.forEach(function (b) {
				b.tick.call(self);
			});
		}
	});

	// FIXME: hey, what is native window.Entity? I smash it here...
	window.Entity = Entity;

}(Class));
