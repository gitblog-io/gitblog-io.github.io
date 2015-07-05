app.filter('https2http', function(){
	return function(text) {
	   return text.replace(/https/g, 'http');
	}
});