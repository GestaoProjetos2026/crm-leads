/**
 * LeadStagnatedEvent — fired when a lead exceeds the configured SLA
 * threshold in a pipeline stage.
 *
 * Consumers can listen to this event to trigger automations such as:
 * - Sending email/Slack notifications
 * - Triggering webhooks
 * - Reassigning the lead to another sales rep
 */
export class LeadStagnatedEvent {
  static readonly EVENT_NAME = 'lead.stagnated' as const;

  constructor(
    /** Tenant that owns this lead */
    public readonly tenantId: number,

    /** The stagnant opportunity */
    public readonly opportunityId: number,

    /** The lead stuck in the pipeline */
    public readonly leadId: number,

    /** Stage where stagnation was detected */
    public readonly stageId: number,

    /** Human-readable stage name */
    public readonly stageName: string,

    /** How many hours the lead has been stuck */
    public readonly hoursStagnant: number,

    /** SLA threshold configured for this stage */
    public readonly slaMaxHours: number,

    /** Revenue at risk (nullable) */
    public readonly value: number | null,

    /** When the stagnation was detected */
    public readonly detectedAt: Date,
  ) {}
}
