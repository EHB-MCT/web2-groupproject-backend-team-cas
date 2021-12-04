const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

require('dotenv').config();

// create mongo client
const client = new MongoClient(process.env.MONGO_URL)

// create app
const app = express()

// use port
const port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use(bodyParser.json());

// get basic route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});

// return all challenges
app.get('/challenges', async (req, res) =>{

    try{
        //connect to the db
        await client.connect();

        //retrieve the boardgame collection data
        const challenge = client.db('Session7').collection('challenges');
        const challenges = await challenge.find({}).toArray();

        //Send back the data with the response
        res.status(200).send(challenges);
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong!',
            value: error
        });
    }finally {
        await client.close();
    }
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://Rhys:<password>@ehb.rsbwc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
