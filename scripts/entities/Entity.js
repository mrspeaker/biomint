var Entity = Class.extend({
	
	pos: null,
	altitude: 2.5,
	behaviours: null,

	has: function(traits) {
		var self = this;
		traits.forEach(function(t){
			self.behaviours.push(t);
		});
	},
	init: function(planet, pos, color){

		this.radius = planet.radius;
		this.color = color || Math.random() * 0xffffff;

		this.pos = pos;
		this.behaviours = [];

	},
	init_post: function() {
		for(var i = 0; i < this.behaviours.length; i++) {
			this.behaviours[i] = new this.behaviours[i]();
			this.behaviours[i].init_behaviour.apply(this, arguments);
		}
	},
	tick: function() {
		for(var i = 0; i < this.behaviours.length; i++) {
			this.behaviours[i].tick.call(this);
		}
	}
});

