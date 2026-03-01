if (window.jQuery) {
	jQuery(document).ready(function() {
		$('.sc_ptop').click(function() {
			$('body,html').animate({
				scrollTop: 0
			}, 800);
			return false;
		});
	});
}
