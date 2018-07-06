const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config({ path: 'variables.env' });
const Recipe = require('./models/Recipe');
const User = require('./models/User');

// Bring in graphql middleware
const { graphiqlExpress, graphqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');

// create schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers

});


// connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('DB connected'))
  .catch(err => console.error(err));

// initializes application
const app = express();

// create graphql application
app.use('/graphiql', graphiqlExpress({ endpointURL: 'graphql' }
))

// connect schemas with graphql
app.use('graphql', graphqlExpress({
  schema,
  context: {
    Recipe,
    User
  }

}));

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
