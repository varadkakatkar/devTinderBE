require("dotenv").config();
const express = require("express");
const app = express();
const jsonParser = express.json();
app.use(jsonParser);
const cookieParser = require("cookie-parser");

app.use(cookieParser());
const { userAuth, adminAuth } = require("./middleware/auth");
const connectDB = require("./config/database");
const { PORT, HOST, ALLOWED_UPDATE_FIELDS } = require("./utils/constants");
const UserModel = require("./models/user");
const {
  checkSignupValidations,
  checkUpdateValidations,
} = require("./utils/checkValidations");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined. Set it in .env");
}
const { verifyToken } = require("./middleware/auth");
console.log("JWT_SECRET:", JWT_SECRET);
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
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await UserModel.findOne({ emailId: RegExp(emailId, "i") });
    if (!user) {
      return res.status(404).json({ error: "User not found or Invalid email" });
    }
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: "1h" });
    const token = await user.getJWT();
    console.log("token ", token);
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      httpOnly: true,
    });
    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in profile:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/signup", checkSignupValidations, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const { firstName, lastName, emailId, password, age, gender, photoUrl } =
      req.body;

    const user = new UserModel({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      age,
      gender,
      photoUrl,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User by email

app.get("/user", async (req, res) => {
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
});

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
