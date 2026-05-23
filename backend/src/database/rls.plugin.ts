import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';
import { tenantContext } from '../common/context/tenant.context';

/**
 * Patch global no QueryRunner do TypeORM para suportar o RLS do Postgres de forma transparente.
 * Em vez de depender do evento beforeTransactionStart, injetamos a variável de sessão 
 * na conexão do banco exatamente ANTES de qualquer query, limpando-a depois.
 */
export function applyRLSPatch() {
  const originalQuery = PostgresQueryRunner.prototype.query;

  PostgresQueryRunner.prototype.query = async function (
    query: string,
    parameters?: any[],
    useStructuredResult?: boolean,
  ) {
    const tenantId = tenantContext.getStore();
    const isSetOrReset = query.trim().toUpperCase().startsWith('SET ') || 
                         query.trim().toUpperCase().startsWith('RESET ');

    // Se houver um tenantId no contexto E a query não for de configuração interna
    if (tenantId && !isSetOrReset) {
      // Configura o RLS na sessão da conexão atual ANTES da consulta original
      await originalQuery.call(this, `SET app.current_tenant_id = ${tenantId}`, [], false);

      try {
        // Executa a query original, agora seguramente sob o escopo do RLS
        return await originalQuery.call(this, query, parameters, useStructuredResult);
      } finally {
        // GARANTIA CRÍTICA: Reseta o escopo assim que a query termina, 
        // impedindo que a conexão polua o pool e vaze dados.
        await originalQuery.call(this, `RESET app.current_tenant_id`, [], false);
      }
    }

    // Comportamento normal se não houver contexto de tenant
    return originalQuery.call(this, query, parameters, useStructuredResult);
  };
}
