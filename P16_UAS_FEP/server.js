const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer'); // Import multer untuk menangani file upload

const app = express();
const port = 3000;

// Konfigurasi koneksi ke PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Website',
  password: 'ShirleyUntar',
  port: 5432,
});

// Konfigurasi multer untuk menyimpan file yang diunggah
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Tentukan folder untuk menyimpan file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file akan diberi timestamp
  },
});

const upload = multer({ storage: storage });

// Configure ejs and static files
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views/public'))); // Memastikan 'public' dapat diakses

app.use(express.static(path.join(__dirname, 'public'))); // Memastikan 'public' dapat diakses


// Middleware untuk menangani form data
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('index', { nama: 'shir', title: 'Halaman Homeku' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'Halaman Aboutku' });
});

app.get('/info', (req, res) => {
  res.render('info', { title: 'Halaman Infoku' });
});

// Halaman upload foto dan caption
app.get('/upload', async (req, res) => {
  // Ambil semua foto dan caption yang sudah diupload dari database
  const result = await pool.query('SELECT * FROM uploads');
  res.render('upload', { 
    title: 'Upload Foto dan Caption',
    uploads: result.rows // Menampilkan semua foto yang sudah diupload
  });
});

// Menangani unggahan foto dan caption
app.post('/upload', upload.single('photo'), async (req, res) => {
  const { caption } = req.body; // Caption yang dimasukkan user
  const photo = req.file ? req.file.filename : null; // Nama file foto yang diunggah

  // Simpan data ke dalam database PostgreSQL
  if (photo) {
    const query = 'INSERT INTO uploads(caption, photo_url) VALUES($1, $2)';
    const values = [caption, `uploads/${photo}`]; // Menyimpan lokasi foto yang ada di folder uploads

    try {
      await pool.query(query, values); // Menyimpan ke database
    } catch (error) {
      console.error('Error inserting data into database:', error);
    }
  }

  // Redirect setelah proses selesai, misalnya ke halaman upload lagi
  res.redirect('/upload');
});


// 404 route for unmatched paths
app.use('/', (req, res) => {
  res.send('<h1>404</h1>');
});

// Start server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
