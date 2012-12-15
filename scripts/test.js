var test = {
	planet: null,
	init: function() {
		this.createGrid();
		this.bindUI();
		this.run();

		
	},

	run: function() {
		this.update();

		var self = this;
		requestAnimationFrame(function(){
			self.run();
		})
	},

	createGrid: function(){
		var p = planet;
		p.tiles.reduce(function(dom, row, j){
			row.reduce(function(rdom, cell, i){
				
				var type = ["water", "land"][cell];
				var $cell = $("<div></div>").addClass("cell " + type)

				$cell.data("pos", {
						x: i,
						y: j,
						type: cell,
						dom: $cell
					}).appendTo(rdom);

				return rdom;
			}, $("<div></div>").addClass("row")).appendTo(dom);
			return dom;
		}, $("<div></div>", {id: "board"})).appendTo("body");
	},
	bindUI: function() {
		$("#board").on("click", ".cell", function(){
			console.log($(this).data("pos"))
		});
	},
	update: function() {

	},
	render: function() {

	}
}