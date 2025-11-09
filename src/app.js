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

// 🧠 1️⃣ A normal route that throws an error
app.get("/throw", (req, res) => {
  // This error will automatically go to the error-handling middleware
  throw new Error("Something broke in /throw route!");
});

// 🧠 2️⃣ A route that manually passes error using next(err)
app.get("/manual", (req, res, next) => {
  const err = new Error("Manual error using next(err)");
  next(err);
});

// 🧩 3️⃣ Error-handling middleware (must have 4 parameters!)
app.use((err, req, res, next) => {
  console.error("🔥 Error caught:", err.message);
  res.status(500).json({ error: err.message });
});




app.listen(3000, () => {
  console.log("Server is running on 3000");
});
