let express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

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
    arrUser.splice(idRemove, 1); // xoa ten client tren may client dang online 
    console.log(socket.id + ' ngat ket noi ! ');
    console.log(arrUser);
    io.emit("send-all-id-client", arrUser);
  });
  var idmessage;
  /// Lang nghe client gui thong tin de JOIN vao rom
  socket.on("JOIN", (message) => {

    // ---- Sau khi join vao rom thi se sinh ra so nguyen to P va alpha -----
    let p = sinhNguyenTo(100000);
    let alpha = sinhAlpha(p); //sinhAP(p); 
    let publicNumber = {
      p: p,
      alpha: alpha
    }
    console.log(publicNumber);
    socket.join(message.id);
    console.log(socket.id + "Da join vao rom " + message.id);
    //  --- Thong bao da them voa nhom ---
    io.to(socket.id).emit('ROOM_JOINED', "Ket noi voi " + message.id);

    //     ----- send Public Number -----
    io.in(message.id).emit('Send-to-number-public', publicNumber);
    console.log(socket.adapter.rooms[message.id]);

    //     ------ recive Public Key 1 ------
    socket.on("send-public-key-to-server", (publicKey) => {
      //console.log(publicKey)
      socket.to(message.id).emit('send-public-key-to-client', publicKey);
      //     ------ End recive Public Key 1 ------
    });

  });
  //    ---- recive Public Key 2 Sau khi Client 1 nhan public Key ------
  socket.on("send-public-key-to-server-2", (publicKey2) => {
    socket.broadcast.emit('send-public-key-to-client-2', publicKey2)
  });


  /////     ----- End JOIN event -----

  //// Event Chat 

  // /** Process a room join request. */

  /////   ----- Sinh so nguyen to P ------
  function sinhNguyenTo(max) {
    var sieve = [],
      i, j, primes = [];
    for (i = 2; i <= max; ++i) {
      if (!sieve[i]) {
        // i has not been marked -- it is prime
        primes.push(i);
        for (j = i << 1; j <= max; j += i) {
          sieve[j] = true;
        }
      }
    }
    return primes[Math.floor(Math.random() * (primes.length - 3) + 3)];
  }
  //    ----- END Sinh so nguyen to -----

  //    ----- Sinh "ALPHA" tu phan tu "P" -----

  function sinhAlpha(p) {
    var arrayNum = [];
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
    //    ----- Ham tim phan tu sinh cac phan tu sinh cua P  -----
    function ArrP(p) {
      var arrPTS = [];
      for (var j = 1; j < (p - 1); j++) {
        arrPTS.push(j);
      }
      for (var j = 0; j < arrPTS.length; j++) {
        for (var i = 0; i < arrayNum.length; i++) {
          if (Math.pow(arrPTS[j], ((p - 1) / arrayNum[i])) % p === 1) {
            arrPTS.splice(j, 1);
          }
        }
      }
      return arrPTS;
    }
    /*
      Kiểm tra số nguyên tố
  */
    function IsPrime(n) {
      if (n < 2)
        return 0;
      for (var i = 2; i <= Math.sqrt(n); i++) {
        if (n % i == 0) {
          return 0;
        }
      }
      return 1;
    }
    analyc(p);
    var pp = ArrP(p).filter(function (value) {
      if (IsPrime(value) === 1) {
        return value;
      };
    })
    return pp[Math.floor(Math.random() * (pp.length))];
  }

  ///    ----- End sinh "AlPHA" tu phan tu "P" -----
  //   ----- Ham tim phan tu sinh cac phan tu sinh cua P  -----

});