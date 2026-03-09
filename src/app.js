require("dotenv").config();
const express = require("express");
const app = express();
const jsonParser = express.json();
app.use(jsonParser);
const cookieParser = require("cookie-parser");

app.use(cookieParser());
const connectDB = require("./config/database");
const { PORT, HOST } = require("./utils/constants");
const UserModel = require("./models/user");
const { checkUpdateValidations } = require("./utils/checkValidations");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Set it in .env");
}
console.log("JWT_SECRET:", JWT_SECRET);

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

// });

/*// app.use("/test", (req, res) => {
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


/*app.get("/admin", adminAuth, (req, res) => {
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

 */





// Get User by email

/* app.get("/user", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await UserModel.findOne({ emailId: RegExp(email, "i") });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feed API - GET /feed get all users from database

app.get("/feed", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/user", async (req, res) => {
  try {
    const userid = req.query.id;
    const user = await UserModel.findByIdAndDelete(userid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json({ message: "user deleted successfully", user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/user", checkUpdateValidations, async (req, res) => {
  try {
    const userid = req.query.id;
    const user = await UserModel.findByIdAndUpdate(userid, req.body, {
      new: true,
      returnDocument: "after",
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json({ message: "user updated successfully", user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); */

connectDB()
  .then(() => {
    console.log("DB connection established ");
    app.listen(PORT, () => {
      console.log(`Server is running on Host ${HOST}${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected ..", err);
  });
