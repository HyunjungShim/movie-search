const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:true}))
const MongoClient = require('mongodb').MongoClient
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 
const port = process.env.PORT || 8000;



const Axios = require('axios');
app.use(cors())


app.use(express.json())


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))

// app.use(express.static(path.join(__dirname, '../build')));

// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, '../build/index.html'));
// });

var db;

MongoClient.connect('mongodb+srv://p42510:obliviate12!@cluster0.dxteu12.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (error, client) {
	if (error) return console.log(error)
	db = client.db('movie');

    //     db.collection('post').insertOne( {title : '응가하기', date:'10-22'} , function(에러, 결과){
	//     // console.log('저장완료'); 
	// });
});

app.listen(port, function () {
    console.log(`listening on ${port}`)
});

app.get('/', function(req,res){
    res.send('test')
})

app.get('/naver/getNaverMovie', async function (req, res) {
    let query = req.query.query;
    let reqOptions = {
      headers: {
        'X-Naver-Client-Id': 'Dqt0en4PD9Edc9uzM5l4',
        'X-Naver-Client-Secret': 'OTjZEmpLjC'
      },
      params: {
        query: query
      }
    };
    try {
      //카카오톡 서버로 요청
      let movieRes = await Axios.get(
        'https://openapi.naver.com/v1/search/movie.json',
        reqOptions
      );
      return res.json(movieRes.data)
      // .then((res)=> { console.log(res.data.items); console.log(query);})
    } catch (err) {
      return res.json({
        message: err
      });
    }
  });

app.post('/naver/getMovieDetail', function(req,res){
  console.log(req.body.params.query);
  const title = req.body.params.query
  db.collection('searchmovie').insertOne({title:title}, function(err,result){
    if (err) return err;
    console.log('저장완료');
  })
})
// 방법: db중 가장 최근 데이터를 가지고와서 그걸 moviedetail에 렌더링


app.get('/naver/getMovieData', async function (req, res) {
    res.send('hi')
    })
   
app.get('/naver/register', function(req,res){
  res.send('registerpage')
})
app.post('/naver/register', function(req,res){
  const {id,pw} = req.body;
  db.collection('user').findOne({id:id}, function(err,result){
    if(result == null){
      const replaceId = /^[a-zA-Z0-9]*$/;
      if(!replaceId.test(id)){
        res.send('영어,숫자만 가능합니다.')
      }
      else{
        db.collection('user').insertOne({id:id, pw:pw,isLogin:false}, function(err,result){
          console.log(result);
          res.status(200).json({message:'success'})
          // res.redirect('/login')
        })
      }
    } else {
      // res.send('already')
      res.status(200).json({message:'fail'})
    }
  })
})



// 응답해주기 전에 local 방식으로 아이디 비번을 인증(함수 두번쨰 파라미터 )
// // (failureRedirect라는 부분은 로그인 인증 실패시 이동시켜줄 경로
// app.post('/naver/login', passport.authenticate('local', {failureRedirect : '/naver/fail'}),function(req, res){
//   // console.log(res);
//   res.status(200).json({message:'success'})
//   db.collection('user').updateOne({id:req.user.id},{$set:{isLogin:true}},function(err,result){
//     if(err) return err
//     // console.log(req.user);
//   })
// });

app.post('/naver/login', function (req, res) {
  passport.authenticate('local', {}, function(error, user, msg){ 
      if (!user) {
        req.send('fail')
      } else {
        req.login(user, function(err){
          if(err){ return next(err); }
          res.status(200).json({message:'success'})
          db.collection('user').updateOne({id:req.user.id},{$set:{isLogin:true}},function(err,result){
            if(err) return err
            // 로그인 성공시 세션을 저장시키는 코드
            // 위 코드의 결과가 아이디/비번 검증 성공시 user로 들어감
          passport.serializeUser(function (user, done) {
            done(null, user.id)
          });
          // 이 세션 데이터를 가진 사람을 찾아줌(마이 페이지 접속시 발동)
          // 위에 user.id 랑 밑에 아이디랑 똑같은애
          passport.deserializeUser(function (아이디, done) {
            db.collection('user').findOne({id: 아이디},
            function(error,result){
                done(null, result)
                // result는 mypage에서 찾은 데이터를 user를 통해 데이터전달가능 
            })
          }); 
            // console.log(req.user);
          })
        });
      }
  })(req, res);
});

// app.get('/mypage', 로그인했니,function(req,res){
//   console.log(req.user);
//   res.render('mypage.ejs', {사용자: req.user})
// })
passport.use(new LocalStrategy({
  usernameField: 'id', // <input>의 name 속성값
  passwordField: 'pw',
  session: true,
  passReqToCallback: false, //아이디/비번말고 다른 정보검사가 필요한지
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('user').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)
  //아이디/비번 검사 성공하면 return done(null,결과) 실행
    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

// // 로그인 성공시 세션을 저장시키는 코드
// // 위 코드의 결과가 아이디/비번 검증 성공시 user로 들어감
// passport.serializeUser(function (user, done) {
//   done(null, user.id)
// });

// // 이 세션 데이터를 가진 사람을 찾아줌(마이 페이지 접속시 발동)
// // 위에 user.id 랑 밑에 아이디랑 똑같은애
// passport.deserializeUser(function (아이디, done) {
//   db.collection('user').findOne({id: 아이디},
//   function(error,result){
//       done(null, result)
//       // result는 mypage에서 찾은 데이터를 user를 통해 데이터전달가능 
//   })
// }); 

function 로그인했니(req,res,next){
  if (req.user){
      next()
  } else {
      res.send('로그인 안하셨어요')
  }
}

app.get('/naver/login', function(req,res){
  res.send(req.user)
  console.log(req.user);
})

app.get('/naver/fail', function(req,res){
  res.send('fail')
})

app.get('/naver/mypage', 로그인했니,function(req,res){
  res.send(req.user)
})

//
app.post('/naver/mypage', 로그인했니, function(req,res){
  const {favorite} = req.body
  // console.log(favorite);
  db.collection('user').findOne({favorite:favorite, id:req.user.id}, function(err,result){
    console.log(result);
    if(result ==null){
      db.collection('user').updateOne({id:req.user.id}, {$push:{favorite:favorite}},function(err,result){
        console.log(result);
        res.status(200).json({message:'success'})
      })
    }else{
      res.send('이미 즐겨찾기한 영화입니다.')
    }
  })
})

app.get('/naver/logout', function(req,res){
    db.collection('user').findOne({id:req.user.id}, function(err,result){
      if(result == null){
        res.send('로그인 안했음')
      }else{
        db.collection('user').updateOne({id:req.user.id},{$set:{isLogin:false}},function(err,result){
          // console.log(result);
          req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
          })
        })
      }
    })
})

// 리액트 연결

// app.get('*', function (req, res) {
//   res.sendFile(path.join(__dirname, '/searchmovie/build/index.html'));
// });