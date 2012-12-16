var Block = Class.extend({
	init: function(planet, mapRef, height) {
		this.planet = planet;
		this.mapRef = mapRef;

		this.height = height;
		this.damage = 0;
		this.max = 10;
	},
	addDamage: function(amount) {
		while(amount > 0) {
			var remaining = this.max - this.damage;
			this.damage += amount;
			if(this.damage > 10) {
				this.height --;
				this.damage = 0;	
			}
			amount -= remaining;
		}
		if(this.height <= 0) {
			this.height = 0;
		}
		
	}
});