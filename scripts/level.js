var Level = Class.extend({
	tool: "",
	init: function(){
		this.changeTool("search");
	},
	changeTool: function(tool) {
		this.tool = tool;
		console.log("Chagnged tool to ", tool)
	}
});