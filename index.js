/*const http = require("http")
const Socket = require("websocket").server
const server = http.createServer(()=>{})

server.listen(3000,()=>{
    
})

const webSocket = new Socket({httpServer:server})

const users = []

webSocket.on('request',(req)=>{
    const connection = req.accept()
   

    connection.on('message',(message)=>{
        const data = JSON.parse(message.utf8Data)
        console.log(data);
        const user = findUser(data.name)
       
        switch(data.type){
            case "store_user":
                if(user !=null){
                    //our user exists
                    connection.send(JSON.stringify({
                        type:'user already exists'
                    }))
                    return

                }

                const newUser = {
                    name:data.name, conn: connection
                }
                users.push(newUser)
            break

            case "start_call":
                let userToCall = findUser(data.target)

                if(userToCall){
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is ready for call"
                    }))
                } else{
                    connection.send(JSON.stringify({
                        type:"call_response", data:"user is not online"
                    }))
                }

            break
            
            case "create_offer":
                let userToReceiveOffer = findUser(data.target)

                if (userToReceiveOffer){
                    userToReceiveOffer.conn.send(JSON.stringify({
                        type:"offer_received",
                        name:data.name,
                        data:data.data.sdp
                    }))
                }
            break
                
            case "create_answer":
                let userToReceiveAnswer = findUser(data.target)
                if(userToReceiveAnswer){
                    userToReceiveAnswer.conn.send(JSON.stringify({
                        type:"answer_received",
                        name: data.name,
                        data:data.data.sdp
                    }))
                }
            break

            case "ice_candidate":
                let userToReceiveIceCandidate = findUser(data.target)
                if(userToReceiveIceCandidate){
                    userToReceiveIceCandidate.conn.send(JSON.stringify({
                        type:"ice_candidate",
                        name:data.name,
                        data:{
                            sdpMLineIndex:data.data.sdpMLineIndex,
                            sdpMid:data.data.sdpMid,
                            sdpCandidate: data.data.sdpCandidate
                        }
                    }))
                }
            break

            case "call_ended":
                const userToEndCall = findUser(data.target);
                if (userToEndCall) {
                  userToEndCall.conn.send(
                    JSON.stringify({
                      type: "call_ended",
                      name: data.name,
                      data: "Call ended by peer",
                    })
                  );
                }
        break;

      default:
        console.log(`Unknown message type: ${data.type}`);

        }

    })
    
   
    connection.on("close", () => {
        users.forEach((user) => {
          if (user.conn === connection) {
            users.splice(users.indexOf(user), 1);
            console.log(`User ${user.name} disconnected`);
          }
        })
      })



})

const findUser = username =>{
    for(let i=0; i<users.length;i++){
        if(users[i].name === username)
        return users[i]
    }
}*/


const http = require("http");
const { server: WebSocketServer } = require("websocket");

// Create HTTP server
const server = http.createServer(() => {});

// Use the PORT environment variable for deployment, defaulting to 3000 if not set
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Create WebSocket server
const webSocket = new WebSocketServer({ httpServer: server });

// Array to store connected users
const users = [];

// Find user by username
const findUser = (username) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].name === username) return users[i];
  }
  return null; // Explicitly return null if no user is found
};

// Handle WebSocket connections
webSocket.on("request", (req) => {
  const connection = req.accept();

  // Handle incoming messages
  connection.on("message", (message) => {
    const data = JSON.parse(message.utf8Data);
    console.log("Received message:", data);

    const user = findUser(data.name);

    switch (data.type) {
      case "store_user":
        if (user !== null) {
          // User already exists
          connection.send(
            JSON.stringify({
              type: "user already exists",
            })
          );
          return;
        }

        // Add new user
        const newUser = {
          name: data.name,
          conn: connection,
        };
        users.push(newUser);
        console.log(`User ${data.name} stored`);
        break;

      case "start_call":
        const userToCall = findUser(data.target);

        if (userToCall) {
          connection.send(
            JSON.stringify({
              type: "call_response",
              data: "user is ready for call",
            })
          );
        } else {
          connection.send(
            JSON.stringify({
              type: "call_response",
              data: "user is not online",
            })
          );
        }
        break;

      case "create_offer":
        const userToReceiveOffer = findUser(data.target);

        if (userToReceiveOffer) {
          userToReceiveOffer.conn.send(
            JSON.stringify({
              type: "offer_received",
              name: data.name,
              data: data.data.sdp,
            })
          );
        }
        break;

      case "create_answer":
        const userToReceiveAnswer = findUser(data.target);
        if (userToReceiveAnswer) {
          userToReceiveAnswer.conn.send(
            JSON.stringify({
              type: "answer_received",
              name: data.name,
              data: data.data.sdp,
            })
          );
        }
        break;

      case "ice_candidate":
        const userToReceiveIceCandidate = findUser(data.target);
        if (userToReceiveIceCandidate) {
          userToReceiveIceCandidate.conn.send(
            JSON.stringify({
              type: "ice_candidate",
              name: data.name,
              data: {
                sdpMLineIndex: data.data.sdpMLineIndex,
                sdpMid: data.data.sdpMid,
                sdpCandidate: data.data.sdpCandidate,
              },
            })
          );
        }
        break;
        
        case "call_ended":
        const userToEndCall = findUser(data.target);
        if (userToEndCall) {
          userToEndCall.conn.send(
            JSON.stringify({
              type: "call_ended",
              name: data.name,
              data: "Call ended by peer",
            })
          );
        }
        break;

      default:
        console.log(`Unknown message type: ${data.type}`);
    }
  });

  // Handle connection close
  connection.on("close", () => {
    users.forEach((user) => {
      if (user.conn === connection) {
        users.splice(users.indexOf(user), 1);
        console.log(`User ${user.name} disconnected`);
      }
    });
  });
});
