# 영화검색 사이트(Movie-search-project)

#### 사용기술
1. React
	- 프론트앤드 부문 화면 구현 담당
	- 영화 검색 시 검색한 영화 렌더링이 되며 반응형으로 구현되어 웹,태블릿,모바일 이용 가능
	- 네이버 영화 오픈 API 사용, axios요청으로 SERVER에 전달 
	- 영화 검색 후 셍세정보를 볼 수 있도록 state 전달하여 페이지 렌더링
2. Node.js(Express)
	- 백앤드 부문 axios request 요청 시 response 및 data 전달 담당
	- axios를 통해 프론트에서 request를 받아 네이버 영화 오픈 API 연결 및 response로 data전달
	- 회원가입/로그인/로그아웃/마이페이지 기능 구현
	- 로그인 유/무는 Passport-local MiddleWare 기능을 통해 중복검사 및 로그인시 Session 발행
3. MongoDB
	-	Node.js(Express)과 연동하여 회원가입/로그인/로그아웃/마이페이지 기능에 필요한 DB 구축
	- User Collection에 DB 생성 및 로그인시 마이페이지에서 즐겨찾기한 영화를 볼 수 있도록 구현
	- 회원정보가 없을 시에는 마이페이지,영화 즐겨찾기 기능 사용 불가능
