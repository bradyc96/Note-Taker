//Dependencies
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


//GET index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

//GET notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

//GET api/notes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile('./db/db.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverside error');
  }
});

//POST notes to api/notes
app.post('/api/notes', async (req, res) => {
  try {
    const { title, text } = req.body;
    if (!title || !text) {
      return res.status(400).json({ msg:'Include title and text' });
    }
    const data = await fs.readFile('./db/db.json', 'utf-8');
    const notes = JSON.parse(data);
    const newNote = { title, text, id: uuidv4() };
    notes.push(newNote);
    await fs.writeFile('./db/db.json', JSON.stringify(notes));
    res.json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).send('Serverside error');
  }
});

//DELETE notes
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const data = await fs.readFile('./db/db.json', 'utf-8');
    const notes = JSON.parse(data);
    const notesFilter = notes.filter((note) => note.id !== id);
    await fs.writeFile('./db/db.json', JSON.stringify(notesFilter));
    res.json({ msg: `Note ${id} has been deleted` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});