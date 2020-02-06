$(document).ready(() => {
    new WOW().init();

    // socket.io
    let arrUser = [];
    let listName = ['Men', 'Nu', 'Hoang', 'Thu', 'Su'];
    //let __user = localStorage.getItem("__user");
    class User {
        constructor(id, name) {
            this.id = id,
            this.name = name
        }
    } 

    let socket = io.connect('http://localhost:3000');
    socket.on("send-all-id-client", (arrUser) => {
        let nameId = document.getElementById('s-name-and-id-user');
        nameId.innerHTML = `<h3>Name Id : </h3> <p> ${socket.id}</p>`;
        let idRemove = arrUser.findIndex(function (item) {
            return item == socket.id;
        });
        arrUser.splice(idRemove, 1);
        let stringUser = renderListUser(arrUser).join(' ');
        let idElemen = document.getElementById('id-client');
        idElemen.innerHTML = '<ul class="list-group col-md-12">' + stringUser + '</ul>';
        getvalueIdUser();
    });

    ///             ----- JOIN ROMS ----- 

    //  --- input connect id ROM user ---
    $("#s-input-connectID").keyup(function (event) {
        if (event.keyCode === 13) {
            message = {
                id: this.val,
                name: listName[Math.floor(Math.random() * 5)]
            }
            console.log(message);
            socket.emit("JOIN", message);
            $(this).val("");
            socket.on('ROOM_JOINED', function (message) {
                alert(message);
            });

        }
    });
    $("#button-addon2").click(function (event) {
        message = {
            id: document.getElementById("s-input-connectID").value,
            name: listName[Math.floor(Math.random() * 5)]
        }
        console.log(message);
        socket.emit("JOIN", message);
        $("#s-input-connectID").val("");
        socket.on('ROOM_JOINED', function (message) {
            alert(message);
        });

    });
    let publicNumberClientAll; // Bien public Number all
    socket.on('Send-to-number-public', (publicKey) => {
        publicNumberClientAll = publicKey;
        let p = publicKey.p; // so nguyen to p
        let alpha = publicKey.alpha; // phan tu sinh alpha

        //      --- Render Public Number ---
        document.querySelector(".content-key-public").innerText = `( ${p},${alpha} )`;

        //      --- Generate Private Key ---
        let privateKey = Math.floor(Math.random() * (p - 4) + 2);//sinhNguyenTo(Math.floor(Math.random() * (p - 3)));

        //      --- Render Private Key ---
        document.querySelector(".content-key-private").innerText = privateKey;

        //      --- Send Public Key ---
        let privateKey2 = parseInt(document.querySelector(".content-key-private").innerText);
         // g^a mod p
        var newPublicKey = mod(publicKey.alpha,privateKey2,publicKey.p)
        socket.emit("send-public-key-to-server", newPublicKey);
        //socket.emit("send-public-key-to-server", (Math.pow(publicKey.alpha, privateKey2)) % publicKey.p);

        //      --- Render Public Key ---

        document.querySelector(".content-key-public-2").innerText = newPublicKey;


    });

    //    --- Recive Public Key Client 1 ---
    socket.on("send-public-key-to-client", (recivePublicKey) => {
        console.log(recivePublicKey + " ben A");
        //   --- Get Public Key myself ---
        let publicKeyMyself = parseInt(document.querySelector('.content-key-private').innerText);
        console.log(publicKeyMyself + " public ben B");

        //   --- Caculator Serect Key ---
        // let serectKey = ((parseInt(recivePublicKey)) ** (publicKeyMyself)) % publicNumberClientAll.p;
        // g^a mod p
        // mod(g, a, p)
        //mod(17,19,31)
        let serectKey = mod(parseInt(recivePublicKey),publicKeyMyself,publicNumberClientAll.p);
        console.log("serect: B " + serectKey);

        //   --- Render Serect Key ---
        document.querySelector(".content-key-serect").innerText = serectKey;

        //      ------- display flex --------
        document.querySelector(".alert-connect-share-key").style.display = "flex";
        
        
    });

//   --- Send to Public Key 2 ---
        //  Sau khi Client 2 nhan duoc public Key ben Client 1 thi Client 2 gửi lại public Key cho Client 2 
        let publicKeyM2 = parseInt(document.querySelector(".content-key-public-2").innerText);
        //      --- Recive Public Key Client 2 ---
        socket.on("send-public-key-to-client-2", (publicKeyClient2) => {
            //  ----- Get Private Key form UI Client 2 ----
            let privateKeyClient2 = parseInt(document.querySelector(".content-key-private").innerText);

            //              ---- Tinh Serect Key Client 2  ----
            // g^a mod p
            // mod(g, a, p)
            //mod(17,19,31)
            //let serectKeyClient2 = Math.pow(publicKeyClient2, privateKeyClient2) % publicNumberClientAll.p;
            let serectKeyClient2 = mod(publicKeyClient2,privateKeyClient2,publicNumberClientAll.p);
            // ---- Render Serect Key ---- 
            document.querySelector('.content-key-serect').innerText = serectKeyClient2;
        });
        //          ---- Thu Tao su kien bang click ----
        document.getElementById("btn-add-member").addEventListener("click", () => {
            //   --- Send to Public Key 2 ---
            //  Sau khi Client 2 nhan duoc public Key ben Client 1 thi Client 2 gửi lại public Key cho Client 2 
            let publicKeyM2 = parseInt(document.querySelector(".content-key-public-2").innerText);
            socket.emit("send-public-key-to-server-2", publicKeyM2);
            console.log("Public Client 2: " + publicKeyM2);
            document.querySelector(".alert-connect-share-key").style.display = "none";

        })
       
    /// Chat 

    // $("#s-input-chat").keyup(function (event) {
    //     if (event.keyCode === 13) {
    //         data = {
    //             id: socket.id,
    //             message: this.value
    //         }
    //         console.log(data);
    //         socket.emit("Client-send-to-message-data-server", data);
    //         $(this).val("");
    //         socket.on('Sever-send-to-message-data-individual', function (message) {
    //             alert(message);
    //         })
    //     }
    // });

    /// function render data from arrUser
    function renderListUser(arr) {
        return arr.map(function (item) {
            return '<div class= "content-data-user list-group-item s-list-group-item "><li class="list-group-item s-data-user">' + item + '</li> <button type="button" class="btn btn-success s-btn-success">Chooses</button></div>';
        });
    }

    /// lay ID user tu the html
    function getvalueIdUser() {
        let elementChooses = Array.from(document.querySelectorAll('.s-btn-success'));
        let elementInputIdConnect = document.querySelector('#s-input-connectID');
        let elementDataUser = Array.from(document.querySelectorAll('.s-data-user'));
        elementChooses.forEach((value, index1) => {
            value.addEventListener('click', function () {
                console.log(value);
                elementDataUser.forEach((value2, index2) => {
                    if (index2 === index1) {
                        let data = value2.innerText;
                        //console.log(data);
                        elementInputIdConnect.value = data;
                    }
                });
            })
        });
    }
    //          ----- Tinh mod -----
      function mod(g, a,p) {
        var res = 1;
        var i;
        for (i = 1; i <= a; ++i)
            res = (res * g) % p;
        return res;
    }
    // g la phan tu sinh , a la so sinh ngau nhien 
    // g^a mod p
    //mod(19,18,41)
});