
const express = require("express")
const app = express();
const io = require('socket.io-client');
const http = require('http').Server(app)
const sio = require('socket.io')(http)
const Login = require('../function/login')
// 允許跨域使用本服務
var cors = require("cors");
app.use(cors());

// 協助 Express 解析表單與JSON資料
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Web 伺服器的靜態檔案置於 public 資料夾
app.use("/public", express.static("../public"));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Origin', "*");
  res.header('Access-Control-Allow-Headers', "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS,DELETE');
  res.header("X-Powered-By", '3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
})





app.get('/', (req, res) => {
  res.send('Hello');
});
//登錄
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // console.log("收到的帳號:", req.body.email, "密碼:", password);

  Login.getUsers(email, password)
    .then(userDetails => {
      console.log({userDetails});
      res.status(200).json({ message: '登錄成功', userDetails });
      
    })
    .catch(error => {
      res.status(401).json({ message: '登錄失敗', error });
    });
});

//檢測帳號重複

// 註冊
app.post('/regisger', (req,res)=>{
  const { username, email, password, confirmPassword } = req.body;
  console.log("name:",username, "email:",email,"password:",password,"confirmPassword:",confirmPassword);  
  
    Login.registerNewUser(username, email, password, confirmPassword)
    .then(NewUserDetails => {
      res.status(200).json({ message: '註冊成功', NewUserDetails });
    })
    .catch(error => {
      res.send.json({ message: '註冊失敗', error });
    });
});

app.get('/confirmname', (req, res) => {
  let username = req.query.username;

  Login.getData(username)
    .then(result => {
      if (result.length > 0) {
        // 如果獲取到資料，表示用戶名已存在
        res.status(200).send({ exists: true, message: "用戶名已被占用" });
      } else {
        // 如果沒有資料，表示用戶名不存在
        res.status(200).send({ exists: false, message: "用戶名可用" });
      }
    }).catch(error => {
      // 處理可能出現的錯誤
      res.status(500).send({ error: error.message });
    });
});
//獲取伺服器信息
app.get('/get_serverinfo', (req, res) => {
  const data = { version: '0.0.1' };
  res.send(data);
});

app.post('/getPost', (req, res) => {
  console.log(req.body)
});
// 一切就緒，開始接受用戶端連線

http.listen(3000);
sio.on('connection', (socket) => {
  let clientIp = socket.handshake.address;
  socket.emit('connected', '' + clientIp);
  console.log('a user connected,ip = ' + clientIp);
  socket.on("game_ping", () => {
    socket.emit("game_pong")
  })
  socket.on("disconnect", () => {
    console.log("客戶端:有人離開Server")
  })

})
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("鍵盤「Ctrl + C」可結束伺服器程式.");

