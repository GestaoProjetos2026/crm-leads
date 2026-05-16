import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Available Endpoints:`);
  console.log(`- POST /v1/config/stages/:id/sla`);
  console.log(`- GET /v1/audit/bottlenecks?companyId=${companyId}`);
  console.log(`- GET /v1/audit/conversion-latency?companyId=${companyId}`);
  console.log(`- POST /v1/leads/ingest (Header obrigatório: x-api-key)`);
});
}

bootstrap().catch(console.error);