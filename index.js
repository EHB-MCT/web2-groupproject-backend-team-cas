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


// CORS error - https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
 app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
 });


// basic route
app.get('/', (req, res) => {
  res.status(300).redirect('/info.html');
})

// get all challenges
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


// get one challenge
app.get('/challenge', async (req,res) => {
    
    //id is located in the query: req.query.id
    try{
        // connect to database
        await client.connect();

        const collections= client.db('Session7').collection('challenges');

        //only look for a challenge with this ID
        const query = { id: Number(req.query.id) };
        console.log(query)

        const challenge = await collections.findOne(query);

        if(challenge){
            // send back response with data
            res.status(200).send(challenge);
            return;
        }else{
            res.status(400).send('Challenge could not be found with id: ' + req.query.id);
        }
      
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

app.post('/saveChallenge', async (req, res) =>{

    console.log(req.body);

    if(!req.body.name || !req.body.points || !req.body.course || !req.body.session || !req.body.id) {
        req.status(400).send('Bad request: missing name, points, course, session or id');
        return;
    }

    try {
        await client.connect();
        const collection = client.db('Session7').collection('challenges')
        
        const challenge = await collection.findOne( {id: req.body.id} )
        if(challenge) {
            res.status(400).send('Bad request: Challenge already exists with that id ' + req.body.id); 
            return;
        }

        let newChallenge = {
            id: req.body.id,
            name: req.body.name,
            points: req.body.points,
            course: req.body.points,
            session: req.body.session,
        }

        let insertChallenge = await collection.insertOne(newChallenge);

        res.status(201).send(newChallenge);
        return;
        
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })

    }finally{
        await client.close();
    }
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
