import { AsyncLocalStorage } from 'async_hooks';

// Essa é a nossa ponte. Ela guarda o tenant_id da requisição atual 
// de forma segura e isolada (mesmo que mil pessoas acessem ao mesmo tempo).
export const tenantContext = new AsyncLocalStorage<number>();