all: icons demo

icons:
	node --harmony_arrow_functions build.js polymer-iconset-ionicons > polymer-iconset-ionicons.html

demo:
	node --harmony_arrow_functions build.js demo > demo.html
