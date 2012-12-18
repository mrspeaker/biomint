var Block = Class.extend({
	init: function(planet, mapRef, height) {
		this.planet = planet;
		this.mapRef = mapRef;

		this.isWater = height === 0;

		// if(mapRef[1] < 10 & !this.isWater) {
		// 	this.height = 0;
		// 	this.isIce = true;
		// }

		this.unearthed = false;
		this.collected = false;

		this.mineralValue = 0;

		this.height = height;
		this.damage = 0;
		this.max = 10;
	},
	addDamage: function(amount) {
		if(this.isWater || this.uncovered) {
			return;
		}

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
			this.unearthed = true;
			this.mineralValue = this.planet.resources[this.mapRef[1]][this.mapRef[0]];
		}
		
	}
});