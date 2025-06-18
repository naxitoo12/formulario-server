const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Crear tabla si no existe
const crearTabla = `
CREATE TABLE IF NOT EXISTS formulario (
  id SERIAL PRIMARY KEY,
  empresa TEXT,
  fecha DATE,
  ruta INTEGER,
  puntos INTEGER,
  positivas INTEGER,
  negativas INTEGER,
  peoneta TEXT,
  observaciones TEXT
);
`;

pool.query(crearTabla)
  .then(() => console.log("✅ Tabla lista"))
  .catch(err => console.error("❌ Error creando tabla:", err));

// Ruta para guardar datos
app.post('/api/guardar', async (req, res) => {
  const {
    empresa,
    fecha,
    ruta,
    puntos,
    positivas,
    negativas,
    peoneta,
    observaciones
  } = req.body;

  try {
    const consulta = `
      INSERT INTO formulario 
      (empresa, fecha, ruta, puntos, positivas, negativas, peoneta, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const valores = [empresa, fecha, ruta, puntos, positivas, negativas, peoneta, observaciones];

    await pool.query(consulta, valores);
    res.status(200).json({ mensaje: "Guardado en Supabase ✅" });
  } catch (error) {
    console.error("❌ Error al guardar en Supabase:", error);
    res.status(500).json({ error: "Error al guardar" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
