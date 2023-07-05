async function handleRegister() {
	const registerData = {
		// 등록에 필요한 정보입니다
		username: document.getElementById("floatingInput").value,
		password: document.getElementById("floatingPassword").value,
		email: document.getElementById("floatingInputEmail").value,
		// fullname: document.getElementById("floatingInputFullname").value,
	};

	const response = await fetch(`${backend_base_url}/users/register/`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify(registerData),
	});

	response_json = await response.json();

	if (response.status == 201) {
		window.location.replace(
			`${frontend_base_url}/template/user_login.html`
		); // 로그인 페이지
	} else {
		alert(response.status); // "회원정보가 일치하지 않습니다."
	}
}

async function handleLogin() {
	console.log("로그인 신호");
	const loginData = {
		email: document.getElementById("floatingInput").value, // 이 부분이 email로 변화
		password: document.getElementById("floatingPassword").value,
	};

	// fetch post 통신이 완료될때까지 기다리고, api에서 토큰을 반환합니다.
	const response = await fetch(`${backend_base_url}/users/login/`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify(loginData),
	});

	response_json = await response.json();

	if (response.status == 200) {
		// access,refresh 토큰 저장
		// response_json으로 불러오면 { 'email' : ~~, 'password' : ~~, 'toekn' : {'rfresh': ~~ , 'access' : ~~}} 이런식으로 불러와짐.
		// 그래서 일단 token만 불러온다음에 필요없는 부분을 제거한 뒤 access와 refresh에 넣어줌. 바로 딕셔너리로는 인식시키는 법을 몰라서 택함.
		var token = response_json.tokens;
		console.log(token.access);
		var refresh = token.refresh;
		var access = token.access;
		localStorage.setItem("access", access);
		localStorage.setItem("refresh", refresh);

		const base64Url = access.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return (
						"%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
					);
				})
				.join("")
		);

		// payload 저장
		localStorage.setItem("payload", jsonPayload);
		window.location.replace(`${frontend_base_url}/template/index.html`);
	} else {
		alert(response.status); // "회원정보가 일치하지 않습니다."
	}
}

async function handleLogout() {
	localStorage.removeItem("access");
	localStorage.removeItem("refresh");
	localStorage.removeItem("payload");
	alert("로그아웃완료");
	location.reload();
}

async function passwordResetEmail() {
	const loginData = {
		email: document.getElementById("emailFind").value, // 이 부분이 email로 변화
	};
	const response = await fetch(
		`${backend_base_url}/users/request-reset-email/`,
		{
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(loginData),
		}
	);
}

async function passwordResetConfirm() {
	var url = window.location;
	console.log(url);
	var token = new URLSearchParams(url.search).get("token");
	var uidb64 = new URLSearchParams(url.search).get("uidb64");
	const passwordResetData = {
		password: document.getElementById("passwordConfirm").value, // 이 부분이 email로 변화
		token: token,
		uidb64: uidb64,
	};
	const response = await fetch(`${backend_base_url}/users/password-reset/`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		method: "PATCH",
		body: JSON.stringify(passwordResetData),
	});
}
