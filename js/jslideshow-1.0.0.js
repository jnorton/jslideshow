// Copyright Justin Norton 2011
//License
/*
<a rel="license" href="http://creativecommons.org/licenses/by-nd/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nd/3.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/InteractiveResource" property="dct:title" rel="dct:type">JSlideshow</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://www.jnorton.co.uk/portfolio/digital-products/jslideshow" property="cc:attributionName" rel="cc:attributionURL">Justin Norton</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nd/3.0/">Creative Commons Attribution-NoDerivs 3.0 Unported License</a>.<br />Based on a work at <a xmlns:dct="http://purl.org/dc/terms/" href="http://www.jnorton.co.uk/portfolio/digital-products/jslideshow" rel="dct:source">www.jnorton.co.uk</a>.<br />Permissions beyond the scope of this license may be available at <a xmlns:cc="http://creativecommons.org/ns#" href="http://www.jnorton.co.uk/contact" rel="cc:morePermissions">http://www.jnorton.co.uk/contact</a>.
*/
(function($) {
	var currentslide = 1;
	var lastslide = 0;
	var firstload = 0;
	var count;
	var hoverelement;
	var interval_speed;
	var interval_id;
	var plugin = this;
	plugin.settings = {};
	var animations = {};
	
	var defaults = {
		interval: 3000,
		animationspeed: 1000,
		effectfirstslide: 0,
		effectType: 'core_fadein',
		easing: 'linear',
		parent: '.jslideshow',
		slides: '.jslides',
		tabs: '.jtabs',
		enabletabs: 1
	};
	var core_animations = {
		core_fadein: function() {
			this.fadeTo(plugin.settings.animationspeed, 1);
		},
		core_show: function() {
			this.show(plugin.settings.animationspeed, plugin.settings.easing);
		},
		core_slidedown: function() {
			this.slideDown(plugin.settings.animationspeed, plugin.settings.easing);
		}
	}
	var jqueryui_animations = {
		jqueryui_blind: function() {
			this.show("blind", { direction: "vertical" }, plugin.settings.animationspeed);
		},
		jqueryui_clip: function() {
			this.show("clip", { direction: "vertical" }, plugin.settings.animationspeed);
		},
		jqueryui_drop: function() {
			this.show("drop", {	direction: "left" }, plugin.settings.animationspeed);
		},
		jqueryui_fade: function() {
			this.show("fade", {}, plugin.settings.animationspeed);
		},
		jqueryui_fold: function() {
			this.show("fold", {}, plugin.settings.animationspeed);
		},
		jqueryui_puff: function() {
		     this.show("puff", {}, plugin.settings.animationspeed);
		},
		jqueryui_slide: function() {
			this.show("slide", { direction: "left" }, plugin.settings.animationspeed);
		}
	}
	var special_animations = {
		custom_animate_1: function() {
			//Special animation provided via JQuery UI easing http://jqueryui.com/demos/effect/easing.html
			this.animate( { opacity : "show", height: "toggle", width: "toggle" }, { duration: plugin.settings.animationspeed , specialEasing: { width: 'linear', height: 'easeOutBounce' }});
		}
	}
	
	var methods = {
		init: function(options) {
			return this.each(function() {
			if (typeof options === 'object') {
				plugin.settings = $.extend(defaults, options);
			};

			if (plugin.settings.enabletabs == 1) {
					count = $(plugin.settings.tabs + " li").size();
					hoverelement = $(plugin.settings.tabs + " li");
			} else {
					count = $(plugin.settings.slides + " li").size();
					hoverelement = $(plugin.settings.slides + " li");
			}
			
			interval_speed = plugin.settings.interval;

			//bind events 
			if(firstload == 0){
			$(this).jslideshow('bindEvents');
			firstload = 1;
			}
			$(plugin.settings.slides + ' li').hide();
			if (plugin.settings.effectfirstslide == 0) {
				$(plugin.settings.slides + ' li').first().show();
				currentslide = 2;
				if (plugin.settings.enabletabs == 1) {
					$(plugin.settings.tabs + ' li').first().addClass('active-tab');
				}
			} else {
				currentslide = 2;
				$(plugin.settings.slides + ' li').first().jslideshow('doAnimation', $(plugin.settings.slides + ' li').first(), plugin.settings.effectType);
				if (plugin.settings.enabletabs == 1) {
					$(plugin.settings.tabs + ' li').first().addClass('active-tab');
				}
			}
			
			//go
			$(this).jslideshow('startShow', interval_speed);
			});
		},
		parentmouseenter: function(e){ 
			clearInterval(interval_id);
		},
		parentmouseleave: function(e){
			$(this).jslideshow('startShow', interval_speed);
		},
		tabmouseenter: function(e){
			clearInterval(interval_id);
			var index = $(this).index();
			if ((index + 1) == count) {
				lastslide = 1;
			} else {
				lastslide = 0;
			}
			currentslide = index + 2;
			if (plugin.settings.enabletabs == 1) {
				$(plugin.settings.tabs).children().removeClass('active-tab');
				$(this).addClass('active-tab');
			}
			$(plugin.settings.slides).children().hide();
			$(plugin.settings.slides + " li:nth-child(" + (index + 1) + ")").show();
			e.stopPropagation();
		},
		nextSlide: function() {
			slides = $(plugin.settings.slides + ' li');
			activeTab = $(plugin.settings.tabs + " li:nth-child(" + (currentslide) + ")");
			activeSlide = $(plugin.settings.slides + " li:nth-child(" + (currentslide) + ")");
			previousSlide = $(plugin.settings.slides + " li:nth-child(" + (currentslide - 1) + ")");
			if (plugin.settings.enabletabs == 1) {
				$(plugin.settings.tabs).children().removeClass('active-tab');
			}
			$(slides).hide().css({
				'z-index': '1000'
			});
			if (lastslide == 1) {
				slides.first().queue('slideQ', function(next) {
					slides.last().css({
						'z-index': '999'
					});
					slides.last().show();
					$(this).jslideshow('doAnimation', $(this), plugin.settings.effectType);
					currentslide = 1;
					if (plugin.settings.enabletabs == 1) {
						$(plugin.settings.tabs + " li:nth-child(" + (currentslide) + ")").addClass('active-tab');
					}
					currentslide = 2;
					lastslide = 0;
					next();
				}).dequeue('slideQ');
			} else {
				activeSlide.queue('slideQ', function(next) {
					previousSlide.show();
					$(this).jslideshow('doAnimation', $(this), plugin.settings.effectType);
					if (plugin.settings.enabletabs == 1) {
						activeTab.addClass('active-tab');
					}
					currentslide++;
					next();
				}).dequeue('slideQ');
			}
			if (currentslide > count) {
				lastslide = 1;
			}
		},
		startShow: function(interval_speed) {
			interval_id = setInterval(function() {
				$(this).jslideshow('nextSlide');
			}, interval_speed);
		},	
		updateSlideshow: function(options){
			$(plugin.settings.tabs).children().removeClass('active-tab');
			clearInterval(interval_id);
			interval_id = 0;
			currentslide = 1;
			$(this).jslideshow('init', options);
		},
		doAnimation: function(element, effectType) {
			$.extend(element, animations, core_animations);
			$.extend(element, animations, jqueryui_animations);
			$.extend(element, animations, special_animations);
			element[effectType]();
		},
		bindEvents: function(){
			$(plugin.settings.parent).bind("mouseleave", methods.parentmouseleave)
      		   	   					 .bind("mouseenter", methods.parentmouseenter);
      		   	   					 
      		if (plugin.settings.enabletabs == 1) {
      			$(plugin.settings.tabs + " li").bind("mouseenter", methods.tabmouseenter);
      		} 
		}	
	};
	
	$.fn.jslideshow = function(method) { 
	// Method calling logic	
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.jslideshow');
		}
	};
	
})(jQuery);
