;(function($){
	// Floating banner setting
	$.fn.scFloatingSetting = function(_options) {
		var
			_this = $(this)
			,_defaults = {
				align : 'left'
				,left : 500
				,top : 100
				,width : 100
				,height : 100
				,conWidth : 1000
				,zidx : 9
			}
			,_opts = $.extend(_defaults, _options)
			
			// init
			,_init = function()
			{
				_elementSetting();
			}
			
			// Element basic setting
			,_elementSetting = function()
			{
				var leftX;
				
				_this
					.width(_opts.width)
					.height(_opts.height)
					.css(
						{
							'position' : 'absolute'
							,'top' : _opts.top + 'px'
						}
					)
				;
				
				switch(_opts.align) {
					case 'center':
						$(window).bind('resize', function(){
							_resizeHandler();
						});
						_resizeHandler();
						break;
					default:
						_this.css('left', _opts.left + 'px');
						break;
				}
				_this.css('left', leftX + 'px');
			}

			// Resize handler
			,_resizeHandler = function()
			{
				var leftX;
				leftX = (($(window).width() * 0.5) - (_opts.conWidth * 0.5)) + _opts.left;
				_this.css('left', leftX + 'px');
			}
			
			_init();
	};



	// Floating banner scrolling event
	$.fn.scFloatingBanner = function(_options) {
		var
			_this = $(this)
			,_defaults = {
				top : 100
				,margin : 10
			}
			,_opts = $.extend(_defaults, _options)
			
			// init
			,_init = function()
			{
				_elementSetting();
			}
			
			// Element init
			,_elementSetting = function()
			{
				if (positionFixedCheck()) {
					_this.css('position', 'absolute');
					$(window).bind('scroll', function(){
						_scrollEvent_fix();
					});
				} else {
					_this.css('position', 'absolute');
					
					$(window).bind('scroll', function(){
						_scrollEvent_abs();
					});
				}
			}

			// Scrolling Event - absolute
			,_scrollEvent_abs = function()
			{
				var
					scrollTop = $(window).scrollTop()
					,targetY = _opts.top + scrollTop
				;
				_this.css('top', targetY);
			}
			
			// Scrolling Event - fixed
			,_scrollEvent_fix = function()
			{
				var
					scrollTop = $(window).scrollTop()
				;
				
				if (scrollTop > (_opts.top - _opts.margin)) {
					_this.css({
						'position' : 'fixed'
						,'top' : _opts.margin
					});
				} else {
					_this.css({
						'position' : 'absolute'
						,'top' : _opts.top
					});
				}
			}
		;

		_init();
	};
})(jQuery);


// position:fixed check support
function positionFixedCheck() {
	var isSupported = null;
	if (document.createElement) {
		var el = document.createElement("div");
		if (el && el.style) {
			el.style.position = "fixed";
			el.style.top = "10px";
			if(document.body) {
				var root = document.body;
			} else {
				var root = document.documentElement;
			}
			if (root && root.appendChild && root.removeChild) {
				root.appendChild(el);
				isSupported = el.offsetTop === 10;
				root.removeChild(el);
			}
		}
	}
	return isSupported;
}