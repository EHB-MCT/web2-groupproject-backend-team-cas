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

        //only look for a bg with this ID
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

app.post('/challenges', async (req, res) => {
    if (!req.body.name || !req.body.course || !req.body.points) {
        res.status(400).send('Request failed — Missing name, course or points attributed');
        return;
    }

    try {
        await client.connect();
        const collections = client.db('Session7').collection('challenges');
        const challenges = await collections.findOne({name: req.body.name, course: req.body.course});
        
        if (challenges){
            res.status(400).send(`Request failed — A challenge with the name ${req.body.name} already exists for the course ${req.body.course}`)
            return;
        }

        let newChallenge = {
            name: req.body.name,
            course: req.body.course,
            points: req.body.points
        }

        if(req.body.session){
            newChallenge.session = req.body.session;
        }

        let insertNewChallenge = await collections.insertOne(newChallenge);

        res.status(201).json(newChallenge);
    } catch(error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong', 
            value: error
        });
    }finally {
        await client.close();
    }
})

app.put('/challenge', (req, res) => {
    if (!req.body.name || !req.body.course || !req.body.points) {
        res.status(400).send('Request failed — Missing name, course or points attributed');
        return;
    }

    try {

        const collections = client.db('Session7').collection('challenges');
        const query = { id: Number(req.query.id) };

        const challenge = await collections.findOne(query);

        let updChallenge = {
            name: req.body.name,
            course: req.body.course,
            points: req.body.points
        }

        if(req.body.session){
            newChallenge.session = req.body.session;
        }

        const updateChallenge = await challenge.updateChallenge(updChallenge)



    }catch(error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong', 
            value: error
        });
    }finally {
        await client.close();
    }


})

app.delete('/challenge', (req, res) => {

    try {

        const collections = client.db('Session7').collection('challenges');
        const query = { id: Number(req.query.id) };

        const challenge = await collections.findOne(query);



    }catch(error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong', 
            value: error
        });
    }finally {
        await client.close();
    }
    
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
