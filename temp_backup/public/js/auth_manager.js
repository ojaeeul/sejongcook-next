/**
 * Dummy AuthManager to preventing 404s
 * The board logic no longer relies on this being fully functional for basic read/write/delete.
 */
var AuthManager = {
    // Basic User Database (Client-side simulation)
    users: [
        { id: 'ojaeeul', pw: 'calzone2@', name: '최고관리자', level: 10 },
        { id: 'user', pw: '1234', name: '홍길동', level: 1 }
    ],

    login: function (id, pw) {
        var user = this.users.find(function (u) { return u.id === id && u.pw === pw; });
        if (user) {
            // Save session
            var sessionData = {
                id: user.id,
                name: user.name,
                level: user.level,
                loginTime: new Date().getTime()
            };
            localStorage.setItem('sejong_user_session', JSON.stringify(sessionData));
            return { success: true, user: user };
        } else {
            return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
        }
    },

    logout: function () {
        localStorage.removeItem('sejong_user_session');
        alert('로그아웃 되었습니다.');
        location.href = 'index.html';
    },

    getCurrentUser: function () {
        var session = localStorage.getItem('sejong_user_session');
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                return null;
            }
        }
        return null; // Return null if not logged in
    },

    isLoggedIn: function () {
        return !!this.getCurrentUser();
    },

    checkAdmin: function () {
        var user = this.getCurrentUser();
        return user && user.level >= 9;
    }
};
console.log("Dummy AuthManager loaded.");
