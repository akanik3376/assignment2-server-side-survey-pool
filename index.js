const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
// middle ware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.vfr78tp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const testimonialCollection = client.db('PollingSurveyDb').collection('testimonial')
        const userCollection = client.db('PollingSurveyDb').collection('users')
        const surveyCollection = client.db('PollingSurveyDb').collection('survey')


        // ____________________
        //$$$$$$$$$$$$ jwt api $$$$$$$$$$$$$$
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '2h' });
            res.send({ token: token })
        })
        // _______________


        app.get('/testimonial', async (req, res) => {
            const result = await testimonialCollection.find().toArray()
            res.send(result)
        })

        // survey start hare **
        app.post('/api/v1/survey', async (req, res) => {
            const createSurvey = req.body;
            console.log(createSurvey)
            const result = await surveyCollection.insertOne(createSurvey)
            res.send(result)
        })

        // survey start hare get all survey
        app.get('/api/v1/survey', async (req, res) => {
            const result = await surveyCollection.find().toArray()
            res.send(result)
        })

        // survey start hare  get survey by id
        app.get('/api/v1/survey/:id', async (req, res) => {
            const result = await surveyCollection.find().toArray()
            res.send(result)
        })






        // user section start hare ####
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'User already exist' })
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('app is running')
})
app.listen(port, () => {
    console.log(`app is running port on : ${port}`)
})