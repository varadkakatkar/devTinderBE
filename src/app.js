const express = require("express");
const app = express();
const { userAuth, adminAuth } = require("./middleware/auth");


// app.use("/hello", (req, res) => {
//   res.send("Hello from server ............");
// });

// app.use("/test", (req, res) => {
//   res.send("Hello World test");
// });

// app.use("/", (req, res) => {
//   res.send("Namaste .........");
// });



// app.use(
//     "/user",
//     (req,res,next)=>{
//         console.log(" Handling route user  ");
//         // res.send("Response !!!!!!");
//         next();
//     },
//     (req,res)=>{
//         console.log(" Handling route user  ");
//         res.send("Response 2 !!!!!!");
//     }
// );


app.get("/admin", adminAuth, (req, res) => {
  res.send("Admin route");
});

app.get("/user", userAuth, (req, res) => {
  res.send("User route");
});

app.get("user/login", (req, res) => { // does not require authentication
  res.send("User login route");
});

app.get("/user/data", userAuth, (req, res) => { // requires authentication
  res.send("User data route");
});



app.listen(3000, () => {
  console.log("Server is running on 3000");
});
