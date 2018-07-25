const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const Recipe = require("./models/Recipe");
const User = require("./models/User");

// Bring in graphql middleware
const { graphiqlExpress, graphqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");

const { typeDefs } = require("./schema");
const { resolvers } = require("./resolvers");

// create schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

// initializes application
const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};

app.use(cors(corsOptions));

// St up JWT authentication middleware
app.use(async (req, res, next) => {
  const token = req.headers["authorization"];
  if (token !== "null") {
    try {
      const currentUser = await jwt.verify(token, process.env.SECRET);
      req.currentUser = currentUser;
    } catch (err) {
      console.error(err);
    }
  }
  next();
});

// create graphql application
app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

// connect schemas with graphql
app.use(
  "/graphql",
  bodyParser.json(),
  graphqlExpress(({ currentUser }) => ({
    schema,
    context: {
      Recipe,
      User,
      currentUser
    }
  }))
);

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
