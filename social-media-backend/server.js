const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users.js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});