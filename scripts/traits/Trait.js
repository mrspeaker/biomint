var Trait = Class.extend({
	init: function() {},
	tick: function() {}
});

var TraitMoving = Trait.extend({
	init_behaviour: function() {
		this.xspeed = Math.random() - 0.5;
		this.yspeed = Math.random() - 0.5;
	},
	tick: function() {
		this.pos.x += this.xspeed;
		this.pos.y += this.yspeed;
		this.syncMesh();
	}
});
