'use strict';
/**
 * Puente serial → backend HearGuard
 *
 * Lee JSON del puerto serie del Arduino Uno/Nano y lo reenvía al backend.
 * Uso: DEVICE_KEY=hg_xxx PORT=COM3 node serial_bridge.js
 *
 * Instalar: npm install serialport node-fetch
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const SERIAL_PORT = process.env.PORT || 'COM3';         // Windows: COM3, Linux: /dev/ttyUSB0
const BAUD_RATE   = 115200;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api/noise/iot';
const DEVICE_KEY  = process.env.DEVICE_KEY  || '';

if (!DEVICE_KEY) {
  console.error('[bridge] ERROR: falta DEVICE_KEY');
  process.exit(1);
}

const port   = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

console.log(`[bridge] leyendo ${SERIAL_PORT} @ ${BAUD_RATE} bps → ${BACKEND_URL}`);

parser.on('data', async (line) => {
  line = line.trim();
  if (!line.startsWith('{')) return;
  let payload;
  try {
    payload = JSON.parse(line);
  } catch {
    return;
  }

  try {
    const { default: fetch } = await import('node-fetch');
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Key': DEVICE_KEY,
      },
      body: JSON.stringify(payload),
    });
    console.log(`[bridge] ${payload.dbLevel} dB → HTTP ${res.status}`);
  } catch (err) {
    console.error(`[bridge] fallo HTTP: ${err.message}`);
  }
});

port.on('error', (err) => console.error(`[serial] ${err.message}`));
