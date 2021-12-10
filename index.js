const bodyParser = require('body-parser');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const { resetWatchers } = require('nodemon/lib/monitor/watch');

// create mongo client
const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const app = express();
const port = process.env.PORT || 1337;

app.use(express.static('public'));
app.use(bodyParser.json());

app.use(cors());


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
app.get('/challenge/:id', async (req,res) => {
    
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

app.post('/challenges', async (req, res) => {

    try{
         //connect to the db
        await client.connect();

         //retrieve the challenges collection data
        const collection = client.db('Session7').collection('challenges');

         // Validation for double challenges
        const challenge = await collection.findOne({_id: ObjectId(req.params.id)});
        if(challenge){
            res.status(400).send(`Bad request: Challenge already exists with name ${req.body.name} for course ${req.body.course}` );
            return;
        } 
         // Create the new Challenge object
        let newChallenge = {
            name: req.body.name,
            course: req.body.course,
            points: req.body.points,
        }
        // Add the optional session field
        if(req.body.session){
            newChallenge.session = req.body.session;
        }
        
         // Insert into the database
        let insertResult = await collection.insertOne(newChallenge);

         //Send back successmessage
        res.status(201).json(newChallenge);
        return;
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

app.put('/challenges/:id', async (req,res) => {
    //Check for body data
    if(!req.body.name || !req.body.points || !req.body.course || !req.body.session){
        res.status(400).send({
            error: 'Bad Request',
            value: 'Missing name, course or points property'
        });
        return;
    }
    // Check for id in url
    if(!req.params.id){
        res.status(400).send({
            error: 'Bad Request',
            value: 'Missing id in url'
        });
        return;
    }

    try{
         //connect to the db
        await client.connect();

         //retrieve the challenges collection data
        const collection = client.db('Session7').collection('challenges');

         // Validation for existing challenge
        const challenge = await collection.findOne({_id: ObjectId(req.params.id)});
        if(!challenge){
            res.status(400).send({
                error: 'Bad Request',
                value: `Challenge does not exist with id ${req.params.id}`
            });
            return;
        } 
         // Create the new Challenge object
        let newChallenge = {
            name: req.body.name,
            course: req.body.course,
            points: req.body.points,
            session: req.body.session
        }
        // Add the optional session field
        if(req.body.session){
            newChallenge.session = req.body.session;
        }
        
         // Insert into the database
        let updateResult = await collection.updateOne({_id: ObjectId(req.params.id)}, 
        {$set: newChallenge});

         //Send back successmessage
        res.status(201).json(updateResult);
        return;
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


//delete a challenge
app.delete('/challenges/:id', async (req,res) => {
    
    if(!req.params.id){
        res.status(400).send({
            error: 'Bad Request',
            value: 'No id available in url'
        });
        return;
    }
    try{
         //connect to the db
        await client.connect();

         //retrieve the challenges collection data
        const collection = client.db('Session7').collection('challenges');

         // Validation for double challenges
        let result = await collection.deleteOne({_id: ObjectId(req.params.id)});
         //Send back successmessage
        res.status(201).json(result);
        return;
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




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
