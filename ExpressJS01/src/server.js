require('dotenv').config();
const express = require('express');
const path = require('path');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const cors = require('cors');
const { initProductIndex } = require('./services/elasticsearchService'); // Thêm dòng này

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cho phép truy cập file trong thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

console.log("Static uploads dir:", path.join(__dirname, '..', 'uploads'));

const fs = require('fs');
const uploadsPath = path.join(__dirname, '..', 'uploads');
console.log("Files in uploads:", fs.readdirSync(uploadsPath));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use('/', webAPI);

app.use('/v1/api/', apiRoutes);

(async () => {
    try {
        await connection(); // Kết nối MongoDB
        await initProductIndex(); // Init Elasticsearch index
        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`);
        });
    } catch (error) {
        console.log(">>> Error connect to DB or ES: ", error);
    }
})();