const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("hello mern");
});

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bathfkv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const postCollection = client.db("internAssign").collection("allPost");

    //get all post
    app.get("/allPost", async (req, res) => {
      const query = {};
      const result = await postCollection.find(query).toArray();
      res.send(result);
    });

    //get post by email
    app.get("/mytweet/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await postCollection.find(query).toArray();
      res.send(result);
    });

    //post tweet
    app.post("/tweet", async (req, res) => {
      const user = req.body;
      const result = await postCollection.insertOne(user);
      res.send(result);
    });

    // delete tweet by user
    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await postCollection.deleteOne(filter);
      res.send(result);
    });

    //put method for like post

    app.put("/likepost/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };

      console.log(body);
      const existingLikes = await postCollection.findOne(filter);

      const likeExited = existingLikes.like.find(
        (likeEmail) => likeEmail.email === body.email
      );
      console.log(likeExited);

      if (likeExited) {
        console.log("Like Removed");
        // if exist then remove the like
        const removedlike = existingLikes.like.filter(
          (like) => like.email !== body.email
        );

        console.log(removedlike);
        const updateDoc = {
          $set: {
            like: [...removedlike],
          },
        };

        const option = { upsert: true };
        const result = await postCollection.updateOne(
          filter,
          updateDoc,
          option
        );
        res.send(result);

        return;
      } else {
        console.log("Like Added");
        const updateDoc = {
          $set: {
            like: [...existingLikes.like, body],
          },
        };
        const option = { upsert: true };
        const result = await postCollection.updateOne(
          filter,
          updateDoc,
          option
        );
        res.send(result);
        return;
      }
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`port is running on ${port}`);
});
