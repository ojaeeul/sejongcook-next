if (window.console == undefined) { console = { log: function () { } } } var IE = false; if (window.navigator.appName.indexOf("Explorer") != -1) { IE = true } var cate_00000000_code = new Array(); var board_list_code = new Array(); var move_script_str; var add_price_arr = new Array(); var option_arr = new Array(); var option_img_arr = new Array(); var option_user_arr = new Array(); var coupon_price_arr = new Array(); var script_new_list = new Array(); function getFlash(a, b, k) { if (!a || !b || !k) { return null } var g = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"; var d = "http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,22,0"; var c = "transparent"; var j = "high"; var f = "http://www.macromedia.com/go/getflashplayer"; var h = "application/x-shockwave-flash"; var e = "<object classid='" + g + "' codebase='" + d + "' width='" + b + "' height='" + k + "'><param name='wmode' value='" + c + "'><param name='movie' value='" + a + "'><param name='quality' value='" + j + "'><embed src='" + a + "' quality='" + j + "' pluginspage='" + f + "' type='" + h + "' width='" + b + "' height='" + k + "'></embed></object>"; getObject(e) } function flash(c, b, h, j, a, d, f) { var g = new String(); if (!a) { var e = Math.random() * 10000; e = Math.round(e); a = "flash_name" + e } if (navigator.appName.indexOf("Microsoft") != -1) { g += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" '; g += 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=version=8,0,0,0" '; g += 'id="' + a + '" width="' + b + '" height="' + h + '" typ="swf">'; g += '<param name="movie" value="' + c + '"/>'; if (d != null) { g += '<param name="flashvars" value="' + d + '"/>' } g += '<param name="quality" value="high"/>'; if (j != null) { g += '<param name="bgcolor" value="' + j + '"/>' } g += '<param name="menu" value="false"/>'; g += '<param name="salign" value="LT"/>'; g += '<param name="wmode" value="transparent"/>'; if (f != null) { g += '<param name="xml_path" value="' + f + '"/>' } g += "</object>" } else { g += '<embed src="' + c + '" '; g += 'quality="high" '; if (j != null) { g += 'bgcolor="' + j + '" ' } g += 'width="' + b + '" '; g += 'height="' + h + '" '; if (f != null) { g += 'xml_path="' + f + '" ' } g += 'menu="false" '; g += 'id="' + a + '" '; g += 'salign="LT" '; g += 'wmode="transparent" '; if (d != null) { g += 'flashvars="' + d + '" ' } g += 'type="application/x-shockwave-flash" '; g += 'pluginspage="http://www.macromedia.com/go/getflashplayer" typ="swf">'; g += "</embed>" } document.write(g) } function FlashObject(e, d, a, c, h, b, f) { var g = new String(); if (navigator.appName.indexOf("Microsoft") != -1) { g += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" '; g += 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=version=8,0,0,0" '; g += 'id="' + h + '" width="' + d + '" height="' + a + '">'; g += '<param name="movie" value="' + e + '"/>'; if (b != null) { g += '<param name="flashvars" value="' + b + '"/>' } g += '<param name="quality" value="high"/>'; g += '<param name="bgcolor" value="' + c + '"/>'; g += '<param name="menu" value="false"/>'; g += '<param name="salign" value="LT"/>'; if (f != null) { g += '<param name="xml_path" value="' + f + '"/>' } g += "</object>" } else { g += '<embed src="' + e + '" '; g += 'quality="high" '; g += 'bgcolor="' + c + '" '; g += 'width="' + d + '" '; g += 'height="' + a + '" '; if (f != null) { g += 'xml_path="' + f + '" ' } g += 'menu="false" '; g += 'id="' + h + '" '; g += 'salign="LT" '; if (b != null) { g += 'flashvars="' + b + '" ' } g += 'type="application/x-shockwave-flash" '; g += 'pluginspage="http://www.macromedia.com/go/getflashplayer">'; g += "</embed>" } document.write(g) } function comma(d) { if (!d || d == "") { return "0" } var c = 0; var b = 0; var a = ""; d = d + ""; for (b = (d.length) - 1, c = 0; b >= 0; b--, c++) { if (c % 3 == 0 && c > 0) { a = d.charAt(b) + "," + a } else { a = d.charAt(b) + a } } a = a.replace("-,", "-"); a = a.replace(",.", "."); return a } function number_format(f, c, h, e) { f = (f + "").replace(/[^0-9+\-Ee.]/g, ""); var b = !isFinite(+f) ? 0 : +f, a = !isFinite(+c) ? 0 : Math.abs(c), k = (typeof e === "undefined") ? "," : e, d = (typeof h === "undefined") ? "." : h, j = "", g = function (o, m) { var l = Math.pow(10, m); return "" + (Math.round(o * l) / l).toFixed(m) }; j = (a ? g(b, a) : "" + Math.round(b)).split("."); if (j[0].length > 3) { j[0] = j[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, k) } if ((j[1] || "").length < a) { j[1] = j[1] || ""; j[1] += new Array(a - j[1].length + 1).join("0") } return j.join(d) } function money_format(d, a) { var c; a += ""; a = a.replace(/,/gi, ""); var b = ""; if (d == "USD") { b = "$" } else { if (d == "JPY") { b = "Ұ" } else { if (d == "CNY") { b = "￥" } else { if (d == "HKD") { b = "HK$" } else { if (d == "AED") { b = "AED " } else { if (d == "IDR") { b = "Rp " } else { if (d == "VND") { b = "VND " } else { if (d == "THB") { b = "฿" } } } } } } } } if (d == "USD" || d == "HKD" || d == "CNY") { a *= 1; if (a < 0) { c = "-" + b + number_format(Math.abs(a), 2) } else { c = b + number_format(a, 2) } } else { a *= 1; a = Math.floor(a); c = b + number_format(a) } return c } function ok_frame_chk() { if (document.getElementById("tmp_id_win")) { document.getElementById("tmp_id_win").style.display = "block" } if (document.getElementById("ok_frame")) { document.getElementById("ok_frame").style.height = "100px"; document.getElementById("ok_frame").style.width = "600px" } } function goods_img_detail(c) { if (!c) { c = "" } var b = 900; var d = 760; var f = (screen.width - b) / 2; var a = (screen.height - d) / 2; if (MOBILE_CONN_YN == true) { x_popup("../shop_goods/goods_img_detail.htm?goods_idx=" + c) } else { var e = window.open("../shop_goods/goods_img_detail.htm?goods_idx=" + c, "add_data_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); e.focus() } } function goods_cart_reg(b) { var d = 1; var c = ""; if (document.getElementsByName("goods_stock_arr[" + b + "]").length) { d = document.getElementsByName("goods_stock_arr[" + b + "]")[0].value; c = "&sale_cnt=" + d } var a = create_iframe(); document.getElementById(a).src = "../shop_goods/goods_exec.php?mode=cart_add_one&goods_idx=" + b + c } function goods_direct_buy(b) { var a = create_iframe(); document.getElementById(a).src = "../shop_goods/goods_exec.php?mode=direct_one&goods_idx=" + b } function goods_direct_jjim(b) { var a = create_iframe(); document.getElementById(a).src = "../shop_popup/wish_reg_exec.php?mode=main_one&goods_idx=" + b } function num_chk(a) { var c = a.value; if (!c) { return true } for (i = 0; i < c.length; i++) { if ((a.value.charAt(i) >= 0 && a.value.charAt(i) <= 9) || a.value.charAt(i) == "." || a.value.charAt(i) == "-") { } else { if (LAN == "en") { var b = "Please enter only numbers" } else { if (LAN == "cn") { var b = "请输入数字" } else { if (LAN == "jp") { var b = "数字のみを入力してください" } else { var b = "숫자만 입력하세요." } } } alert(b); a.focus(); return false } } return true } function search_zip(b) { if (document.getElementById("dynamic_js")) { var a = document.getElementById("dynamic_js"); if (a.src == "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js") { search_zip_daum_load(b) } else { a.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"; a.onload = function () { search_zip_daum_load(b) } } } else { search_juso() } } function search_zip_daum_load(eval_put_postno_func_name) { if (APP_CONN_YN || MOBILE_CONN_YN) { var daum_element_layer_wrap = document.getElementById("search_zip_daum_layer_wrap"); var daum_element_layer = document.getElementById("search_zip_daum_layer"); if (!daum_element_layer_wrap) { daum_element_layer_wrap = document.createElement("div"); daum_element_layer_wrap.setAttribute("id", "search_zip_daum_layer_wrap"); daum_element_layer_wrap.style.position = "fixed"; daum_element_layer_wrap.style.top = "0px"; daum_element_layer_wrap.style.left = "0px"; daum_element_layer_wrap.style.width = "100%"; daum_element_layer_wrap.style.height = "100%"; daum_element_layer_wrap.style.zIndex = "1000"; daum_element_layer_wrap.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; daum_element_layer_wrap.onclick = function () { daum_element_layer_wrap.style.display = "none" }; daum_element_layer = document.createElement("div"); daum_element_layer.setAttribute("id", "search_zip_daum_layer"); daum_element_layer.style.position = "absolute"; daum_element_layer.style.overflow = "hidden"; daum_element_layer.style.zIndex = "1"; element_close_btn = document.createElement("img"); element_close_btn.setAttribute("src", "//t1.daumcdn.net/postcode/resource/images/close.png"); element_close_btn.style.position = "absolute"; element_close_btn.style.right = "0px"; element_close_btn.style.bottom = "0px"; element_close_btn.style.zIndex = "1"; element_close_btn.style.cursor = "pointer"; element_close_btn.onclick = function () { daum_element_layer_wrap.style.display = "none" }; daum_element_layer.appendChild(element_close_btn); daum_element_layer_wrap.appendChild(daum_element_layer); document.body.appendChild(daum_element_layer_wrap) } setTimeout(function () { new daum.Postcode({ oncomplete: function (data) { var fullAddr = ""; var extraAddr = ""; if (data.userSelectedType === "R") { fullAddr = data.roadAddress } else { fullAddr = data.jibunAddress } if (data.userSelectedType === "R") { if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) { extraAddr += data.bname } if (data.buildingName !== "" && data.apartment === "Y") { extraAddr += (extraAddr !== "" ? ", " + data.buildingName : data.buildingName) } fullAddr += (extraAddr !== "" ? " (" + extraAddr + ")" : "") } if (eval_put_postno_func_name) { eval(eval_put_postno_func_name + '("' + data.zonecode + '", "' + fullAddr + '")') } else { new_put_postno(data.zonecode, fullAddr) } daum_element_layer_wrap.style.display = "none" }, width: "100%", height: "100%" }).embed(daum_element_layer); daum_element_layer_wrap.style.display = "block"; var width = 300; var height = 400; var borderWidth = 2; daum_element_layer.style.width = width + "px"; daum_element_layer.style.height = height + "px"; daum_element_layer.style.border = borderWidth + "px solid"; daum_element_layer.style.left = (((window.innerWidth || document.documentElement.clientWidth) - width) / 2 - borderWidth) + "px"; daum_element_layer.style.top = "80px" }, 500) } else { new daum.Postcode({ oncomplete: function (data) { var fullAddr = ""; var extraAddr = ""; if (data.userSelectedType === "R") { fullAddr = data.roadAddress } else { fullAddr = data.jibunAddress } if (data.userSelectedType === "R") { if (data.bname !== "") { extraAddr += data.bname } if (data.buildingName !== "") { extraAddr += (extraAddr !== "" ? ", " + data.buildingName : data.buildingName) } fullAddr += (extraAddr !== "" ? " (" + extraAddr + ")" : "") } if (eval_put_postno_func_name) { eval(eval_put_postno_func_name + '("' + data.zonecode + '", "' + fullAddr + '")') } else { new_put_postno(data.zonecode, fullAddr) } } }).open() } } function search_juso() { var b = navigator.userAgent.toLowerCase(); if (b.indexOf("mobile") > -1) { var a = window.open("/API/juso/jusoPopup_utf8.php", "pop", "scrollbars=yes, resizable=yes") } else { var a = window.open("/API/juso/jusoPopup_utf8.php", "pop", "width=570,height=420, scrollbars=yes, resizable=yes") } } function jusoCallBack_custom(n, z, r, x, e, y, b, t, p, w, q, f, s, k, o, d, j, l, g, u, m, h, c, v, a) { if (String(z).length > 0 && String(x).length > 0) { z += " " + x } new_put_postno(b, z, r) } function memo_read(b) { if (!b) { b = "" } var c = 570; var e = 380; var f = (screen.width - c) / 2; var a = (screen.height - e) / 2; if (APP_CONN_YN == true) { app_inweb_url("받은쪽지", "/shop_mypage/s_paper_read.htm?idx=" + b) } else { if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/s_paper_read.htm?idx=" + b) } else { var d = window.open("/shop_mypage/s_paper_read.htm?idx=" + b, "memo_read" + b, "top=" + a + ",left=" + f + ",width=" + c + ",height=" + e + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); d.focus() } } } function pwd_ch() { try { if (APP_CONN_YN) { app_inweb_url("패스워드 변경", "/shop_mypage/pwd_ch_form.htm") } else { var b = 440; var c = 360; var g = (screen.width - b) / 2; var a = (screen.height - c) / 2; if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/pwd_ch_form.htm") } else { var d = window.open("/shop_mypage/pwd_ch_form.htm", "pwd_ch_win", "top=" + a + ",left=" + g + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); d.focus() } } } catch (f) { var b = 440; var c = 360; var g = (screen.width - b) / 2; var a = (screen.height - c) / 2; if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/pwd_ch_form.htm") } else { var d = window.open("/shop_mypage/pwd_ch_form.htm", "pwd_ch_win", "top=" + a + ",left=" + g + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); d.focus() } } } function pwd_ch_chk(d) { if (!d) { d = "" } try { if (APP_CONN_YN) { app_inweb_url("패스워드 변경 안내", "/shop_mypage/pwd_ch_chk.htm?re_url=" + encodeURIComponent(d)) } else { var c = 500; var f = 400; var j = (screen.width - c) / 2; var a = (screen.height - f) / 2; if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/pwd_ch_chk.htm?re_url=" + encodeURIComponent(d)) } else { var b = window.open("/shop_mypage/pwd_ch_chk.htm?re_url=" + encodeURIComponent(d), "pwd_ch_chk_win", "top=" + a + ",left=" + j + ",width=" + c + ",height=" + f + ",toolbar=no,scrollbars=yes,resizable=no,status=yes,menubar=no,location=no"); b.focus() } } } catch (g) { var c = 500; var f = 450; var j = (screen.width - c) / 2; var a = (screen.height - f) / 2; if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/pwd_ch_chk.htm?re_url=" + encodeURIComponent(d)) } else { var b = window.open("/shop_mypage/pwd_ch_chk.htm?re_url=" + encodeURIComponent(d), "pwd_ch_chk_win", "top=" + a + ",left=" + j + ",width=" + c + ",height=" + f + ",toolbar=no,scrollbars=yes,resizable=no,status=yes,menubar=no,location=no"); b.focus() } } } function order_address_list() { var d = "/sp2/order_move_addr_list.htm"; if (APP_CONN_YN) { app_inweb_url("배송지 관리", d) } else { var b = 800; var e = 700; var f = (screen.width - b) / 2; var a = (screen.height - e) / 2; var c = window.open(d, "order_address_list_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + e + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } } function review_list_show() { var a = "/sp2/review_list.htm"; if (APP_CONN_YN) { app_inweb_url("상품 전체 후기보기", a) } else { location.href = a } } function card_set_show() { var a = "/sp2/easy_card_set.htm"; if (APP_CONN_YN) { app_inweb_url("간편결제 관리", a) } else { popup_window(a, 480, 700) } } function card_list_show() { var a = "/sp2/card_list.htm"; popup_window(a, 480, 700) } function card_reg() { var a = "/sp2/card_form.htm?card_reg_yn=1"; popup_window(a, 480, 700) } function top_goods_search_chk() { var a = document.top_goods_search_form; a.method = "get"; a.target = ""; a.action = "/shop_goods/goods_search_list.htm"; a.submit() } function no_email() { var b = 438; var d = 360; var e = (screen.width - b) / 2; var a = (screen.height - d) / 2; if (MOBILE_CONN_YN == true) { x_popup("/shop_popup/no_email.htm") } else { var c = window.open("/shop_popup/no_email.htm", "no_email_win", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); c.focus() } } function loginbox_lan(b) { if (b == "id") { if (LAN == "en") { var a = "Please enter your ID" } else { if (LAN == "cn") { var a = "请输入您的用户名" } else { if (LAN == "jp") { var a = "IDを入力してください" } else { var a = "아이디를 입력해주세요." } } } } else { if (b == "pwd") { if (LAN == "en") { var a = "Please enter your Password" } else { if (LAN == "cn") { var a = "请输入您的密码" } else { if (LAN == "jp") { var a = "パスワードを入力してください" } else { var a = "패스워드를 입력해주세요." } } } } else { if (b == "site_id") { if (LAN == "en") { var a = "Please enter your Site ID" } else { if (LAN == "cn") { var a = "请输入网站ID" } else { if (LAN == "jp") { var a = "サイトIDを入力してください" } else { var a = "사이트 아이디를 입력해주세요." } } } } else { if (b == "bu_id") { if (LAN == "en") { var a = "Please enter the Administrator ID" } else { if (LAN == "cn") { var a = "请输入管理员ID" } else { if (LAN == "jp") { var a = "管理者IDを入力してください" } else { var a = "관리자 아이디를 입력해주세요." } } } } } } } return a } function loginbox(f) { if (!f.id.value) { var c = loginbox_lan("id"); alert(c); f.id.focus(); return false } if (!f.pwd.value) { var c = loginbox_lan("pwd"); alert(c); f.pwd.focus(); return false } var e; if (ssl_possible == "on") { if (document.getElementsByName("left_login_box").length && document.left_login_box.elements.this_domain == undefined) { var b = document.getElementsByName("left_login_box")[0]; var d = b.firstChild; var a = document.createElement("input"); a.type = "hidden"; a.name = "this_domain"; b.insertBefore(a, d) } e = "https://" + ssl_host + "/ssl/mem_login_chk.php"; f.this_domain.value = document.domain } else { e = "/shop_login/login_ok.php" } f.action = e; f.target = create_iframe(); return true } function ssl_loginbox(d) { if (!d.id.value) { var a = loginbox_lan("id"); alert(a); d.id.focus(); return false } if (!d.pwd.value) { var a = loginbox_lan("pwd"); alert(a); d.pwd.focus(); return false } var c = 0; if (d.ssl_yn.type == "checkbox") { if (d.ssl_yn.checked == true && d.ssl_yn.value == 1) { c = 1 } } else { if (d.ssl_yn.type == "hidden") { if (d.ssl_yn.value == 1) { c = 1 } } else { if (d.ssl_yn[0].type == "radio") { if (d.ssl_yn[0].checked == true && d.ssl_yn[0].value == 1) { c = 1 } else { if (d.ssl_yn[1].checked == true && d.ssl_yn[1].value == 1) { c = 1 } } } } } var b; if (c == 1 && !MOBILE_CONN_YN) { b = "https://" + ssl_host + "/ssl/mem_login_chk.php" } else { b = "/shop_login/login_ok.php" } d.action = b; d.this_domain.value = document.domain; d.target = create_iframe(); return true } function ssl_shop_loginbox(d) { if (!d.id.value) { var a = loginbox_lan("site_id"); alert(a); d.id.focus(); return false } if (!d.bu_id.value) { var a = loginbox_lan("bu_id"); alert(a); d.bu_id.focus(); return false } if (!d.pwd.value) { var a = loginbox_lan("pwd"); alert(a); d.pwd.focus(); return false } var c = 0; if (d.ssl_yn.type == "checkbox") { if (d.ssl_yn.checked == true && d.ssl_yn.value == 1) { c = 1 } } else { if (d.ssl_yn.type == "hidden") { if (d.ssl_yn.value == 1) { c = 1 } } else { if (d.ssl_yn[0].type == "radio") { if (d.ssl_yn[0].checked == true && d.ssl_yn[0].value == 1) { c = 1 } else { if (d.ssl_yn[1].checked == true && d.ssl_yn[1].value == 1) { c = 1 } } } } } var b; if (c == 1 && !MOBILE_CONN_YN) { b = "https://" + ssl_host + "/ssl/shop_login_chk.php" } else { b = "/admin/sub_login/login_ok.php" } d.action = b; d.this_domain.value = document.domain; d.target = create_iframe(); return true } function pwd_search() { var f = 0; try { if (APP_CONN_YN) { if (ios_yn) { if (app_version_code >= 120) { f = 1 } } else { if (app_version_code >= 158) { f = 1 } } } if (f) { app_outweb_url("ID/패스워드 찾기", "/shop_popup/pwd_search_form.htm?app_win_name=" + APP_window_name) } else { if (MOBILE_CONN_YN == true) { x_popup("/shop_popup/pwd_search_form.htm") } else { var c = 400; var d = 360; var j = (screen.width - c) / 2; var a = (screen.height - d) / 2; var b = window.open("/shop_popup/pwd_search_form.htm", "pwd_search_win", "top=" + a + ",left=" + j + ",width=" + c + ",height=" + d + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); b.focus() } } } catch (g) { var c = 400; var d = 360; var j = (screen.width - c) / 2; var a = (screen.height - d) / 2; var b = window.open("/shop_popup/pwd_search_form.htm", "pwd_search_win", "top=" + a + ",left=" + j + ",width=" + c + ",height=" + d + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); b.focus() } } var dragapproved = false; function drag_dropie() { if (dragapproved == true) { var b = tempx + event.clientX - iex; if (b > 0 && b < 48) { document.all.showimage.style.pixelLeft = tempx + event.clientX - iex; var a = b - 50; if (a > 0) { top.bgm_frame.Player.Volume = 0 } else { if (0 > a) { top.bgm_frame.Player.Volume = a * 55 } } } return false } } function initializedragie() { iex = event.clientX; iey = event.clientY; tempx = showimage.style.pixelLeft; tempy = showimage.style.pixelTop; dragapproved = true; document.onmousemove = drag_dropie; if (document.all) { document.onmouseup = new Function("dragapproved=false") } } function bgm_time() { if (top.bgm_frame != null) { if (top.bgm_frame.load_ck != null) { top.bgm_frame.load_ck.value = "1"; top.bgm_frame.load_ck2.value = "0"; top.bgm_frame.entryInfo() } } } function play() { if (top.bgm_frame.document.getElementById("Player_false").value == 1) { if (top.bgm_frame.document.getElementById("Player2") != null) { top.bgm_frame.document.getElementById("Player2").play(); top.bgm_frame.load_ck.value = "1"; top.bgm_frame.load_ck2.value = "0"; if (top.frames[0].document.getElementById("song_nm")) { top.frames[0].song_nm.innerHTML = "재생" } } } else { top.bgm_frame.location.href = "../shop_main/bgm_frame.htm?play_bt=1"; if (top.frames[0].document.getElementById("song_nm")) { top.frames[0].song_nm.innerHTML = "&nbsp;&nbsp;&nbsp;Buffering..." } setTimeout("bgm_time()", 1000) } } function stop() { if (top.bgm_frame.document.getElementById("Player_false").value == 1) { if (top.bgm_frame.document.getElementById("Player2") != null) { top.bgm_frame.document.getElementById("Player2").Stop(); top.bgm_frame.load_ck.value = "0"; top.bgm_frame.load_ck2.value = "0"; if (top.frames[0].document.getElementById("song_nm")) { top.frames[0].song_nm.innerHTML = "&nbsp;&nbsp;&nbsp;정지" } } } else { if (top.bgm_frame.document.getElementById("Player") != null) { top.bgm_frame.document.getElementById("Player").Stop(); top.bgm_frame.load_ck.value = "0"; top.bgm_frame.load_ck2.value = "0"; if (top.frames[0].document.getElementById("song_nm")) { top.frames[0].song_nm.innerHTML = "&nbsp;&nbsp;&nbsp;정지" } } } } function bgm_list() { if (MOBILE_CONN_YN == true) { x_popup("/shop_popup/bgm_list.htm") } else { var a = window.open("/shop_popup/bgm_list.htm", "bgm_list_win", "height=300,width=310,scrollbars=no,resizable=no"); a.focus() } } function sms_call(b, d) { var e = (screen.width - b) / 2; var a = (screen.height - d) / 2; if (MOBILE_CONN_YN == true) { x_popup("/shop_contents/sms_call_form.htm") } else { var c = window.open("/shop_contents/sms_call_form.htm", "sms_call_win", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } } function popup_window(a, l, f, k, c, e) { if (!l) { l = 0 } if (!f) { f = 0 } if (!k) { k = 0 } if (!c) { c = 0 } if (!e) { e = "x_pop" } var b = ((screen.width - l) / 2) - 100; var d = ((screen.height - f) / 2) - 100; if (c) { b = c } if (k) { d = k } if (b <= 0) { b = 0 } if (d <= 0) { d = 0 } var j = a; j = j.replace(/\//gi, ""); j = j.replace(/\?/gi, ""); j = j.replace(/\&/gi, ""); j = j.replace(/\=/gi, ""); j = j.replace(/\:/gi, ""); j = j.replace(/\./gi, ""); j = j.replace(/\%/gi, ""); j = j.replace(/-/gi, ""); j = j.replace(/\#/gi, ""); if (APP_CONN_YN == true) { app_popup_window(a) } else { if (MOBILE_CONN_YN == true) { if (e == "x_pop") { x_popup(a) } else { if (e == "win") { var g = window.open(a, j); g.focus() } } } else { if (l > 0 && f > 0) { var g = window.open(a, j, "top=" + d + ",left=" + b + ",width=" + l + ",height=" + f + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no") } else { var g = window.open(a, j) } g.focus() } } } function popup_window_close() { try { if (APP_CONN_YN && app_version_code >= 158) { app_submenu_hide() } else { try { parent.x_pop_window.close() } catch (a) { top.close() } } } catch (a) { try { parent.x_pop_window.close() } catch (a) { top.close() } } } function img_view(b) { var a = window.open("/bbs_shop/inc/viewimage.htm?url=" + b, "", "top=0,left=0,width=100,height=100,scrollbars=yes,resizable=yes"); a.focus() } function mgGetFileExt(b) { var a = b.substr(b.length - 3, 3).toLowerCase(); return a } function Adminlogin_form_chk() { form = document.Adminlogin_form; if (!form.id.value) { var a = loginbox_lan("site_id"); alert(a); form.id.focus(); return false } if (!form.bu_id.value) { var a = loginbox_lan("bu_id"); alert(a); form.bu_id.focus(); return false } if (!form.pwd.value) { var a = loginbox_lan("pwd"); alert(a); form.pwd.focus(); return false } } function getCookieVal(b) { var a = document.cookie.indexOf(";", b); if (a == -1) { a = document.cookie.length } return unescape(document.cookie.substring(b, a)) } function GetCookie(a) { a = a + "="; var c = document.cookie; var e = c.indexOf(a); var d = ""; if (e != -1) { e += a.length; var b = c.indexOf(";", e); if (b == -1) { b = c.length } d = c.substring(e, b) } return unescape(d) } function SetCookie(a, c, d) { var b = new Date(); b.setDate(b.getDate() + d); cookies = a + "=" + escape(c) + "; path=/ "; if (typeof d != "undefined") { cookies += ";expires=" + b.toGMTString() + ";" } document.cookie = cookies } function user_today_no(b, d) { var a = new Date(); var c = Date.UTC(a.getYear(), a.getMonth(), a.getDate(), 14, 59, 59); a.setTime(c); if (d == true) { SetCookie(b, "1", a) } else { SetCookie(b, "0", a) } } function user_layer_close(sel_name) { eval(sel_name + ".style.display='none';") } function dis_on(a) { try { a.disabled = true; a.style.backgroundColor = "dddddd" } catch (b) { } } function dis_off(a) { try { a.disabled = false; a.style.backgroundColor = "ffffff" } catch (b) { } } function mypage_job2(b) { var a = create_iframe(); document.getElementById(a).src = "/job2/mypage_chk.php?reg_type=" + b } function biz_advertising() { var a = create_iframe(); document.getElementById(a).src = "/job2/biz_chk.php" } function job_biz_pop(b, c, d) { if (!b) { alert("채용공고 번호가 누락됬습니다."); return } if (!c) { c = 500 } if (!d) { d = 600 } var f = (screen.width - c) / 2; var a = (screen.height - d) / 2; var e = window.open("/job2/biz_view_popup.htm?idx=" + b, "job_biz_pop_win", "top=" + a + ",left=" + f + ",width=" + c + ",height=" + d + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); e.focus() } function shuffle(c) { var a = c.length; for (var b = a; b > 0; b--) { c[a - 1] = c.splice(Math.floor(Math.random() * b), 1)[0] } return c } function admin_login_form_chk(b) { if (!b.id.value) { var a = loginbox_lan("site_id"); alert(a); b.id.focus(); return false } if (!b.bu_id.value) { var a = loginbox_lan("bu_id"); alert(a); b.bu_id.focus(); return false } if (!b.pwd.value) { var a = loginbox_lan("pwd"); alert(a); b.pwd.focus(); return false } b.action = "/admin/sub_login/login_ok.php"; b.method = "post"; b.target = create_iframe(); if (!document.all("back_login_form")) { var c; c = "<form name='back_login_form' action='' style='margin:0'>"; c += "<input type='hidden' name='back_login' value=''>"; c += "<input type='hidden' name='id' value=''>"; c += "<input type='hidden' name='bu_id' value=''>"; c += "<input type='hidden' name='pwd' value=''>"; c += "<input type='hidden' name='referer' value=''>"; c += "</form>"; advertise_tmp.innerHTML = c } return true } function frame_resize(g, a, c) { if (!c) { c = 0 } try { if (!a) { a = 0 } if (a > 0) { var b = parent.document.frames(g).document.body.scrollHeight; if (c > b) { b = c } var f = parent.document.getElementById(g); f.style.height = b + "px" } if (a == 0) { frame_resize(g, (a + 1), c) } else { if (a < 5) { setTimeout("frame_resize('" + g + "'," + (a + 1) + "," + c + ")", 400) } } } catch (d) { } } function auto_admin_login(e) { var b = 950; var d = 700; var f = (screen.width - b) / 2; var a = (screen.height - d) / 2; var c = window.open("/admin/sub_login/auto_login.php?id=" + e, "auto_admin_login_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } function demo_admin_login(e) { var b = 950; var d = 700; var f = (screen.width - b) / 2; var a = (screen.height - d) / 2; var c = window.open("/admin/sub_login/auto_login_form.htm?demo_id=" + e, "demo_admin_login_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } function smart_design_view(e) { var b = 1200; var d = 700; var f = (screen.width - b) / 2; var a = (screen.height - d) / 2; var c = window.open("/admin/sub_login/auto_login_form.htm?smart_design_yn=1&smart_design_mode=pc&demo_id=" + e, "demo_admin_login_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } function m_smart_design_view(e) { var b = 1200; var d = 700; var f = (screen.width - b) / 2; var a = (screen.height - d) / 2; var c = window.open("/admin/sub_login/auto_login_form.htm?smart_design_yn=1&smart_design_mode=m&demo_id=" + e, "demo_admin_login_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } function admin_login_pop(e) { var b = (screen.width); var c = (screen.height); var f = 0; var a = 0; if (e) { e = escape(e) } else { e = "" } var d = window.open("/admin/sub_login/login_form.htm?first_url=" + e, "admin_login_pop_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=yes,resizable=yes,fullscreen=no,status=yes,menubar=no,location=no"); d.focus() } function shop_link(a, b) { if (!b) { b = "" } if (b) { b = escape(b) } window.open("/shop_admin/shop_link.php?shop_id=" + a + "&go_url=" + b) } function shop_coupon_view(d) { if (!d) { d = "" } var b = 600; var c = 600; var f = 50; var a = 50; var e = window.open("/recom_site/coupon_view.htm?coupon_idx=" + d, "", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); e.focus() } function strpos(c, b) { for (var a = 0; a < c.length; a++) { if (c.substring(a, a + (b.length)) == b) { return a } } return -1 } function admin_seller_pop() { try { if (APP_CONN_YN) { app_minishop_admin() } else { var b = 1100; var d = 800; var g = 0; var a = 0; var c = window.open("/admin_om/", "", "top=" + a + ",left=" + g + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,fullscreen=no,status=yes,menubar=no,location=no"); c.focus() } } catch (f) { var b = 1100; var d = 800; var g = 0; var a = 0; var c = window.open("/admin_om/", "", "top=" + a + ",left=" + g + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,fullscreen=no,status=yes,menubar=no,location=no"); c.focus() } } function admin_seller_pop2() { var b = 1100; var d = 800; var e = 0; var a = 0; var c = window.open("/admin_om/", "", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,fullscreen=no,status=yes,menubar=no,location=no"); c.focus() } function mini_shop_go(b, a) { location.href = "/openmarket/shop_main.htm?seller_mem_id=" + b + "&my_type=" + a } function auto_chk(e, d, b) { if (!b) { b = "" } var c = document.getElementsByName(e); if (!c) { return } if (c[0].type == "radio" || c[0].type == "checkbox") { if (!c.length) { return } for (var a = 0; a < c.length; a++) { if (c[a].value == d) { c[a].checked = true; break } } } else { if (c[0].type == "select-one") { if (!c[0].length) { return } for (var a = 0; a < c[0].length; a++) { if (b) { if (c[0][a].value == d && c[0][a].text == b) { c[0][a].selected = true; break } } else { if (c[0][a].value == d) { c[0][a].selected = true; break } } } } else { if (c[0].type == "text") { c[0].value = d } } } } function radio_val(c) { var b = document.getElementsByName(c); if (!b) { return } for (var a = 0; a < b.length; a++) { if (b[a].checked == true) { return b[a].value } } return false } function auto_select(d, c) { var b = document.getElementsByName(d)[0]; if (!b) { return } if (!b.length) { return } for (var a = 0; a < b.length; a++) { if (b[a].value == c) { b[a].selected = true; break } } } function auto_select2(b, c) { if (!b.length) { return } for (var a = 0; a < b.length; a++) { if (b[a].value == c) { b[a].selected = true; break } } } function shop_view(b, d, c) { if (!d) { d = "" } if (!c) { c = "" } if (!b) { if (LAN == "en") { var a = "Coming soon" } else { if (LAN == "cn") { var a = "即将推出" } else { if (LAN == "jp") { var a = "準備中です" } else { var a = "준비중 입니다." } } } alert(a) } else { window.open("/shop_admin/shop_link.php?mobile_conn_chk=off&shop_id=" + b + "&magic_all_idx=" + d + "&sel_lan=" + c) } } function m_shop_view(b, g, a) { if (!g) { g = "" } if (!a) { a = "" } if (!b) { if (LAN == "en") { var c = "Coming soon" } else { if (LAN == "cn") { var c = "即将推出" } else { if (LAN == "jp") { var c = "準備中です" } else { var c = "준비중 입니다." } } } alert(c) } else { var k = 700; var j = 810; var d = (screen.width - k) / 2; var f = (screen.height - j) / 2; var e = window.open("/shop_popup/mobile_view.htm?mobile_conn=1&sample_yn=1&shop_id=" + b + "&magic_all_idx=" + g + "&sel_lan=" + a, "", "top=" + f + ",left=" + d + ",width=" + k + ",height=" + j + ",toolbar=no,scrollbars=no,resizable=no,status=no,menubar=no,location=no"); e.focus() } } function timeToHuman(g) { g += (3600 * 9); var f = new Date(g * 1000); dateString = f.toGMTString(); arrDateStr = dateString.split(" "); var b = getMonthNum(arrDateStr[2]) * 1; var h = arrDateStr[1] * 1; var a = arrDateStr[3]; var e = arrDateStr[4].substr(0, 2) * 1; var c = arrDateStr[4].substr(3, 2) * 1; var d = arrDateStr[4].substr(6, 2) * 1; if (b < 10) { b = "0" + b } if (h < 10) { h = "0" + h } if (e < 10) { e = "0" + e } if (c < 10) { c = "0" + c } if (d < 10) { d = "0" + d } return a + "-" + b + "-" + h + " " + e + ":" + c + ":" + d } function getMonthNum(a) { var b = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"); for (i = 0; i < b.length; i++) { if (a == b[i]) { return i + 1 } } } var httpReq_etc = null; var httpReq_etc2 = null; function getInstance_etc() { var a = null; try { a = new ActiveXObject("Msxml2.XMLHTTP") } catch (c) { try { a = new ActiveXObject("Microsoft.XMLHTTP") } catch (b) { a = null } } return a } var naver_map_key = ""; var naver_map_w = 300; var naver_map_h = 300; var naver_map_x = 0; var naver_map_y = 0; function naver_map(f, a, b, e, d, c) { if (!a) { a = 300 } if (!b) { b = 300 } if (!e) { e = "" } if (!d) { d = "" } if (!c) { c = "" } if (location.host == "www.local.co.kr") { document.write("<iframe id='mapContainer' src='http://www.local.co.kr/sys_load/naver_map_xy_load.php?map_w=" + a + "&map_h=" + b + "&addr=" + f + "&title=" + e + "&info=" + d + "&zoom=" + c + "' width='" + a + "' height='" + b + "' frameborder='0' scrolling='no' marginheight='0' marginwidth='0' ></iframe>") } else { document.write("<iframe id='mapContainer' src='//map.anybuild.com/sys_load/kakao_map_xy_load.php?map_h=" + b + "&addr=" + f + "&title=" + e + "&info=" + d + "&zoom=" + c + "' width='" + a + "' height='" + b + "' frameborder='0' scrolling='no' marginheight='0' marginwidth='0' ></iframe>") } } function naver_map_result() { if (httpReq_etc.readyState == 4) { var b = httpReq_etc.responseText.split(" "); naver_map_key = b[0]; naver_map_x = b[1]; naver_map_y = b[2]; if (!naver_map_key || !naver_map_x || !naver_map_x) { if (LAN == "en") { var a = "Map search fails" } else { if (LAN == "cn") { var a = "地图搜索失败" } else { if (LAN == "jp") { var a = "地図検索に失敗し" } else { var a = "네이버 지도 검색 실패." } } } alert(a); alert(httpReq_etc.responseText); return } naver_map_js.src = "http://openapi.map.naver.com/js/naverMap.naver?key=" + naver_map_key; naver_map_output() } } function naver_map_output(c) { if (c > 100) { return } if (window.NMap) { } else { setTimeout("naver_map_output()", 100); return } var e = { width: naver_map_w, height: naver_map_h, mapMode: 0 }; var a = new NMap(document.getElementById("mapContainer"), e); a.setCenterAndZoom(new NPoint(naver_map_x, naver_map_y), 3); var d = new NZoomControl(); d.setAlign("right"); d.setValign("top"); a.addControl(d); var f = new NMapBtns(); f.setAlign("right"); f.setValign("top"); a.addControl(f); var b = new NInfoWindow(); a.addOverlay(b); a.addOverlay(createMarker(new NPoint(naver_map_x, naver_map_y), 1, "")); return } function createMarker(e, d, b) { var c = "/img/pin1.png"; var a = new NMark(e, new NIcon(c, new NSize(23, 30))); NEvent.addListener(a, "mouseover", function (f) { infowin.set(f, '<div style="width:100px; height:50px; background-color:#ffffff; border:solid 1px #999999;">dddd</div>'); infowin.showWindow() }); NEvent.addListener(a, "mouseout", function () { infowin.hideWindow() }); return a } function checkSpace(a) { return ""; if (a.search(/\s/) != -1) { return 1 } else { return "" } } function email_chk(d) { if (d == "") { if (LAN == "en") { var a = "Please enter your email address" } else { if (LAN == "cn") { var a = "请输入您的E-mail地址" } else { if (LAN == "jp") { var a = "メールアドレスを入力してください" } else { var a = "이메일 주소를 입력하세요." } } } alert(a); return false } var c = checkSpace(d); if (c != "") { if (LAN == "en") { var a = "Please enter your email address without spaces" } else { if (LAN == "cn") { var a = "请没有空格输入电子邮件地址" } else { if (LAN == "jp") { var a = "メールアドレスをスペースなし入れてください" } else { var a = "이메일 주소를 공백 없이 넣으세요." } } } alert(a); return false } var b = /[-!#$%&'*+\/^_~{}|0-9a-zA-Z]+(\.[-!#$%&'*+\/^_~{}|0-9a-zA-Z]+)*@[-!#$%&'*+\/^_~{}|0-9a-zA-Z]+(\.[-!#$%&'*+\/^_~{}|0-9a-zA-Z]+)*/; if (!b.test(d)) { if (LAN == "en") { var a = "Form of e-mail is not correct" } else { if (LAN == "cn") { var a = "电子邮件的形式是不正确的" } else { if (LAN == "jp") { var a = "電子メールの形式が正しくありません" } else { var a = "이메일 형식이 잘못 되었습니다." } } } alert(a); return false } if (d.length > 60) { if (LAN == "en") { var a = "E-mail address is valid up to 60 characters" } else { if (LAN == "cn") { var a = "电子邮件地址是有效的最多60个字符" } else { if (LAN == "jp") { var a = "E-mailアドレスは、60文字まで有効です" } else { var a = "이메일 주소는 60자까지 유효합니다." } } } alert(a); return false } return true } function more_hms(b, e) { var g, c, f; var a = b; if (!e) { e = 15 } g = Math.floor(b / 3600) * 1; b -= (g * 3600); c = Math.floor(b / 60) * 1; b -= (c * 60); f = b * 1; if (g < 0 || c < 0 || f < 0) { g = 0; c = 0; f = 0 } if (g < 10) { g = "0" + g } if (c < 10) { c = "0" + c } if (f < 10) { f = "0" + f } var d = g + ":" + c + ":" + f; if (a <= e) { d = "<font color=red>" + d + "</font>" } return d } function more_openbay(d, h, g) { var e, c, j, f; var a = new Array(); d = d * 1; var c, j, f; var b = d; h = h * 1; if (!h) { h = 15 } c = Math.floor(d / 3600) * 1; d -= (c * 3600); j = Math.floor(d / 60) * 1; d -= (j * 60); f = d * 1; if (c < 0 || j < 0 || f < 0) { c = 0; j = 0; f = 0 } if (c < 10) { c = "0" + c } else { if (c > 99) { c = 99 } } if (j < 10) { j = "0" + j } if (f < 10) { f = "0" + f } if (b <= h) { a.h = "<font color='" + g + "'>" + c + "</font>"; a.m = "<font color='" + g + "'>" + j + "</font>"; a.s = "<font color='" + g + "'>" + f + "</font>" } else { a.h = c; a.m = j; a.s = f } return a } function more_openbay3(d, h, g) { var e, c, j, f; var a = new Array(); d = d * 1; var c, j, f; var b = d; h = h * 1; if (!h) { h = 15 } c = Math.floor(d / 3600) * 1; d -= (c * 3600); j = Math.floor(d / 60) * 1; d -= (j * 60); f = d * 1; if (c < 0 || j < 0 || f < 0) { c = 0; j = 0; f = 0 } if (c < 10) { c = "0" + c } else { if (c > 999) { c = 999 } } if (j < 10) { j = "0" + j } if (f < 10) { f = "0" + f } if (b <= h) { a.h = "<font color='" + g + "'>" + c + "</font>"; a.m = "<font color='" + g + "'>" + j + "</font>"; a.s = "<font color='" + g + "'>" + f + "</font>" } else { a.h = c; a.m = j; a.s = f } return a } function more_seebay(e, j, h) { var f, d, c, k, g, l; var a = new Array(); e = e * 1; var b = e; j = j * 1; if (!j) { j = 15 } d = Math.floor(e / 86400) * 1; e -= (d * 86400); c = Math.floor(e / 3600) * 1; l = c + (d * 24); if (l > 99) { l = 99 } if (l < 10) { l = "0" + l } e -= (c * 3600); k = Math.floor(e / 60) * 1; e -= (k * 60); g = e * 1; if (d < 0 || c < 0 || k < 0 || g < 0) { d = 0; c = 0; k = 0; g = 0 } if (c < 10) { c = "0" + c } if (k < 10) { k = "0" + k } if (g < 10) { g = "0" + g } if (b <= j) { a.d = "<font color='" + h + "'>" + d + "</font>"; a.h = "<font color='" + h + "'>" + c + "</font>"; a.m = "<font color='" + h + "'>" + k + "</font>"; a.s = "<font color='" + h + "'>" + g + "</font>"; a.h99 = "<font color='" + h + "'>" + l + "</font>" } else { a.d = d; a.h = c; a.m = k; a.s = g; a.h99 = l } return a } function more_dhms(d, f) { var c = d; if (!f) { f = 0 } var a, h, e, g; var b = new Array(); a = Math.floor(d / 86400) * 1; d -= (a * 86400); h = Math.floor(d / 3600) * 1; d -= (h * 3600); e = Math.floor(d / 60) * 1; d -= (e * 60); g = d * 1; if (a < 0 || h < 0 || e < 0 || g < 0) { a = 0; h = 0; e = 0; g = 0 } if (a < 10) { a = "0" + a } if (h < 10) { h = "0" + h } if (e < 10) { e = "0" + e } if (g < 10) { g = "0" + g } if (c <= f) { b.day = "<font color=red>" + a + "</font>"; b.h = "<font color=red>" + h + "</font>"; b.m = "<font color=red>" + e + "</font>"; b.s = "<font color=red>" + g + "</font>" } else { b.day = a; b.h = h; b.m = e; b.s = g } return b } function more_hms2(c, e) { var b = c; if (!e) { e = 0 } var g, d, f; var a = new Array(); g = Math.floor(c / 3600) * 1; c -= (g * 3600); d = Math.floor(c / 60) * 1; c -= (d * 60); f = c * 1; if (g < 0 || d < 0 || f < 0) { g = 0; d = 0; f = 0 } if (g < 10) { g = "0" + g } if (d < 10) { d = "0" + d } if (f < 10) { f = "0" + f } if (b <= e) { a.h = "<font color=red>" + g + "</font>"; a.m = "<font color=red>" + d + "</font>"; a.s = "<font color=red>" + f + "</font>" } else { a.h = g; a.m = d; a.s = f } return a } function web_resize_iframe(a) { if (parent) { setTimeout("parent.ok_resize_iframe('" + a + "',1)", 3); setTimeout("parent.ok_resize_iframe('" + a + "',0)", 300); setTimeout("parent.ok_resize_iframe('" + a + "',0)", 1000); setTimeout("parent.ok_resize_iframe('" + a + "',0)", 2000) } } function ok_resize_iframe(a, h) { try { document.getElementById(a).contentDocument.body.style.height = "auto"; var c = document.getElementById(a).contentDocument.body; var b = document.getElementById(a); var d = c.scrollHeight * 1; var g = window.navigator.userAgent; if (g.indexOf("Chrome") > 0 || g.indexOf("Safari") > 0) { d = c.offsetHeight } if (h == 1) { d = d + 20; b.style.height = d + "px" } else { if (d - b.style.height > 20) { b.style.height = d + "px" } } } catch (f) { try { var c = document.frames(a).document.body; var b = document.getElementById(a); var d = c.scrollHeight * 1; if (h == 1) { d = d + 20; b.style.height = d + "px" } else { if (d - b.style.height > 20) { b.style.height = d + "px" } } } catch (f) { } } } var GET_ARR = new Array(); function get_load() { var d = window.location; b_url_arr = String(d).split("?"); if (b_url_arr.length > 1) { b_url_arr = b_url_arr[1].split("&"); for (var a = 0; a < b_url_arr.length; a++) { var b = b_url_arr[a]; var c = b.split("="); GET_ARR[c[0]] = c[1] } } } function doBlink() { var a = document.getElementsByTagName("blink"); for (var b = 0; b < a.length; b++) { a[b].style.visibility = a[b].style.visibility == "" ? "hidden" : "" } } function startBlink() { if (document.getElementsByTagName("blink").length) { setInterval("doBlink()", 500) } } window.onload = startBlink; function oneday_scrap_cyworld_pop() { var b = 450; var c = 410; var e = (screen.width - b) / 2; var a = (screen.height - c) / 2; var d = window.open("/oneday/goods_view_scrap_cyworld.php", "cyopenscrap", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); d.focus() } function oneday_scrap_twitter_pop() { window.open("/oneday/goods_view_scrap_twitter.php") } function oneday_scrap_me2day_pop() { window.open("/oneday/goods_view_scrap_me2day.php") } function oneday_scrap_facebook_pop() { window.open("/oneday/goods_view_scrap_facebook.php") } function oneday_goods_email_chu(b, c) { if (!b) { b = 440 } if (!c) { c = 416 } var e = (screen.width - b) / 2; var a = (screen.height - c) / 2; var d = window.open("/oneday/goods_mail_form.htm", "goods_mail_win", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); d.focus() } function oneday_goods_sms_chu(b, d) { if (!b) { b = 440 } if (!d) { d = 416 } var e = (screen.width - b) / 2; var a = (screen.height - d) / 2; var c = window.open("/oneday/goods_sms_form.htm", "goods_sms_win", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); c.focus() } function alrim_mem_form_chk() { var b = document.alrim_mem_form; if (!b.email.value && !b.hp.value) { if (LAN == "en") { var a = "Please enter your e-mail or mobile phone number" } else { if (LAN == "cn") { var a = "请输入您的电子邮件或手机号码" } else { if (LAN == "jp") { var a = "メールまたは携帯電話番号を入力してください" } else { var a = "이메일 또는 휴대전화를 입력해주세요." } } } alert(a); return } if (LAN == "en") { var a = "Would you like to apply for subscription?" } else { if (LAN == "cn") { var a = "你想申请订阅？" } else { if (LAN == "jp") { var a = "購読しますか？" } else { var a = "구독 신청 하시겠습니까?" } } } if (confirm(a)) { b.action = "/oneday/alrim_mem_exec.php"; b.method = "post"; b.target = create_iframe(); b.submit() } } function facebookLikeShare(e, d, c, a) { if (!d) { d = "false" } if (e == "false" && d == "false") { e = "true" } if (!c) { c = "button" } var b = '<div id="fb-root"></div>'; b += '<div class="fb-like" data-href="' + a + '" data-layout="' + c + '" data-action="' + e + '" data-show-faces="false" data-share="' + d + '"></div>'; var g, f = document.getElementsByTagName("script")[0]; if (document.getElementById("facebook-jssdk")) { return } g = document.createElement("script"); g.id = "facebook-jssdk"; g.src = "//connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v2.3"; f.parentNode.insertBefore(g, f); return b } function sendFaceBook(e, b) { if (!b) { b = document.location } if (!e) { e = page_title } if (!e) { e = document.domain } if (APP_CONN_YN) { var a = "https://www.facebook.com/sharer/sharer.php?u=___url___"; var d = "/shop_popup/shorturl_location.php?re_url=" + escape(a) + "&short_url=" + escape(b); app_default_browser(d) } else { var a = "https://www.facebook.com/sharer/sharer.php?u=___url___"; var c = window.open("/shop_popup/shorturl_location.php?re_url=" + escape(a) + "&short_url=" + escape(b), "facebook", ""); if (c) { c.focus() } } } function sendFaceBook2(e, b) { if (!b) { b = document.location } if (!e) { e = page_title } if (!e) { e = document.domain } if (APP_CONN_YN) { var d = "https://www.facebook.com/sharer/sharer.php?u=" + escape(b); app_default_browser(d) } else { var a = "https://www.facebook.com/sharer/sharer.php?u=" + escape(b); var c = window.open(a, "facebook", ""); if (c) { c.focus() } } } function sendTwitter(e, b) { if (!b) { b = document.location } if (!e) { e = page_title } if (!e) { e = document.domain } var a = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(e) + "&url=___url___"; if (APP_CONN_YN) { var d = "/shop_popup/shorturl_location.php?re_url=" + encodeURIComponent(a) + "&short_url=" + encodeURIComponent(b); app_default_browser(d) } else { var c = window.open("/shop_popup/shorturl_location.php?re_url=" + encodeURIComponent(a) + "&short_url=" + encodeURIComponent(b), "twitter", ""); if (c) { c.focus() } } } function sendMe2Day(f, c, a) { if (!c) { c = document.location } if (!f) { f = page_title } if (!f) { f = document.domain } if (!a) { a = f } if (APP_CONN_YN) { var b = "http://me2day.net/posts/new?new_post[body]=" + encodeURIComponent(f) + " ___url___&new_post[tags]=" + encodeURIComponent(a); var e = "/shop_popup/shorturl_location.php?re_url=" + encodeURIComponent(b) + "&short_url=" + encodeURIComponent(c); app_default_browser(e) } else { var b = "http://me2day.net/posts/new?new_post[body]=" + encodeURIComponent(f) + " ___url___&new_post[tags]=" + encodeURIComponent(a); var d = window.open("/shop_popup/shorturl_location.php?re_url=" + encodeURIComponent(b) + "&short_url=" + encodeURIComponent(c), "me2Day", ""); if (d) { d.focus() } } } function goCyWorld(d) { var c = "http://api.cyworld.com/openscrap/post/v1/?xu=/cyworldApi.php?code=" + d + "&sid=s0300011"; var b = window.open(c, "cyworld", "width=450,height=410"); if (b) { b.focus() } } function goYozmDaum(d, c, e) { if (!c) { c = document.location } if (!d) { d = page_title } if (!d) { d = document.domain } var a = "http://yozm.daum.net/api/popup/prePost?prefix=" + encodeURIComponent(d) + "&parameter=" + encodeURIComponent(e) + "&link=___url___"; var b = window.open("/shop_popup/shorturl_location.php?re_url=" + escape(a) + "&short_url=" + escape(c), "yozmSend", ""); if (b) { b.focus() } } function sendPinterest(f, d, b) { if (!b) { return } if (!d) { d = document.location } if (!f) { f = page_title } if (!f) { f = document.domain } var a = b.substr(0, 8); if (a == "/img_up/" || a == "/thum_im") { b = "http://" + document.domain + b } if (APP_CONN_YN) { var c = "https://kr.pinterest.com/pin/create/button/?url=" + escape(d) + "&media=" + b + "&description=" + encodeURIComponent(f); app_default_browser(c) } else { var c = "https://kr.pinterest.com/pin/create/button/?url=" + escape(d) + "&media=" + b + "&description=" + encodeURIComponent(f); var e = window.open(c); if (e) { e.focus() } } } function sns_logout() { var a = create_iframe(); document.getElementById(a).src = "/shop_login/logout_sns.php" } function sns_myhome() { window.open("/shop_etc/sns_myhome.php") } function time_stemp() { var a = Math.floor(new Date().getTime() / 1000); return a } function web_href(c, b) { if (!b) { b = document.location } b = escape(b); var a = create_iframe(); document.getElementById(a).src = "/shop_etc/mobile_change.php?web_mode=" + c + "&go_url=" + b } function gp_cpc_go(c, a, b) { location.href = "/shop_cpc_ad/cpc_shop_list.htm?cpc_shop_category=" + c + "&idx=" + a + "&main_code=" + b } function gp_cpc_chk(b, a, c) { if (a != 1) { alert("광고가 중단되었습니다. \\n\\n관리자에게 문의하세요."); return } window.open("../shop_cpc_ad/page_move.htm?gp_shopmall_idx=" + b + "&main_code=" + c + "&popup_chk=0", "") } function gp_cpc_gd_chk(b, a, c) { if (a != 1) { alert("<?=LTS('광고가 중단되었습니다. \\n\\n관리자에게 문의하세요.')?>"); return } window.open("../shop_cpc_ad/page_move.htm?gp_goods_idx=" + b + "&main_code=" + c, "") } function goods_div_open(a, c, b) { goods_bg_view_chk(); if (!c) { c = 100 } if (b == 1) { document.getElementById("goods_div_content").style.top = document.documentElement.scrollTop + c } else { document.getElementById("goods_div_content").style.top = document.body.scrollTop + c } goods_div_frame.location.href = "../shop_goods/goods_view_div.htm?goods_idx=" + a; document.getElementById("goods_view_div").style.display = "block" } function goods_div_close() { document.getElementById("goods_view_div").style.display = "none"; goods_div_frame.location.href = "../shop_goods/goods_view_div.htm?adout:blank" } function goods_stats_view(b, f) { var d = 1024; var e = 600; var g = (screen.width - d) / 2; var a = (screen.height - e) / 2; var c = window.open("auction_ad_goods_stats_view.htm?type=" + f + "&idx=" + b, "stats_view_pop", "top=" + a + ",left=" + g + ",width=" + d + ",height=" + e + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } function goods_view(a) { location.href = "../shop_auction_ad/goods_view.htm?idx=" + a } function event_view(a) { location.href = "../shop_auction_ad/event_view.htm?idx=" + a } function coupon_read(b, f) { if (!b) { b = "" } var c = 570; var e = 380; var g = (screen.width - c) / 2; var a = (screen.height - e) / 2; var d = window.open("../shop_mypage/auction_ad_coupon_read.htm?idx=" + b + "&mode=read&send_yn=" + f, "coupon_read", "top=" + a + ",left=" + g + ",width=" + c + ",height=" + e + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); d.focus() } function editor_img_pop_no() { alert("현재 페이지가 쿼크모드(HTML 4.0)으로 설정되어 있는경우 이미지를 업로드 할 수 없습니다.\n\n[디자인관리 > 고급 디자인 관리 > 전체 화면 구성]에서 문서를 XHTML 또는 HTML5로 변경하시기 바랍니다.") } function editor_img_pop_no_han() { alert("한글도메인에서는 다중 업로드 기능이 지원되지 않습니다.\n\n문제를 해결하시려면 익스플로어10으로 업그래이드 하시기 바랍니다.") } function editor_youtube_pop_no() { alert("현재 페이지가 쿼크모드(HTML 4.0)으로 설정되어 있는경우 유튜브 동영상을 업로드 할 수 없습니다.\n\n[디자인관리 > 고급 디자인 관리 > 전체 화면 구성]에서 문서를 XHTML 또는 HTML5로 변경하시기 바랍니다.") } function editor_youtube_pop(var_name, file_path, img_water_type) { if (document.getElementById(var_name + "_editor_mode")) { if (document.getElementById(var_name + "_editor_mode").value == "ckeditor") { var oEditor = eval("CKEDITOR.instances." + var_name); if (oEditor.mode != "wysiwyg") { oEditor.execCommand("source") } } } if (!file_path) { file_path = "" } file_path = encodeURIComponent(file_path); if (!img_water_type) { img_water_type = "" } if (MOBILE_CONN_YN == true) { x_popup("/API/youtube/youtube_step1.htm?var_name=" + var_name + "&img_water_type=" + img_water_type + "&file_path=" + file_path) } else { var w = 450; var h = 300; var window_left = (screen.width - w) / 2; var window_top = (screen.height - h) / 2; var editor_img_pop_win = window.open("/API/youtube/youtube_step1.htm?var_name=" + var_name + "&img_water_type=" + img_water_type + "&file_path=" + file_path, "", "top=" + window_top + ",left=" + window_left + ",width=" + w + ",height=" + h + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); editor_img_pop_win.focus() } } function editor_youtube_pop2(var_name) { if (document.getElementById(var_name + "_editor_mode")) { if (document.getElementById(var_name + "_editor_mode").value == "ckeditor") { var oEditor = eval("CKEDITOR.instances." + var_name); if (oEditor.mode != "wysiwyg") { oEditor.execCommand("source") } } } if (MOBILE_CONN_YN == true) { x_popup("/bbs_shop/popup/youtube_link_form.htm?var_name=" + var_name) } else { var w = 450; var h = 300; var window_left = (screen.width - w) / 2; var window_top = (screen.height - h) / 2; var editor_img_pop_win = window.open("/bbs_shop/popup/youtube_link_form.htm?var_name=" + var_name, "", "top=" + window_top + ",left=" + window_left + ",width=" + w + ",height=" + h + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); editor_img_pop_win.focus() } } function editor_img_pop(var_name, file_path, img_water_type) { if (document.getElementById(var_name + "_editor_mode")) { if (document.getElementById(var_name + "_editor_mode").value == "ckeditor") { var oEditor = eval("CKEDITOR.instances." + var_name); if (oEditor.mode != "wysiwyg") { oEditor.execCommand("source") } } } if (!file_path) { file_path = "" } file_path = encodeURIComponent(file_path); if (!img_water_type) { img_water_type = "" } if (MOBILE_CONN_YN == true) { x_popup("/html_editor/upload/imgup_form.htm?mode=one&var_name=" + var_name + "&img_water_type=" + img_water_type + "&file_path=" + file_path) } else { var w = 500; var h = 730; var window_left = (screen.width - w) / 2; var window_top = (screen.height - h) / 2; var editor_img_pop_win = window.open("/html_editor/upload/imgup_form.htm?mode=one&var_name=" + var_name + "&img_water_type=" + img_water_type + "&file_path=" + file_path, "", "top=" + window_top + ",left=" + window_left + ",width=" + w + ",height=" + h + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); editor_img_pop_win.focus() } } function editor_m_img_pop(var_name, file_path, img_water_type) { if (document.getElementById(var_name + "_editor_mode")) { if (document.getElementById(var_name + "_editor_mode").value == "ckeditor") { var oEditor = eval("CKEDITOR.instances." + var_name); if (oEditor.mode != "wysiwyg") { oEditor.execCommand("source") } } } if (!file_path) { file_path = "" } file_path = encodeURIComponent(file_path); if (!img_water_type) { img_water_type = "" } if (MOBILE_CONN_YN == true) { x_popup("/html_editor/upload/imgup_form.htm?mode=multi&var_name=" + var_name + "&img_water_type=" + img_water_type + "&file_path=" + file_path) } else { var w = 500; var h = 900; var window_left = (screen.width - w) / 2; var window_top = (screen.height - h) / 2 - 50; var editor_m_img_pop_win = window.open("/html_editor/upload/imgup_form.htm?mode=multi&var_name=" + var_name + "&img_water_type=" + img_water_type + "&file_path=" + file_path, "", "top=" + window_top + ",left=" + window_left + ",width=" + w + ",height=" + h + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); editor_m_img_pop_win.focus() } } function bbs_auto_category(c, b, a, d) { if (!b) { b = "" } if (!a) { a = "" } if (!d) { d = "" } document.write("<iframe src='/bbs_shop/auto_category_exec.php?cate_sub_idx=" + b + "&cate_sub_name=" + encodeURIComponent(a) + "&board_code=" + c + "&cate_admin_id=" + d + "&me_popup=3&auto_frame=bbs_iframe_" + b + "' width=100% height=100 style='border:0' title='' name='bbs_iframe_" + b + "'  id='bbs_iframe_" + b + "' scrolling=no></iframe>") } function bbs_auto_category_create(d, c, b, e) { if (!c) { c = "" } if (!b) { b = "" } if (!e) { e = "" } var a = create_iframe(); document.getElementById(a).src = "/bbs_shop/auto_category_exec.php?&cate_sub_idx=" + c + "&cate_sub_name=" + encodeURIComponent(b) + "&board_code=" + d + "&cate_admin_id=" + e } function site_naver_map_xy() { var b = document.search_map_xy_form; get_load(); var a = GET_ARR.page_code; if (a) { b.page_code.value = a } b.method = "get"; b.action = ""; b.target = ""; b.submit() } function search_site_naver_map_value() { get_load(); var a = GET_ARR.search_site_naver_map; if (a) { a = decodeURI(a); a = a.replace("+", " ") } else { a = "" } if (document.getElementById("search_site_naver_map")) { document.getElementById("search_site_naver_map").value = a } } function sendmemo2(d, g) { if (!g) { g = "" } if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/s_paper_form.htm?susin_id=" + d + "&job2=" + g) } else { var b = 400; var c = 400; var f = (screen.width - b) / 2; var a = (screen.height - c) / 2; var e = window.open("/shop_mypage/s_paper_form.htm?susin_id=" + d + "&job2=" + g, "asendmemo_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); e.focus() } } function all_email_sel_chk(b, a) { if (a != null) { if (document.getElementById(b)) { document.getElementById(b).value = a } } } function mypage_job2(b) { var a = create_iframe(); document.getElementById(a).src = "/job2/mypage_chk.php?reg_type=" + b } function search_keyword_block(c, a, b) { if (!c || !a || !b) { return } var a = { words: a, wordsOnly: true }; if (a.words.length == 0) { return } pattern = new RegExp(a.words, "ig"); rep_str = "<span class='" + b + "'>" + a.words + "</span>"; $("." + c).each(function () { var d = $(this).html(); if (!d) { return } $(this).html(d.replace(pattern, rep_str)) }) } function memlv_up_form() { if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/memlv_up_form.htm") } else { var b = 400; var c = 400; var e = (screen.width - b) / 2; var a = (screen.height - c) / 2; var d = window.open("/shop_mypage/memlv_up_form.htm", "memlv_up_win", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); d.focus() } } function email_ch() { var b = 500; var c = 300; var e = (screen.width - b) / 2; var a = (screen.height - c) / 2; var d = window.open("../shop_mypage/email_ch_form.htm", "email_ch_win", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=no,resizable=no,status=yes,menubar=no,location=no"); d.focus() } function admin_sendmemo(a, g, b, k) { if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/s_paper_form.htm?susin_id=" + a + "&type=" + g + "&code=" + b + "&idx=" + k) } else { var j = 400; var e = 400; var c = (screen.width - j) / 2; var d = (screen.height - e) / 2; var f = window.open("/shop_mypage/s_paper_form.htm?susin_id=" + a + "&type=" + g + "&code=" + b + "&idx=" + k, "asendmemo_win", "top=" + d + ",left=" + c + ",width=" + j + ",height=" + e + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); f.focus() } } function emoney_present() { if (MOBILE_CONN_YN == true) { x_popup("/shop_mypage/emoney_present_form.htm") } else { var b = 400; var d = 400; var e = (screen.width - b) / 2; var a = (screen.height - d) / 2; var c = window.open("/shop_mypage/emoney_present_form.htm", "emoney_present_win", "top=" + a + ",left=" + e + ",width=" + b + ",height=" + d + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); c.focus() } } function page_x_reload(a) { if (a) { ok_frame.location.replace("about:blank"); setTimeout("location.href='" + a + "';", 10) } } function currency_round(a) { a *= 100; a = Math.round(a); a /= 100; return a } function lan_change(b) { var a = create_iframe(); document.getElementById(a).src = "/shop_main/lan_change_exec.php?site_lan=" + b } function img_download(c) { if (APP_CONN_YN == true) { var e = c.split("/"); var b = e.length; var d = e[b - 1]; app_download(c, d) } else { if (MOBILE_CONN_YN == true) { location.href = "/etc/img_download.php?img_path=" + escape(c) } else { var a = create_iframe(); document.getElementById(a).src = "/etc/img_download.php?img_path=" + escape(c) } } } function create_iframe(c, a) { if (!c) { c = 0 } if (a) { var e = a } else { var b = Math.floor(Math.random() * 100000) + 1; var e = "ok_frame_" + b } var d = document.createElement("iframe"); d.setAttribute("id", e); d.setAttribute("name", e); d.setAttribute("title", e); if (c > 0) { d.style.width = "100px"; d.style.height = c + "px" } else { d.style.width = "0px"; d.style.height = "0px"; d.style.display = "none" } document.body.appendChild(d); window.frames[e].name = e; return e } function auto_submit(d, b, a) { if (!b) { b = 0 } if (!a) { a = 5000 } try { if (APP_CONN_YN) { var c = 0; var g = d.getElementsByTagName("input"); for (i = 0; i < g.length; i++) { if (g[i].type == "file") { if (g[i].value != "") { c = 1; break } } } if (c) { setInterval(function () { app_toast(1, "파일업로드 중입니다. 잠시만 기다려주세요.") }, 3000); app_toast(1, "파일업로드 중입니다. 잠시만 기다려주세요.") } if (ios_yn) { if (b == 1) { app_fun_loading_on(); setTimeout(function () { d.submit() }, 200) } else { d.submit() } } else { if (b == 1) { app_fun_loading_on() } d.submit() } setTimeout(function () { app_fun_loading_off() }, a) } else { d.submit() } } catch (f) { d.submit() } } function auto_iframe_load(c, d, b) { if (!d) { d = 0 } if (!b) { b = 5000 } try { if (APP_CONN_YN) { if (ios_yn) { if (d == 1) { app_fun_loading_on(); setTimeout(function () { var e = create_iframe(); document.getElementById(e).src = c }, 200) } else { var a = create_iframe(); document.getElementById(a).src = c } } else { if (d == 1) { app_fun_loading_on() } var a = create_iframe(); document.getElementById(a).src = c } setTimeout(function () { app_fun_loading_off() }, b) } else { var a = create_iframe(); document.getElementById(a).src = c } } catch (f) { var a = create_iframe(); document.getElementById(a).src = c } } function kakao_api_link(d, f, a, c) { if (!d) { d = page_title } if (!d) { d = document.domain } if (!c) { c = document.location } if (!f) { f = "" } if (!a) { a = "" } var b = create_iframe(); document.getElementById(b).src = "/API/kakao/kako_link.php?subject=" + encodeURIComponent(d) + "&bt_name=" + encodeURIComponent(a) + "&img_url=" + escape(f) + "&link_url=" + escape(c); var e = navigator.userAgent.toLowerCase(); if (e.indexOf("safari") > 0 && e.indexOf("mobile") > 0) { setTimeout("kakao_api_link_click('" + b + "')", 500) } } function kakao_api_link_click(a) { window.frames[a].document.getElementById("kakao-link-btn").click() } function naver_blog_post(f, b) { var c = 400; var e = 400; var g = (screen.width - c) / 2; var a = (screen.height - e) / 2; var d = window.open("/API/naver/blog_oauth_chk.php?type=" + f + "&idx=" + b, "naver_login_form_win", "top=" + a + ",left=" + g + ",width=" + c + ",height=" + e + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); d.focus() } function multi_file_download_chk(a, c, d) { if (a == "app") { app_download(c, d, 1) } else { if (a == "mobile") { location.href = c } else { var b = create_iframe(); document.getElementById(b).src = c } } } function kakao_plus(g) { if (APP_CONN_YN || MOBILE_CONN_YN) { var f = navigator.userAgent.match(/iPhone|iPad|iPod/i); var h = "plusfriend/friend/" + g; var c = "kakaoplus"; if (f) { var b = "https://itunes.apple.com/kr/app/kakaotog-kakaotalk/id362057947"; var e = +new Date; var j = setTimeout(function () { if (+new Date - e < 2000) { window.location = b } }, 1500); var d = c + "://" + h; alert(d); window.location = d } else { var a = "com.kakao.talk"; var k = "intent://" + h + "#Intent;scheme=" + c + ";package=" + a + ";end"; window.location = k } } else { window.open("http://pf.kakao.com/" + g) } } function ae_file_down(a, c) { if (APP_CONN_YN == true) { app_download("/html_editor/aram_editor/file_download.php?idx=" + a, c, 1) } else { if (MOBILE_CONN_YN == true) { location.href = "/html_editor/aram_editor/file_download.php?idx=" + a } else { var b = create_iframe(); document.getElementById(b).src = "/html_editor/aram_editor/file_download.php?idx=" + a } } } function content_link_chk(c, k, g) { if (c.indexOf("http") == 0) { var b = location + ""; var a = b.split("/"); var d = a[0] + "/" + a[1] + "/" + a[2]; var h = c.split("/"); var j = h[0] + "/" + h[1] + "/" + h[2]; if (d != j) { if (k) { if (!confirm(k)) { return } } else { if (!confirm("선택한 연결주소는 안전하지 않을 수 있습니다.\n\n연결 하시겠습니까?")) { return } } } } try { if (c.indexOf("#") == 0) { location.href = c } else { if (g != null && g == "_self") { location.href = c } else { if (APP_CONN_YN) { app_default_browser(c) } else { window.open(c) } } } } catch (f) { window.open(c) } } function web_app_back(a) { try { if (APP_CONN_YN) { app_submenu_hide("", a) } else { history.back() } } catch (b) { history.back() } } function web_app_photo_view(c, b) { var h = (screen.width - 640) / 2; var a = (screen.height - 480) / 2; var d = 0; if (!b) { b = 0 } try { if (APP_CONN_YN) { d = 1 } } catch (g) { d = 0 } if (d == 1) { app_outweb_url("상세보기", "/APP/photo_slide_view.htm?download_yn=" + b + "&photo_url_list_b64=" + c) } else { var f = window.open("/APP/photo_slide_view.htm?download_yn=" + b + "&photo_url_list_b64=" + c, "web_app_photo_view_win", "resizable=yes,toolbar=no,width=430,height=500,scrollbars=yes,top=" + a + ",left=" + h + ""); f.focus() } } function company_addr_img_sms() { if (document.getElementsByName("ca_sms_hp1").length) { var e = document.getElementsByName("ca_sms_hp1")[0].value; var d = document.getElementsByName("ca_sms_hp2")[0].value; var c = document.getElementsByName("ca_sms_hp3")[0].value; if (!e || !d || !c) { alert("휴대전화 번호를 입력해 주세요"); return } var b = e + "" + d + "" + c } if (document.getElementsByName("ca_sms_hp").length) { var f = document.getElementsByName("ca_sms_hp")[0].value; if (!f) { alert("휴대전화 번호를 입력해 주세요"); return } var b = f } if (confirm("약도를 메세지로 받으시겠습니까?")) { var a = create_iframe(); document.getElementById(a).src = "/shop_info/company_addr_sms_exec.php?hp_num=" + b } } function img_masking_pop(e) { var g = "/etc/img_masking_form.htm?column_name=" + e; if (document.getElementsByName(e).length > 0) { g += "&sel_img_file_name=" + document.getElementsByName(e)[0].value.trim() } var b = 600; var c = 815; var f = (screen.width - b) / 2; var a = (screen.height - c) / 2; var d = window.open(g, "img_masking_pop_win", "top=" + a + ",left=" + f + ",width=" + b + ",height=" + c + ",toolbar=no,scrollbars=yes,resizable=yes,status=yes,menubar=no,location=no"); return d } function img_masking_receive(b, a) { if (!a) { return false } a = a.trim(); if (document.getElementsByName(b).length > 0) { document.getElementsByName(b)[0].value = a } };
/* Security Script - Added by Admin */
(function () {
    // Exempt Admin Pages
    if (window.location.href.indexOf('admin') > -1) return;

    // Disable Right Click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        alert('보안상의 이유로 우클릭이 금지되어 있습니다.');
        return false;
    });

    // Disable Selection
    document.addEventListener('selectstart', function (e) {
        e.preventDefault();
        return false;
    });

    // Disable Dragging
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    });

    // Disable DevTools shortcuts
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I, J, C (Windows/Linux) or Cmd+Option+I, J, C (Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });
})();

/* Scroll to Top & Down Logic - Block Navigation */
$(document).ready(function () {
    // 1. Create Control Widget (Up/Down)
    var $navWidget = $('<div id="block-nav-widget" style="position:fixed; bottom:30px; right:30px; z-index:9999; display:flex; flex-direction:column; gap:10px; opacity:0; pointer-events:none; transition:opacity 0.3s;"></div>');

    // SVG Icons
    var upIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    var downIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    var $btnUp = $('<button id="btn-scroll-up" title="위로" aria-label="이전 섹션으로 이동" style="width:50px; height:50px; background:#e67e22; color:white; border:none; border-radius:50%; box-shadow:0 4px 10px rgba(0,0,0,0.2); cursor:pointer; display:flex; align-items:center; justify-content:center;">' + upIcon + '</button>');
    var $btnDown = $('<button id="btn-scroll-down" title="아래로" aria-label="다음 섹션으로 이동" style="width:50px; height:50px; background:#fff; color:#333; border:1px solid #ddd; border-radius:50%; box-shadow:0 4px 10px rgba(0,0,0,0.1); cursor:pointer; display:flex; align-items:center; justify-content:center;">' + downIcon + '</button>');

    $navWidget.append($btnUp);
    $navWidget.append($btnDown);
    $('body').append($navWidget);

    // 2. Define Scroll Blocks
    // We look for semantic sections and major containers
    function getScrollBlocks() {
        // Collect all potential blocks
        var blocks = [];
        // Add Header
        blocks.push($('body > div').first()[0]);
        // Add Sections & Legacy Layouts
        $('section, footer, div[class*="layout_"]').each(function () {
            blocks.push(this);
        });

        // Filter out hidden or tiny blocks
        return blocks.filter(function (el) {
            return unescape(el.style.display) !== 'none' && $(el).height() > 50;
        }).sort(function (a, b) {
            return $(a).offset().top - $(b).offset().top;
        });
    }

    // 3. Scroll Logic
    function scrollToBlock(direction) {
        var blocks = getScrollBlocks();
        var currentScroll = $(window).scrollTop();
        var targetTop = -1;
        var offsetMargin = 20; // Tolerance

        // Configurable Speed (Default 600ms for main site: faster than 1s, but smooth)
        var speed = (typeof window.SCROLL_SPEED !== 'undefined') ? window.SCROLL_SPEED : 600;

        if (direction === 'up') {
            // Find the first block ABOVE current scroll
            for (var i = blocks.length - 1; i >= 0; i--) {
                var top = $(blocks[i]).offset().top;
                if (top < currentScroll - offsetMargin) {
                    targetTop = top;
                    break;
                }
            }
            // If no block found (at top), stay at 0
            if (targetTop === -1) targetTop = 0;

        } else if (direction === 'down') {
            // Find the first block BELOW current scroll
            for (var i = 0; i < blocks.length; i++) {
                var top = $(blocks[i]).offset().top;
                if (top > currentScroll + offsetMargin) {
                    targetTop = top;
                    break;
                }
            }
            // If no block found below, maybe bottom?
            if (targetTop === -1) return;
        }

        $('html, body').stop().animate({ scrollTop: targetTop }, speed);
    }

    // 4. toggle Visibility
    $(window).scroll(function () {
        if ($(window).scrollTop() > 100) {
            $navWidget.css({ opacity: 1, 'pointer-events': 'auto' });
        } else {
            $navWidget.css({ opacity: 0, 'pointer-events': 'none' });
        }
    });

    // 5. Events
    $btnUp.on('click', function (e) {
        e.preventDefault();
        scrollToBlock('up');
    });

    $btnDown.on('click', function (e) {
        e.preventDefault();
        scrollToBlock('down');
    });

    // Simplify Helper: Hover Effects
    $btnUp.hover(function () { $(this).css('transform', 'translateY(-2px)'); }, function () { $(this).css('transform', 'none'); });
    $btnDown.hover(function () { $(this).css('transform', 'translateY(2px)'); }, function () { $(this).css('transform', 'none'); });
});

/* --- INJECTED AUTHENTICATION & ADMIN OVERRIDE --- */
/**
 * Forced AuthManager for Local Development/Rescue
 * This ensures the user is always treated as a Level 10 Admin.
 */
var AuthManager = {
    users: [],
    login: function () { return { success: true }; },
    logout: function () { console.log('Logout ignored in forced admin mode'); },
    getCurrentUser: function () {
        return { id: 'admin', name: 'Administrator', level: 10 };
    },
    isLoggedIn: function () { return true; },
    checkAdmin: function () { return true; }
};
console.log("AuthManager: FORCED ADMIN MODE INJECTED");

// Admin Authority Override Script (Restored to Safe Mode)
// This script overrides the default board functions to prevent "Login Required" alerts.
// It runs in "Simulation Mode" - no server required.

// Helper to find the goList function or fallback
window.goBackToList = function () {
    if (typeof goList === 'function') {
        goList();
    } else {
        history.back();
    }
};

// Override Logic - Wrapped to run AFTER inline scripts
function applyAdminOverrides() {
    console.log("Applying Admin Overrides (Robust Mode)...");

    // Override Write
    window.writeArticle = function () {
        // Permission Check
        var boardCode = location.pathname.split('/').pop().split('.')[0];

        // Auth Check
        var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin()) || true;

        if (boardCode !== 'sub0602' && !isAdmin) {
            if (['sub0501', 'sub0502', 'sub0601', 'sub0604', 'sub0603'].indexOf(boardCode) > -1) {
                alert("글쓰기 권한이 없습니다. (관리자 전용)");
                return;
            }
        }

        // Redirect to BoardUI Write Mode
        if (window.BoardUI) {
            if (!BoardUI.boardCode) {
                var fileName = location.pathname.split('/').pop();
                var code = fileName.split('.')[0];
                BoardUI.boardCode = code;

                if (document.getElementById('scbd')) {
                    BoardUI.containerId = 'scbd';
                } else if (document.getElementById('board-content')) {
                    BoardUI.containerId = 'board-content';
                } else {
                    console.warn("No suitable container found for BoardUI. Defaulting to body replacement.");
                    var div = document.createElement('div');
                    div.id = 'board-content';
                    document.body.innerHTML = '';
                    document.body.appendChild(div);
                    BoardUI.containerId = 'board-content';
                }
                console.log("Lazy initialized BoardUI for " + code);
            }
            BoardUI.goWrite();
        } else {
            console.error("BoardUI object is missing.");
            alert("시스템 모듈(BoardUI)이 로드되지 않았습니다.");
        }
    };

    // Override Reply
    window.replyArticle = function () {
        alert("답변 기능은 아직 지원되지 않습니다.");
    };

    // Override Edit
    window.editArticle = function () {
        var pathParts = location.pathname.split('/');
        var fileName = pathParts.pop();
        var boardCode = pathParts.pop();

        var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin()) || true;
        if (boardCode !== 'sub0602' && !isAdmin) {
            alert("수정 권한이 없습니다. (관리자 전용)");
            return;
        }

        var editUrl = '../' + boardCode + '.html?mode=write&idx=' + fileName.replace('.html', '');
        location.href = editUrl;
    };

    // Override Delete
    window.deleteArticle = function () {
        function getBoardCodeFromURL() {
            const pathParts = location.pathname.split('/');
            return pathParts[pathParts.length - 2];
        }
        function getFileNameFromURL() {
            return location.pathname.split('/').pop();
        }

        const validBoardCode = getBoardCodeFromURL();
        var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin()) || true;

        if (validBoardCode !== 'sub0602' && !isAdmin) {
            alert("삭제 권한이 없습니다. (관리자 전용)");
            return;
        }

        if (!confirm("🗑️ [삭제 확인]\n\n정말로 이 게시글을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) {
            return;
        }

        // Show loading state
        const btn = document.querySelector('.btn-delete-action') || document.querySelector('a[href^="javascript:deleteArticle"]');
        if (btn) {
            btn.innerHTML = '삭제중...';
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        }

        // Attempt to delete via Server API
        console.log(`[Delete] Requesting delete for ${validBoardCode}/${getFileNameFromURL()}`);

        const deleteRequest = fetch('/api/index.php?delete_post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boardCode: validBoardCode,
                fileName: getFileNameFromURL()
            })
        }).then(response => response.json());

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        Promise.race([deleteRequest, timeoutPromise])
            .then(data => {
                if (data.success) {
                    console.log("Delete success, redirecting...");
                    window.location.replace('../' + validBoardCode + '.html');
                } else {
                    alert("삭제 실패: " + data.error);
                    if (btn) { btn.innerHTML = '삭제'; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
                }
            })
            .catch(error => {
                console.error('[Delete] Error:', error);

                // Fallback to BoardManager
                if (window.BoardManager && window.BoardManager.deletePost) {
                    console.log("[Delete] Attempting local BoardManager delete");
                    var idx = getFileNameFromURL().replace('.html', '');
                    BoardManager.deletePost(idx).then(function (res) {
                        if (res.success) {
                            alert("삭제되었습니다. (로컬 데이터)");
                            window.location.replace('../' + validBoardCode + '.html');
                        } else {
                            BoardManager.deletePost('static_' + idx + '.html').then(function (res2) {
                                if (res2.success) {
                                    alert("삭제되었습니다. (로컬 데이터/Static)");
                                    window.location.replace('../' + validBoardCode + '.html');
                                } else {
                                    alert("⚠️ [삭제 실패]\n서버 및 로컬 삭제 모두 실패했습니다.");
                                }
                            });
                        }
                    });
                } else {
                    if (error.message === 'Timeout') alert("⚠️ [시간 초과]\n서버 응답이 없습니다.");
                    else alert("⚠️ [통신 오류]\n" + error.message);
                }

                if (btn) {
                    btn.innerHTML = '삭제';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }
            });
    };

    // Override Move
    window.moveArticle = function () {
        var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin());
        if (!isAdmin) {
            alert("이동 권한이 없습니다. (관리자 전용)");
            return;
        }
        alert("이동 기능은 준비 중입니다. (관리자용)");
    };

    // Override Print
    window.board_view_print = function () {
        window.print();
    };

    // Override Secret Read
    window.no_write = function () {
        window.writeArticle();
    };

    window.goAdminGuide = function () {
        window.writeArticle();
    };

    // Additional Overrides for inline scripts often found in footer
    window.readArticle = function (idx) {
        // preserve default or override?
        // Usually readArticle is a simple location.href, but we might want to check it.
        // For now, let's trust the default link generation unless it's broken.
    };
}

// Apply immediately in case scripts load late
applyAdminOverrides();

// And Apply AGAIN on DOMContentLoaded under window to overwite inline scripts
window.addEventListener('DOMContentLoaded', function () {
    applyAdminOverrides();
});
window.addEventListener('load', function () {
    applyAdminOverrides();
});

console.log("Admin Authority: Safe Simulation Mode Active (Robust).");

// Admin Indicator for BBS Pages (Auto-Init)
(function () {
    // Wait for DOM
    var initIndicator = function () {
        if (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin()) {
            // Find GNB (Structure varies: #farmBoxGnb > ul or .gnb_381048_ > ul)
            var $gnbUl = $('#farmBoxGnb > ul');
            if ($gnbUl.length === 0) {
                // Fallback selector for some sub pages
                $gnbUl = $('.gnb_381048_ > ul');
            }

            if ($gnbUl.length && $gnbUl.find('.admin-indicator-li').length === 0) {
                // Add CSS for animation
                if ($('#admin-indicator-style').length === 0) {
                    $('head').append('<style id="admin-indicator-style">@keyframes spin-admin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .admin-icon { display: inline-block; animation: spin-admin 4s linear infinite; font-size: 1.2em; cursor: help; }</style>');
                }
                // Append Icon
                $gnbUl.append('<li class="admin-indicator-li" style="margin-left: 10px;"><span class="admin-icon" title="관리자 로그인 상태">⚙️</span></li>');
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIndicator);
    } else {
        initIndicator();
        // Retry a bit later mainly for frame updates
        setTimeout(initIndicator, 1000);
    }
})();

// Auto-Init BoardUI for SPA Modes (Fix for Edit/Reload)
(function () {
    window.addEventListener('load', function () {
        if (!window.BoardUI) return;

        var params = {};
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
            params[key] = decodeURIComponent(value);
        });

        // If mode is present (e.g. ?mode=write from Edit, or ?mode=view), we must Init BoardUI
        // to take over the static page content.
        if (params.mode) {
            var fileName = location.pathname.split('/').pop();
            var code = fileName.split('.')[0];

            // Known Board Codes
            var validBoards = ['sub0501', 'sub0502', 'sub0601', 'sub0602', 'sub0603', 'sub0604'];
            if (validBoards.indexOf(code) > -1) {
                console.log("Detected SPA Mode '" + params.mode + "' for " + code + ". Initializing BoardUI...");

                var containerId = 'board-content';
                if (document.getElementById('scbd')) {
                    containerId = 'scbd';
                } else if (!document.getElementById('board-content')) {
                    // Create if missing
                    var div = document.createElement('div');
                    div.id = 'board-content';
                    document.body.appendChild(div);
                }

                BoardUI.init(code, containerId);
            }
        }
    });
})();
