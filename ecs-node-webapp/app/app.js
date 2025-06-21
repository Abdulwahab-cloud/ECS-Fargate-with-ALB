const express = require('express');
const path = require('path');
const app = express();
const PORT = 80;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Node.js on ECS Fargate!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
