import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isDevFlag = process.argv.includes('--dev');
const distPath = path.resolve(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory store for availability & contact inquiries
const inquiries = [];

// ===================== API ROUTES =====================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Sítio Banguê Eventos, Hospedagem e Ecoturismo',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/site-info', (_req, res) => {
  res.json({
    name: 'Sítio Banguê Eventos e Ecoturismo',
    location: {
      street: 'Rua Oscár Steiner, 486',
      district: 'Aldeia dos Camarás (Km 3,5)',
      city: 'Camaragibe',
      state: 'PE',
      postalCode: '54789-205',
      areaHectares: 18,
      apaHectares: 31634,
    },
    contact: {
      phone: '(81) 99781-8700',
      whatsappNumber: '5581997818700',
      instagram: 'https://www.instagram.com/sitiobangue.ecoturismo/',
      instagramHandle: '@sitiobangue.ecoturismo',
    },
  });
});

app.get('/api/inquiries', (_req, res) => {
  res.json({
    count: inquiries.length,
    items: inquiries.slice(-20).reverse(),
  });
});

app.post('/api/inquiries', (req, res) => {
  const {
    date,
    checkOutDate,
    guests = '2',
    category = 'Eco Day Use & Lazer',
    name = '',
    phone = '',
    notes = '',
  } = req.body || {};

  if (!date) {
    return res.status(400).json({
      error: 'Por favor, informe a data desejada para a visita ou reserva.',
    });
  }

  const protocol = `SB-${Date.now().toString().slice(-6)}`;
  const entry = {
    id: protocol,
    date,
    checkOutDate: checkOutDate || null,
    guests: String(guests),
    category,
    name: name.trim(),
    phone: phone.trim(),
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
  };

  inquiries.push(entry);

  const formattedDate = date.split('-').reverse().join('/');
  const formattedCheckOut = checkOutDate
    ? ` até ${checkOutDate.split('-').reverse().join('/')}`
    : '';

  const messageParts = [
    `Olá! Gostaria de consultar a disponibilidade no Sítio Banguê.`,
    `• Modalidade: ${category}`,
    `• Data: ${formattedDate}${formattedCheckOut}`,
    `• Quantidade de pessoas: ${guests}`,
  ];

  if (name.trim()) messageParts.push(`• Nome: ${name.trim()}`);
  if (phone.trim()) messageParts.push(`• Telefone: ${phone.trim()}`);
  if (notes.trim()) messageParts.push(`• Observações: ${notes.trim()}`);
  messageParts.push(`• Protocolo do site: ${protocol}`);

  const whatsappUrl = `https://wa.me/5581997818700?text=${encodeURIComponent(
    messageParts.join('\n')
  )}`;

  return res.status(201).json({
    success: true,
    protocol,
    message: 'Solicitação registrada! Você pode concluir o atendimento diretamente pelo WhatsApp.',
    inquiry: entry,
    whatsappUrl,
  });
});

// ===================== FRONTEND SERVING =====================

async function startServer() {
  const shouldUseViteDev =
    isDevFlag || (process.env.NODE_ENV !== 'production' && !fs.existsSync(indexHtmlPath));

  if (shouldUseViteDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from /dist in production (Hostinger)
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        index: false,
      })
    );

    // SPA fallback for any non-API route
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        return next();
      }
      if (fs.existsSync(indexHtmlPath)) {
        return res.sendFile(indexHtmlPath);
      }
      return res
        .status(503)
        .send('Build de produção não encontrado. Execute "npm run build" antes de iniciar o servidor.');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Sítio Banguê Server] Rodando na porta ${PORT} (${
        shouldUseViteDev ? 'development' : 'production'
      })`
    );
  });
}

startServer().catch((err) => {
  console.error('Erro ao iniciar o servidor:', err);
  process.exit(1);
});
