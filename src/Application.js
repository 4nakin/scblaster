import AudioManager;

exports = Class(GC.Application, function () {

	this.launchUI = function () {
		// turn off screen clearing
		this.engine._opts.alwaysRepaint = false;
		this.engine._opts.repaintOnEvent = false;
		
		// map our input events to Construct 2 handlers
		var inputMap = {
			touchstart: "onInputStart",
			touchmove: "onInputMove",
			touchend: "onInputSelect"
		};
		window.Canvas = {
			addEventListener: bind(this, function(name, handler) {
				this[inputMap[name]] = function(e) {
					e.changedTouches = [{ pageX: e.pt[1].x, pageY: e.pt[1].y, identifier: 0 }];
					handler(e);
				};
			})
		};
		
		// set up our sound manager
		var sound = new AudioManager({
			path: 'resources/media',
			preload: true,
			files: {
				epicarpg: {
					background: true
				},
				explosion_1: {},
				explosion_2: {},
				explosion_3: {},
				explosion_4: {},
				jetloop1: {},
				lazer_fire_1: {},
				lazer_ricochet: {},
				mattoglseby___3: {
					background: true
				},
				retrolaser1: {},
				retrolaser2: {},
				squaremotif1: {},
				tronblast1: {},
				upgrade1: {}
			}
		});
		
		// pretend to support context.present
		var canvas = GC.app.engine.getCanvas();
		var ctx = canvas.getContext('2d');
		ctx.present = function() {};
		
		// pretend to be AppMobi
		window.AppMobi = {
			canvas: canvas,
			context: {
				loadSound: function(src) {},
				playSound: function(src) {
					sound.play(src.slice(16).replace(/ /g, '_').replace(/-/g, '_').replace('.ogg', ''));
				}
			},
			webview: {
				execute: function() {}
			}
		};
		
		// import game and modify project model
		jsio("external src.c2runtime import cr");
		var oldGetProjModel = cr.getProjectModel;
		function deepReplace (obj, search, replace) {
			if (isArray(obj)) {
				return obj.map(function (item) { return deepReplace(item, search, replace); });
			} else if (typeof obj == 'string') {
				return obj.replace(search, replace);
			} else {
				return obj;
			}
		}
		cr.getProjectModel = function() {
			var data = oldGetProjModel();
			
			// overwrite asset paths
			data = deepReplace(data, /^images\//, "resources/images/");
			data = deepReplace(data, /^media\//, "resources/media/");
			
			return data;
		};
		
		// humor Construct 2 on native
		//  - fake getElementById
		//  - fake jQuery
		document.getElementById = document.getElementById || function() { return null; };
		window.jQuery = function(w) {
			return {
				width: function() {
					return w.innerWidth || w.screen.width;
				},
				height: function() {
					return w.innerHeight || w.screen.height;
				}
			};
		};
		
		cr_createDCRuntime();
	};
});
