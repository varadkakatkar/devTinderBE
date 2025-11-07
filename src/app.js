const express = require("express");
const app = express();



// app.use("/hello", (req, res) => {
//   res.send("Hello from server ............");
// });

// app.use("/test", (req, res) => {
//   res.send("Hello World test");
// });

// app.use("/", (req, res) => {
//   res.send("Namaste .........");
// });



app.use(
    "/user",
    (req,res,next)=>{
        console.log(" Handling route user  ");
        // res.send("Response !!!!!!");
        next();
    },
    (req,res)=>{
        console.log(" Handling route user  ");
        res.send("Response 2 !!!!!!");
    }
);

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
