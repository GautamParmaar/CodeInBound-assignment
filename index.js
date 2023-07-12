const express = require("express");
const connectToMongo = require("./db");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const User = require("./models/user");
var jwt = require("jsonwebtoken");
const fetchuser = require("./middleware/fetchUser");

const JWT_SECRET = "GautamParmar";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//endpoint for creating user
app.post(
  "/createuser",
  [
    body("email", "must be email").isEmail(),
    body("name", "name must be 3 characters").isLength({ min: 3 }),
    body("password", "password must be more than 5 character").isLength(6),
  ],
  async (req, res) => {
    // if there are errors then it will return bad request & errors
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ result: result.array() });
    }

    try {
      // check whether user with this email exist already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorrya user with this email already exist" });
      }

      //creates a new user
      user = await User.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      console.log(user);
      res.send(authToken);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("some error occured");
    }
  }
);

//get user details by jsonwebtoken
app.post("/getUser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//endpoint for updating user details through id & we must enter jwt token in headers
app.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //create a newNote object
    const newNote = {};
    if (name) {
      newNote.name = name;
    }
    if (email) {
      newNote.email = email;
    }
    if (password) {
      newNote.password = password;
    }

    //find the user and update it & user is not in database then it will send not found
    let note = await User.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    if (note._id.toString() !== req.user.id) {
      //this is for checking that right user is updating details or not

      return res.status(401).send("Not Allowed");
    }
    note = await User.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // const { title, description, tag } = req.body;

    //find the user to be deleted and delete it
    let note = await User.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    //allow deletion only if user owns this
    if (note._id.toString() !== req.user.id) {
      //this is for checking that right user is updating note or not

      return res.status(401).send("Not Allowed");
    }
    note = await User.findByIdAndDelete(req.params.id);
    res.json({ success: "note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(` Backend listening on port ${port}`);
});

connectToMongo();
