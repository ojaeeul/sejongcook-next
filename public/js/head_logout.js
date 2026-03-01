function jumun_search(){
	location.href='/shop_login/jumun_view_login_form.htm';
}
function mypage(login_go_yn){	
	alert('마이페이지는 회원전용 공간입니다.\n\n로그인 후 이용해주시기 바랍니다.');
	if(login_go_yn==1){
		location.href="/login";
	}
}
function mypage_car(){
	alert('마이페이지는 회원전용 공간입니다.\n\n로그인 후 이용해주시기 바랍니다.');
}

function my_qna_form(){
	alert('1:1 문의는 회원전용 공간입니다.\n\n로그인 후 이용해주시기 바랍니다.');
}

function pension_search(){
	location.href='/pension_resv/search_form.htm';
}

function paper_form(susin_id,w,h){
	alert("쪽지는 회원전용 서비스 입니다.\n\n로그인 후 이용해주시기 바랍니다.");
}

function login_chk_url(go_url){
	location.href="/shop_login/login_form.htm";
}

/* UTF-8 한글체크 */
