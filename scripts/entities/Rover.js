var Rover = Entity.extend({
	init: function(planet, pos, col) {
		this._super(planet, pos, col);
		this.has([TraitMesh, TraitMoving]);
	}
});