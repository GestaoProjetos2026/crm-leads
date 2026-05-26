"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const core_1 = require("@nestjs/core");
const core_2 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_config_1 = __importDefault(require("./config/database.config"));
const redis_config_1 = __importDefault(require("./config/redis.config"));
const fiscal_config_1 = __importDefault(require("./config/fiscal.config"));
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const auth_module_1 = require("./modules/auth/auth.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const leads_module_1 = require("./modules/leads/leads.module");
const opportunities_module_1 = require("./modules/opportunities/opportunities.module");
const audit_module_1 = require("./modules/audit/audit.module");
const stages_module_1 = require("./modules/stages/stages.module");
const campaigns_module_1 = require("./modules/campaigns/campaigns.module");
const worker_module_1 = require("./modules/worker/worker.module");
const fiscal_module_1 = require("./modules/fiscal/fiscal.module");
const lead_entity_1 = require("./modules/leads/entities/lead.entity");
const opportunity_entity_1 = require("./modules/opportunities/entities/opportunity.entity");
const tenant_entity_1 = require("./modules/tenants/entities/tenant.entity");
const audit_log_entity_1 = require("./modules/leads/entities/audit-log.entity");
const lead_status_history_entity_1 = require("./modules/leads/entities/lead-status-history.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, redis_config_1.default, fiscal_config_1.default],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                entities: [tenant_entity_1.Tenant, lead_entity_1.Lead, opportunity_entity_1.Opportunity, audit_log_entity_1.AuditLog, lead_status_history_entity_1.LeadStatusHistory],
                useFactory: (config) => config.get('database'),
            }),
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            leads_module_1.LeadsModule,
            opportunities_module_1.OpportunitiesModule,
            audit_module_1.AuditModule,
            stages_module_1.StagesModule,
            campaigns_module_1.CampaignsModule,
            fiscal_module_1.FiscalModule,
            worker_module_1.WorkerModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            core_2.Reflector,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map