// importing all stuffs
const express = require("express");
const mongoose = require("mongoose");
const { Messages, Channels, Members } = require("./dbMessages");
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
let changeStream;

db.once("open", async () => {
  console.log("DB is connected!");
  const msgCollection = db.collection("messages");
  changeStream = msgCollection.watch();
  const channels = await Channels.find({});

  for (let index = 0; index < channels.length; index++) {
    subscribition(channels[index].channelId);
  }
  
});

// ???
// F1iOUHTM5CVKiAUm
// mongodb+srv://admin:<password>@cluster0.e6gprrw.mongodb.net/?retryWrites=true&w=majority
// api routes
app.get("/", (req, res) => {
  res.send("Hello Mern");
});

function subscribition(channelId) {
  changeStream.on("change", (change) => {
    // console.log(change);

    if (change.operationType === "insert") {
      try {
        const msgDetails = change.fullDocument;
        console.log(msgDetails);
        pusher.trigger(channelId, "inserted", msgDetails);
      } catch (error) {
        console.log(error);
      }
    }
  });
}

app.post("/postMessage", async (req, res) => {
  const newMessage = req.body;
  try {
    const sendMsg = await Messages.create(newMessage);
    res.status(201);
    res.send(sendMsg);
  } catch (error) {
    console.log(error);
  }
});

app.post("/checkOrCreateUser", async (req, res) => {
  const userDetails = req.body;
  if (userDetails.memberImg === "") {
    userDetails.memberImg =
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  }
  let memberData;
  try {
    const ifMemberExist = await Members.find({
      memberId: userDetails.memberId,
    });
    if (ifMemberExist.length !== 0) {
      console.log("member already in");
      memberData = ifMemberExist[0];
      const channelsDetails = await Channels.find({
        channelId: { $in: memberData.channels },
      });
      memberData.channels = channelsDetails;
    } else {
      console.log("member not already in");
      memberData = await Members.create(req.body);
    }
    res.status(201);
    res.send(memberData);
  } catch (error) {
    console.log(error);
  }
});

app.post("/createOrJoinRoom", async (req, res) => {
  const { channelId, memberId, channelName } = req.body;
  let { channelImageUrl } = req.body;

  if (channelImageUrl === "") {
    channelImageUrl = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  }

  let roomData;
  try {
    const ifRoomExist = await Channels.find({
      channelId: channelId,
    });
    if (ifRoomExist.length !== 0) {
      console.log("room already exists");
      roomData = ifRoomExist[0];
    } else {
      console.log("room not already exists");
      roomData = await Channels.create({
        channelId: channelId,
        channelImageUrl: channelImageUrl,
        channelName: channelName,
      });
      subscribition(channelId);
    }
    const memberChannelArr = await Members.find({ memberId: memberId });
    if (!memberChannelArr[0].channels.includes(channelId)) {
      await Members.findOneAndUpdate(
        { memberId: memberId },
        { $push: { channels: channelId } }
      );
    }
    res.status(201);
    res.send(roomData);
  } catch (error) {
    console.log(error);
  }
});

app.get("/getMessages", async (req, res) => {
  const channels = JSON.parse(req.query.channels);
  const messages = await Messages.find({ channelId: { $in: channels } });
  // console.log(messages);
  res.status(200);
  res.send(messages);
});

// listen
app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});
