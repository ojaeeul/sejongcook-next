jQuery(function($){
	// check mobile and touch screen
	if (window.Touch)
	{
		$('#scbd').addClass('mo');
	}

	$('div.conbody img').removeAttr('onload').removeAttr('onclick').removeAttr('style');

	// toggle search event
	$('#btnToggleSearch').on('click', function(){
		$(this).parent().toggleClass('active');
		$('#toggleSearch').toggle();
	});

	// ui-toggle event
	$('#scbd div.ui-toggle>div:first-child').on('click', function(){
		var
			parent = $(this).parent()
			,bd = $(this).next()
		;
		
		parent.toggleClass('active');

		if (parent.attr('type') == 'toggleIframe')
		{
			eval('var iframe = ' + bd.children().attr('name') + ';');

			if (parent.hasClass('active'))
			{
				comment_go(iframe, bd.attr('idx'));
			}
			else
			{
				iframe.location.href = "about:blank";
			}
		}
	});
	$('#scbd div.ui-toggle[rel=open]').addClass('active');
});

function clip(url){
	if (document.all) {
		window.clipboardData.setData('Text',url);
		alert("클립보드에 저장되었습니다.\n\n원하는 위치에 Ctrl+V 누르시면 클립보드에 저장된 소스가 삽입됩니다.");
	} else {
		temp = prompt("Ctrl+C를 눌러 클립보드로 복사하세요", url);
	}
}
