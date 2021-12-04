const bodyParser = require('body-parser');
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()

// create mongo client
const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const app = express();
const port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use(bodyParser.json());


// basic route
app.get('/', (req, res) => {
  res.status(300).redirect('/info.html');
})

app.get('/challenges', async ( req, res) => {
    try {
        // connect to database
        await client.connect();
        const collection = client.db('Session7').collection('challenges')
        const challenges = await collection.find({}).toArray();

        // send back response with data
        res.status(200).send(challenges);
    } catch(error){
        console.log(error)
        // return error when something is wrong
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
