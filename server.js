let express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// const crypto = require('crypto');
// const assert = require('assert');

require('dotenv').config();
var port = process.env.PORT;
server.listen(port, () => {
  console.log('Server on port : ' + port);

});

app.use(express.static('public'));

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', function (req, res) {
  res.render('index.pug', {
    listUsers: arrUser
  });
});
let arrUser = [];
class User {
  constructor(id, name, rom, message, p, alpha) {
    this.id = id,
      this.name = name,
      this.rom = rom,
      this.message = message,
      this.p = p,
      this.alpha = alpha
  }
}

io.on('connection', function (socket) {
  socket.join(socket.id);
  //console.log(socket.adapter.rooms);
  arrUser.push(socket.id);
  console.log('Client ' + socket.id + ' connected');
  //console.log(arrUser);
  io.emit("send-all-id-client", arrUser);

  socket.on('disconnect', () => {
    let idRemove = arrUser.findIndex(function (item) {
      return item == socket.id;
    });
    arrUser.splice(idRemove, 1);
    console.log(socket.id + ' ngat ket noi ! ');
    console.log(arrUser);
    io.emit("send-all-id-client", arrUser);
  });

  /// Lang nghe client gui thong tin de JOIN vao rom
  socket.on("JOIN", (message) => {
    // ---- Sau khi join vao rom thi se sinh ra so nguyen to P va alpha -----
    let p = sinhNguyenTo(200);
    let alpha =  sinhAnpha(p);
    let publicNumber = {
      p: p,
      alpha: alpha
    }
    console.log(publicNumber);
    socket.join(message.id);
    console.log(socket.id + "Da join vao rom " + message.id);
    //  --- Thong bao da them voa nhom ---
    io.to(socket.id).emit('ROOM_JOINED', "Da them vao nhom " + message.id);

    //     ----- send Public Number -----
    io.in(message.id).emit('Send-to-number-public', publicNumber);
    console.log(socket.adapter.rooms[message.id]);

    //     ------ recive Public Key 1 ------
    socket.on("send-public-key-to-server", (publicKey) => {
      console.log(publicKey)
      socket.to(message.id).emit('send-public-key-to-client', publicKey);
      
    });

    //    ---- recive Public Key 2 Sau khi Client 1 nhan public Key ------
    socket.on("send-server-two", (publicKeyClient2) => {
      console.log(publicKeyClient2 + " public Key Client 2")
      socket.to(message.id).emit('send-public-key-to-client-two', publicKeyClient2);
    });

  });
  /////     ----- End JOIN event -----

  //// Event Chat 

  // /** Process a room join request. */

  /////   ----- Sinh so nguyen to P ------
  function sinhNguyenTo(max) {
    var sieve = [],i, j, primes = [];
    for (i = 2; i <= max; ++i) {
      if (!sieve[i]) {
        // i has not been marked -- it is prime
        primes.push(i);
        for (j = i << 1; j <= max; j += i) {
          sieve[j] = true;
        }
      }
    }
    //console.log(primes);
    return primes[Math.floor(Math.random() * (primes.length-1) + 1)];
  }
  //    ----- END Sinh so nguyen to -----

  //    ----- Sinh "ALPHA" tu phan tu "P" -----
  var arrayNum = [];
  // Ham sinh phan tu "Anpha" 
  function sinhAnpha(p) {
    analyc(p);
    
    var checkTruFalse = checkpts(p, Math.floor(Math.random() * (p - 4) + 3));
    if (checkTruFalse == false) {
      checkTruFalse = checkpts(p, Math.floor(Math.random() * (p - 4) + 3));
      if (checkTruFalse == false){
        checkTruFalse = checkpts(p, Math.floor(Math.random() * (p - 4) + 3));
      }
    }
    return checkTruFalse;
  }
  function  sinhAP(p) {
    return Math.floor(Math.random()*(p-2)+3);
  }
  //    ----- ham phan tich nguyen to -----
  function analyc(p) {
    for (var i = 2; i <= (p - 1) / 2; i++) {
      temp = (p - 1) / i; // p-1 là phi cua p
      if ((p - 1) % i == 0) {
        arrayNum.push(i);
      } else {
        continue;
      }
    }
  }

  //   ----- Ham kiem tra phan tu sinh -----
  function checkpts(p, alpha) {
    for (var i = 0; i < arrayNum.length; i++) {
      if ((alpha ** ((p - 1) / arrayNum[i]) % p) === 1) {
        //console.log("alpha khong la phan tu sinh");
        return false;
      }
    }
    return alpha;
  }
  ///    ----- End sinh "AlPHA" tu phan tu "P" -----


})