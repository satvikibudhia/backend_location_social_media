require('dotenv').config();  // Corrected from 'dotnev' to 'dotenv'

const express = require("express");
const workoutRoutes= require('./routes/workout')



const app = express();

app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});


app.use('/api/workouts',workoutRoutes)



app.listen(process.env.PORT, () => {
    console.log('listening on port ', process.env.PORT);
})
