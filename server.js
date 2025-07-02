const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes');
app.use('/api', userRoutes);

app.get('/', (req,res) => {
    res.send('Welcome to the NSS Sample Question Backend API');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



// Export the app for testing purposes
module.exports = app;



