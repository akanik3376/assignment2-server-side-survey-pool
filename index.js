const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
// const stripe = require("stripe")(process.env.TOKEN_SECRET)
// var jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000
// const stripe = require("stripe")(process.env.STRICK_SECRET_KEY)
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
        const commentCollection = client.db('PollingSurveyDb').collection('comment')
        const reportCollection = client.db('PollingSurveyDb').collection('reports')
        const answerCollection = client.db('PollingSurveyDb').collection('answers')
        const paymentCollection = client.db('PollingSurveyDb').collection('payments')



        // ____________________
        //$$$$$$$$$$$$ jwt api $$$$$$$$$$$$$$



        // _______________
        // answer collections
        app.post('/user-vote', async (req, res) => {
            const surveyQNA = req.body;
            console.log(surveyQNA)
            const result = await answerCollection.insertOne(surveyQNA)
            res.send(result)
        })
        app.get('/user-vote', async (req, res) => {
            const result = await answerCollection.find().toArray()
            res.send(result)
        })


        //reports
        app.post('/reports', async (req, res) => {
            const report = req.body;
            const result = await reportCollection.insertOne(report)
            res.send(result)
        })
        //reports
        app.get('/reports', async (req, res) => {
            const report = req.body;
            const result = await reportCollection.find().toArray()
            res.send(result)
        })

        //comments
        app.post('/comments', async (req, res) => {
            const createSurvey = req.body;
            const result = await commentCollection.insertOne(createSurvey)
            res.send(result)
        })
        app.get('/comments', async (req, res) => {

            const result = await commentCollection.find().toArray()
            res.send(result)
        })

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
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await surveyCollection.findOne(query)
            res.send(result)
        })
        // survey start hare  get survey by id
        app.delete('/api/v1/survey/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await surveyCollection.deleteOne(query)
            res.send(result)
        })
        // update survey
        app.patch('/api/v1/survey/:id', async (req, res) => {
            const id = req.params.id
            const updateSurvey = req.body;
            console.log(updateSurvey)
            const filter = { _id: new ObjectId(id) }
            const updateData = {
                $set: {
                    category: updateSurvey.category,
                    details: updateSurvey.details,
                    image: updateSurvey.image,
                    name: updateSurvey.name,
                    price: updateSurvey.price,
                    status: updateSurvey.status,
                    feedback: updateSurvey.feedback
                },
            }
            console.log(updateData)
            const result = await surveyCollection.updateOne(filter, updateData)
            console.log(result)
            res.send(result)
        })

        app.patch('/api/v1/survey/like/:id', async (req, res) => {
            try {
                const { id } = req.params;

                const query = { _id: new ObjectId(id) };
                const info = req.body;
                console.log(info)
                const updateDoc = {
                    $inc: { likesCount: 1 },
                    $push: {
                        // likesCount: info.likesCount + 1,
                        likerEmail: info.userEmail,
                        likerName: info.userName,
                    },
                };
                console.log(updateDoc)
                const result = await surveyCollection.updateOne(query, updateDoc);

                if (result.modifiedCount === 1) {
                    res.json({ success: true });
                } else {
                    res.status(404).json({ success: false, error: 'Survey not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            }
        });


        // caking admin TO DO***
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email
            if (email !== req.decoded.email) {
                return res.status(403).send({ massage: 'authorization access' })
            }

            const query = { email: email }
            const user = await userCollection.findOne(query)

            let admin = false;
            if (user) {
                admin = user.role === 'admin'
            }
            res.send({ admin })
        })

        // admin api
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: ('admin')
                },
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        }
        )
        // handle make Surveyor
        app.patch("/users/surveyor/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: "surveyor",
                },
            };
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });
        // handle make Surveyor
        app.get("/users/surveyor/:email", async (req, res) => {
            const email = req.params.email
            if (email !== req.decoded.email) {
                return res.status(403).send({ massage: 'authorization access' })
            }

            const query = { email: email }
            const user = await userCollection.findOne(query)

            let surveyor = false;
            if (user) {
                surveyor = user.role === 'surveyor'
            }
            res.send({ surveyor })
        });

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
        //users get 
        app.get('/users', async (req, res) => {

            const result = await userCollection.find().toArray()
            res.send(result)
        })
        //delete user by admin
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })


        // ***** Payment Method
        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            console.log(price) //get price from body
            if (price > 0) {
                const amount = parseInt(price * 100) // do parseInt amount=1tk=100 poisha
                console.log(amount)
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: 'usd',
                    payment_method_types: ['card']
                })
                res.send({
                    clientSecret: paymentIntent.client_secret,
                });
            }


        })

        //  post :: payments and user data
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            // console.log(payment);
            const result = await paymentCollection.insertOne(payment);
            // console.log(payment.email);
            const userEmail = payment.email
            // console.log(userEmail,'ja payment korse tar email');

            // update user role
            const updateUserRole = await userCollection.updateOne(
                { email: userEmail },
                { $set: { role: 'pro-user' } }
            )

            res.send({ result, updateUserRole });
        })

        // get:: show payment history data
        app.get("/payments", async (req, res) => {
            // console.log(req.user.email);
            const result = await paymentCollection.find().toArray()
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