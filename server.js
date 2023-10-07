// importing all stuffs
const express = require("express");
const mongoose = require("mongoose");
const Messages = require("./dbMessages");
const Pusher = require("pusher");
const cors = require("cors");

// Pusher: real time database
const pusher = new Pusher({
  appId: "1683452",
  key: "1bf5e44c94d89216c552",
  secret: "475b289d79284e0285a9",
  cluster: "ap2",
  useTLS: true,
});

// app config
const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(express.json());
app.use(cors());

// DB config
const mongoURI =
  "mongodb+srv://admin:F1iOUHTM5CVKiAUm@cluster0.e6gprrw.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB is connected!");
  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    // console.log(change);

    if (change.operationType === "insert") {
      try {
        const msgDetails = change.fullDocument;
        pusher.trigger("messages", "inserted", {
          name: msgDetails.name,
          message: msgDetails.message,
          timestamp: msgDetails.timestamp,
          email: msgDetails.email,
        });
      } catch (error) {
        console.log(error);
      }
    }
  });
});

// ???
// F1iOUHTM5CVKiAUm
// mongodb+srv://admin:<password>@cluster0.e6gprrw.mongodb.net/?retryWrites=true&w=majority
// api routes
app.get("/", (req, res) => {
  res.send("Hello Mern");
});

app.post("/message/new", async (req, res) => {
  const newMessage = req.body;
  try {
    const sendMsg = await Messages.create(newMessage);
    res.status(201);
    res.send(sendMsg);
  } catch (error) {
    console.log(error);
  }
});

app.get("/message/getall", async (req, res) => {
  const messages = await Messages.find();
  // console.log(messages);
  res.status(200);
  res.send(messages);
});

// listen
app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});
