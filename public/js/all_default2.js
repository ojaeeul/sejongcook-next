
// 네비게이션 위치번호 가져오기
var
	nowLocation = new Array()
	,dp1 = null
	,dp2 = null
;

function scNaviToNumber(code)
{
	var
		codeArray = new Array()
		,numArray = new Array()
	;

	for (var i=0; i<4; i++) {
		codeArray.push(code.substr(i*2,2));
	}

	function refunc(depth, n)
	{
		try {
			eval('var dat = navi_cate_' + n + '_code');
			var nn = 0;
			for (var i in dat) {
				if (dat[i].substr(depth*2,2) == codeArray[depth]) {
					numArray.push(nn+1);
					refunc((depth+1), dat[i]);
				}
				nn++;
			}
		}
		catch (error) {
			return false;
		}
	}
	refunc(0, '00000000');

	nowLocation = numArray;
	dp1 = nowLocation[0];
	dp2 = nowLocation[1];
}
