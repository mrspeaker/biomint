var Rover = Entity.extend({
	init: function(planet) {
		this._super(planet);
		this.has([new TraitMoving()]);
	}
});