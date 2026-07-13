
function all_page_script(banner_login_yn, mem_login_yn, memlv, sns_id, sns_photo_url, sns_site, sns_name, id_save, gps_use_yn) {

	var REQUEST_URI = location.pathname + location.search;


	if (!banner_login_yn) {
		var banner_login_chk = 'none';
		var banner_logout_chk = '';
	} else {
		var banner_login_chk = '';
		var banner_logout_chk = 'none';
	}


	if (!mem_login_yn) {
		var login_chk = 'none';
		var logout_chk = '';
	} else {
		var login_chk = '';
		var logout_chk = 'none';
	}

	// 트위터 로그인 체크
	if (!sns_id) {
		var sns_login_chk = 'none';
		var sns_logout_chk = '';

	} else {
		var sns_login_chk = '';
		var sns_logout_chk = 'none';

		if (document.getElementById('sns_photo_img')) document.getElementById('sns_photo_img').src = sns_photo_url;
		if (document.getElementById('sns_name')) document.getElementById('sns_name').innerHTML = "<img src='/img/icon_" + sns_site + ".png' width=14 height=14 align=absmiddle BORDER=0> " + sns_name;

	}


	if (IE) {

		if (document.all.banner_logout_div) {
			if (!document.all.banner_logout_div.length) {
				document.all.banner_logout_div.style.display = banner_logout_chk;
			} else {
				for (var i = 0; i < document.all.banner_logout_div.length; i++) {
					document.all.banner_logout_div[i].style.display = banner_logout_chk;
				}
			}
		}

		if (document.all.banner_login_div) {
			if (!document.all.banner_login_div.length) {
				document.all.banner_login_div.style.display = banner_login_chk;
			} else {
				for (var i = 0; i < document.all.banner_login_div.length; i++) {
					document.all.banner_login_div[i].style.display = banner_login_chk;
				}
			}
		}

		if (document.all.sns_logout_div) {
			if (!document.all.sns_logout_div.length) {
				document.all.sns_logout_div.style.display = sns_logout_chk;
			} else {
				for (var i = 0; i < document.all.sns_logout_div.length; i++) {
					document.all.sns_logout_div[i].style.display = sns_logout_chk;
				}
			}
		}

		if (document.all.sns_login_div) {
			if (!document.all.sns_login_div.length) {
				document.all.sns_login_div.style.display = sns_login_chk;
			} else {
				for (var i = 0; i < document.all.sns_login_div.length; i++) {
					document.all.sns_login_div[i].style.display = sns_login_chk;
				}
			}
		}




		if (document.all.logout_div) {
			if (!document.all.logout_div.length) {
				document.all.logout_div.style.display = logout_chk;
			} else {
				for (var i = 0; i < document.all.logout_div.length; i++) {
					document.all.logout_div[i].style.display = logout_chk;
				}
			}
		}

		if (document.all.login_div) {
			if (!document.all.login_div.length) {
				document.all.login_div.style.display = login_chk;
			} else {
				for (var i = 0; i < document.all.login_div.length; i++) {
					document.all.login_div[i].style.display = login_chk;
				}
			}
		}

		if (memlv) {
			var memlv_obj = eval("document.all.memlv_div_" + memlv);
			if (memlv_obj) {
				if (!memlv_obj.length) {
					memlv_obj.style.display = 'block';
				} else {
					for (var i = 0; i < memlv_obj.length; i++) {
						memlv_obj[i].style.display = 'block';
					}
				}
			}
		}

	} else {

		var div_obj = document.getElementsByTagName('div')
		for (var i = 0; i < div_obj.length; i++) {

			if (div_obj[i].id == 'logout_div') {
				div_obj[i].style.display = logout_chk;

			} else if (div_obj[i].id == 'login_div') {
				div_obj[i].style.display = login_chk;

			} else if (div_obj[i].id == 'banner_logout_div') {
				div_obj[i].style.display = banner_logout_chk;

			} else if (div_obj[i].id == 'banner_login_div') {
				div_obj[i].style.display = banner_login_chk;

			} else if (div_obj[i].id == 'sns_logout_div') {
				div_obj[i].style.display = sns_logout_chk;

			} else if (div_obj[i].id == 'sns_login_div') {
				div_obj[i].style.display = sns_login_chk;

			}

			if (memlv) {
				if (div_obj[i].id == 'memlv_div_' + memlv) {
					div_obj[i].style.display = 'block';
				}
			}
		}


	}

	if (!mem_login_yn) {
		// 일반 로그인 박스
		for (var i = 0; i < document.getElementsByName("left_login_box").length; i++) {

			var login_form = document.getElementsByName("left_login_box")[i];

			try {
				if (!login_form.re_url.value) login_form.re_url.value = REQUEST_URI;
			} catch (e) {
			}

			try {
				if (id_save) {
					login_form.id_save.checked = 1;
				} else {
					login_form.id_save.checked = 0;
				}
			} catch (e) {
			}

			if (id_save) {
				try {
					login_form.id.value = id_save;
					login_form.id.style.backgroundImage = 'url(none)';
				} catch (e) {
				}
			}
		}

		// SSL 일반 로그인 박스
		for (var i = 0; i < document.getElementsByName("left_ssl_login_box").length; i++) {

			var login_form = document.getElementsByName("left_ssl_login_box")[i];

			try {
				if (!login_form.re_url.value) login_form.re_url.value = REQUEST_URI;
			} catch (e) {
			}

			try {
				if (id_save) {
					login_form.id_save.checked = 1;
				} else {
					login_form.id_save.checked = 0;
				}

			} catch (e) {
			}

			if (id_save) {
				try {
					login_form.id.value = id_save;
					login_form.id.style.backgroundImage = 'url(none)';
				} catch (e) {
				}
			}
		}

	}

	if (gps_use_yn == 1) {
		gps_getLocation();
	}

	// --- Dynamic Loading for Floating Quick Menu ---
	(function loadQuickMenu() {
		var scripts = document.getElementsByTagName('script');
		var myScript = scripts[scripts.length - 1]; // This script
		for (var i = 0; i < scripts.length; i++) {
			if (scripts[i].src && scripts[i].src.indexOf('all_bottom_script.js') !== -1) {
				myScript = scripts[i];
				break;
			}
		}
		var scriptPath = myScript.src;
		var basePath = scriptPath.substring(0, scriptPath.lastIndexOf('js/all_bottom_script.js'));

		// Load content_data.js if siteContent is missing
		if (typeof siteContent === 'undefined') {
			var script1 = document.createElement('script');
			script1.src = basePath + 'js/content_data.js';
			document.body.appendChild(script1);

			script1.onload = function () {
				// Load render_content.js after content_data is ready
				var script2 = document.createElement('script');
				script2.src = basePath + 'js/render_content.js';
				document.body.appendChild(script2);
			};
		} else {
			// content_data already loaded, just check render_content
			// (Assuming render_content logic is safe to run multiple times if needed, 
			// but we check if it's already there)
			// If the script isn't in index.html manually, we load it.
			if (!$('script[src*="render_content.js"]').length) {
				var script2 = document.createElement('script');
				script2.src = basePath + 'js/render_content.js';
				document.body.appendChild(script2);
			}
		}
	})();
}


function gps_getLocation() {
	try {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition);
		}
	} catch (e) {
	}
}



function showPosition(position) {
	// alert(position.coords.latitude+ ' / ' +position.coords.longitude);
	// alert(GetCookie('gps_x')+ ' / ' + GetCookie('gps_y'));

	if (!GetCookie('gps_x') && !GetCookie('gps_y')) {
		gps_reload(position.coords.latitude, position.coords.longitude);
	}
}



var httpReq_set = null;
function gps_getInstance() {
	var httpReq_set = null;
	try {
		httpReq_set = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (Ex) {
		try {
			httpReq_set = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (Ex2) {
			httpReq_set = null;
		}
	}

	if (!httpReq_set && typeof XMLHttpRequest != "undefined") {
		httpReq_set = new XMLHttpRequest();
	}

	return httpReq_set;
}


var httpReq_gps;
function gps_reload(gps_x, gps_y) {
	httpReq_gps = gps_getInstance();

	var url = "/shop_main/gps_save.php?gps_x=" + gps_x + "&gps_y=" + gps_y;

	httpReq_gps.onreadystatechange = gps_reload_result;
	httpReq_gps.open("GET", url, true);
	httpReq_gps.send();
}


function gps_reload_result() {
	if (httpReq_gps.readyState == 4) {
		// alert(httpReq_gps.responseText);
	}
}


/*
function showError(error){
	switch(error.code){
		case error.PERMISSION_DENIED:
			x.innerHTML="User denied the request for Geolocation."//사용자가 위치정보에 대한 요청을 거부했을 때.
			break;
		case error.POSITION_UNAVAILABLE:
			x.innerHTML="Location information is unavailable." //위치정보 사용이 불가능할 때(주로 PC에서 볼 때)
			break;
		case error.TIMEOUT:
			x.innerHTML="The request to get user location timed out." //시간초과
			break;
		case error.UNKNOWN_ERROR:
			x.innerHTML="An unknown error occurred." //알 수 없는 에러
			break;
	}
}
*/


var javascript_fn_name = "";
function web_my_gps_search(fn_javascript) {

	javascript_fn_name = fn_javascript;
	try {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(web_my_gps_search_chk);
		}
	} catch (e) {
	}
}

function web_my_gps_search_chk(position) {
	if (position.coords.latitude && position.coords.longitude) {
		var iframe_name = create_iframe();
		document.getElementById(iframe_name).src = "/shop_main/gps_save.php?javascript_fn_name=" + javascript_fn_name + "&gps_x=" + position.coords.latitude + "&gps_y=" + position.coords.longitude;
	}
}


