import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/save-shopping-list', async (req, res) => {
  try {
    await fs.writeFile('public/shopping-list.json', JSON.stringify(req.body));
    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving shopping list:', error);
    res.sendStatus(500);
  }
});

app.post('/save-recipes', async (req, res) => {
  try {
    await fs.writeFile('public/recipes.json', JSON.stringify(req.body));
    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving recipes:', error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
