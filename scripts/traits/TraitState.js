// TraitState
(function (Trait) {

	function changeState(state) {
		this.last = this.current;
		this.current = state;
		this.count = -1;
	}

	var TraitState = Trait.extend({
		init_behaviour: function (state) {
			this.state = {
				current: "",
				last: "",
				count: -1,
				change: changeState
			};

			state && this.state.change(state);
		},
		tick: function () {
			this.state.count++;
		}
	});

	window.TraitState = TraitState;
}(Trait));