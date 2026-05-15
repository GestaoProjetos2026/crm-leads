import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LeadStagnatedEvent } from '../events/lead-stagnated.event';

/**
 * LeadStagnatedListener — handles the lead.stagnated event.
 *
 * This is the extension point for future automations.
 * Add your custom logic here (email, webhook, Slack, reassignment, etc.).
 */
@Injectable()
export class LeadStagnatedListener {
  private readonly logger = new Logger(LeadStagnatedListener.name);

  @OnEvent(LeadStagnatedEvent.EVENT_NAME)
  handleLeadStagnated(event: LeadStagnatedEvent): void {
    this.logger.log(
      `[EVENT] ${LeadStagnatedEvent.EVENT_NAME} — ` +
        `Opportunity #${event.opportunityId} (Lead #${event.leadId}) ` +
        `stuck ${event.hoursStagnant}h in "${event.stageName}" ` +
        `(SLA: ${event.slaMaxHours}h) | Tenant: ${event.tenantId}` +
        (event.value
          ? ` | Value at risk: R$ ${Number(event.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : ''),
    );

    // TODO: Add your automation logic here
    // Examples:
    // - await this.emailService.notifyManager(event);
    // - await this.webhookService.fire('lead.stagnated', event);
    // - await this.slackService.sendAlert(event);
  }
}
