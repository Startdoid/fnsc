App.Views.DView = Backbone.View.extend({
	el:"#app1_here",
	tagName: "div",
	render: function(){
	  $(this.el).html("Details page<br>not implemented :)<br><button onclick='history.back()'>Back</button>");
  },
});