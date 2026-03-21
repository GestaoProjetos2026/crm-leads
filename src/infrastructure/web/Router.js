import { URL } from 'url';

export class Router {
  constructor(stageController, auditController) {
    this.stageController = stageController;
    this.auditController = auditController;

/* Foi criada uma tabela de rotas para substituir vários if no código. 
Cada rota define o método HTTP, o padrão da URL (regex), o controller responsável e
a função para extrair parâmetros, tornando o roteamento mais organizado e fácil de manter.*/
    this.routes = [
      {
        method: 'POST',
        pattern: /^\/v1\/config\/stages\/([^/]+)\/sla$/,
        handler: this.stageController.configureSla.bind(this.stageController),

// Extrai o parâmetro da URL
        getParams: (match) => ({ id: match[1] })
      },
      {
        method: 'GET',
        pattern: /^\/v1\/audit\/bottlenecks$/,
        handler: this.auditController.getBottlenecks.bind(this.auditController),

// Não possui parâmetros na rota
        getParams: () => ({})
      },
      {
        method: 'GET',
        pattern: /^\/v1\/audit\/conversion-latency$/,
        handler: this.auditController.getConversionLatency.bind(this.auditController),
        getParams: () => ({})
      }
    ];
  }

/* Foi criado um método separado para ler e processar o body da requisição, convertendo JSON,
limitando o tamanho do payload e tratando erros de JSON inválido. Isso simplifica o 'handleRequest' 
e evita duplicação de lógica.*/
  async parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';

// Limite de segurança para evitar payloads gigantes
      const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

      req.on('data', chunk => {
        body += chunk.toString();

// Proteção contra payload muito grande
        if (body.length > MAX_BODY_SIZE) {
          reject(new Error('Payload too large'));
          req.destroy();
        }
      });

      req.on('end', () => {

// Caso não exista body
        if (!body) {
          return resolve({});
        }

        try {
// Verifica tipo do conteúdo
          const contentType = req.headers['content-type'] || '';

// Caso seja JSON, faz parse
          if (contentType.includes('application/json')) {
            return resolve(JSON.parse(body));
          }

// Caso não seja JSON, retorna raw
          resolve({ raw: body });

        } catch (err) {

// JSON inválido
          reject(new Error('Invalid JSON body'));
        }
      });

      req.on('error', err => reject(err));
    });
  }

  async handleRequest(req, res) {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      const pathname = parsedUrl.pathname;

// Extrai parâmetros da query
      req.query = Object.fromEntries(parsedUrl.searchParams.entries());

// Inicializa parâmetros
      req.params = {};

// Apenas métodos que podem ter body
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        req.body = await this.parseBody(req);
      } else {
        req.body = {};
      }

// SIMPLE ROUTER IMPLEMENTADO
      for (const route of this.routes) {

// Verifica método HTTP
        if (req.method !== route.method) continue;

        // Testa se a URL bate com a regex
        const match = pathname.match(route.pattern);

        if (!match) continue;

// Se encontrou: extrai parâmetros e chama o controller
        req.params = route.getParams(match);

        return route.handler(req, res);
      }


// Caso nenhuma rota seja encontrada
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not Found' }));

    } catch (err) {

      console.error('Router error:', err.message);


// Tratamento de erros comuns
      if (err.message === 'Invalid JSON body') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }

      if (err.message === 'Payload too large') {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Payload too large' }));
      }

// Erro genérico
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
}