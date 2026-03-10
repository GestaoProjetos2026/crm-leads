import { URL } from 'url';

export class Router {
  constructor(stageController, auditController) {
    this.stageController = stageController;
    this.auditController = auditController;
  }

  async handleRequest(req, res) {
    try {
      // TODO: Very basic body parser for demonstration
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        if (body) {
          req.body = JSON.parse(body);
        } else {
          req.body = {};
        }

        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;
        
        req.query = Object.fromEntries(parsedUrl.searchParams);

        // TODO: Simple router
        if (req.method === 'POST' && pathname.match(/^\/v1\/config\/stages\/(.+)\/sla$/)) {
          const match = pathname.match(/^\/v1\/config\/stages\/(.+)\/sla$/);
          req.params = { id: match[1] };
          return this.stageController.configureSla(req, res);
        } 
        
        if (req.method === 'GET' && pathname === '/v1/audit/bottlenecks') {
          return this.auditController.getBottlenecks(req, res);
        }

        if (req.method === 'GET' && pathname === '/v1/audit/conversion-latency') {
          return this.auditController.getConversionLatency(req, res);
        }

        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not Found');
      });

    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
}
