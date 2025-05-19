console.clear(), require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const NumberModel = require('./models/Number');
const Redirect = require('./models/Redirect');
const Visit = require('./models/Visit');


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado com sucesso'))
    .catch(err => console.error('Erro ao conectar MongoDB:', err));

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.json({ limit: '2mb' }));

app.post('/save', async (req, res) => {
    const { number } = req.body;
    const phoneNumber = parsePhoneNumberFromString(number, 'BR');

    if (phoneNumber && phoneNumber.isValid()) {
        const formattedNumber = phoneNumber.number;
        console.log(`Número válido recebido: ${formattedNumber}`); // E.164 format

        const exists = await NumberModel.findOne({ number: formattedNumber });
        if (exists) return res.status(200).send(3);

        const saved = new NumberModel({ number: formattedNumber });
        await saved.save();

        res.status(200).send(1);
    } else {
        console.log(`Número inválido: ${number}`);
        res.status(200).send(0);
    }
});

app.get('/admin-stats', async (req, res) => {
    try {
        const numbersCount = await NumberModel.countDocuments();
        const visitDoc = await Visit.findOne();
        const visitsCount = visitDoc ? visitDoc.count : 0;
        const redirectDoc = await Redirect.findOne();
        const redirectCount = redirectDoc ? redirectDoc.count : 0;

        res.json({
            total_numeros_salvos: numbersCount,
            total_visitas: visitsCount,
            total_redirecionamentos: redirectCount
        });
    } catch (err) {
        res.status(500).send('Erro ao buscar estatísticas.');
    }
});

app.get('/go', async (req, res) => {
    try {
        let redirect = await Redirect.findOne();
        if (!redirect) {
            redirect = new Redirect({ count: 1 });
        } else {
            redirect.count += 1;
        }

        await redirect.save();

        // Redirecionar o usuário para sua playlist
        res.redirect('https://open.spotify.com/playlist/SEU_PLAYLIST_AQUI');
    } catch (err) {
        console.error('Erro ao contar redirecionamento:', err);
        res.status(500).send('Erro ao redirecionar.');
    }
});

app.use(async (req, res, next) => {
    try {
        let visit = await Visit.findOne();
        if (!visit) {
            visit = new Visit({ count: 1 });
        } else {
            visit.count += 1;
        }
        await visit.save();
    } catch (err) {
        console.error('Erro ao registrar visita:', err);
    }
    next();
});

app.get("/", (req, res) => {
    res.render('index')
});

app.use(async (req, res, next) => {
  try {
    let visit = await Visit.findOne();
    if (!visit) {
      visit = new Visit({ count: 1 });
    } else {
      visit.count += 1;
    }
    await visit.save();
  } catch (err) {
    console.error('Erro ao registrar visita:', err);
  }
  next();
});

app.get("/", (req, res) => {
    res.render('index')
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
