const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = 'uploads';

// Créer le dossier d'upload s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Configuration de Multer pour le stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, UPLOAD_DIR)));

// Données en mémoire (remplacer par une base de données en production)
let videos = [
    {
        id: 1,
        url: '/video1.mp4',
        user: { id: 1, username: 'user1', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        caption: 'Première vidéo de test!',
        likes: 150,
        comments: 25,
        shares: 10
    }
];

// Routes
app.get('/api/videos', (req, res) => {
    res.json(videos);
});

app.post('/api/videos', upload.single('video'), (req, res) => {
    const { caption, userId } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier vidéo fourni' });
    }
    
    const newVideo = {
        id: videos.length + 1,
        url: '/' + req.file.filename,
        user: { 
            id: userId || 1, 
            username: `user${userId || 1}`, 
            avatar: `https://randomuser.me/api/portraits/${userId % 2 === 0 ? 'wo' : ''}men/${userId || 1}.jpg`
        },
        caption: caption || 'Nouvelle vidéo',
        likes: 0,
        comments: 0,
        shares: 0
    };
    
    videos.unshift(newVideo);
    res.status(201).json(newVideo);
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});