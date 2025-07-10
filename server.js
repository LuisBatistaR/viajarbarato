require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let amadeusToken = null;
let tokenExpiry = null;

async function getAmadeusToken() {
  if (amadeusToken && tokenExpiry && Date.now() < tokenExpiry) {
    return amadeusToken;
  }
  const response = await axios.post(
    'https://test.api.amadeus.com/v1/security/oauth2/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  amadeusToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return amadeusToken;
}

app.post('/api/vuelos', async (req, res) => {
  try {
    const token = await getAmadeusToken();
    const { origen, destino, fecha, adultos, clase, escalas } = req.body;
    const params = {
      originLocationCode: origen,
      destinationLocationCode: destino,
      departureDate: fecha,
      adults,
      travelClass: clase,
      nonStop: escalas === 'directo',
      currencyCode: 'EUR',
      max: 10
    };
    const response = await axios.get(
      'https://test.api.amadeus.com/v2/shopping/flight-offers',
      {
        headers: { Authorization: `Bearer ${token}` },
        params
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar vuelos', details: err.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});
