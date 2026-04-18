"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const util_1 = require("util");
const user_entity_1 = require("./entities/user.entity");
const scrypt = (0, util_1.promisify)(crypto_1.scrypt);
let AuthService = class AuthService {
    userRepository;
    jwtService;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['tenant'],
        });
        if (!user?.passwordHash) {
            return null;
        }
        const [salt, storedHash] = user.passwordHash.split(':');
        if (!salt || !storedHash) {
            return null;
        }
        const derivedKey = (await scrypt(password, salt, 64));
        const hashedPassword = Buffer.from(storedHash, 'hex');
        if ((0, crypto_1.timingSafeEqual)(hashedPassword, derivedKey)) {
            return user;
        }
        return null;
    }
    async login(email, password) {
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.tenant?.isBlocked) {
            throw new common_1.ForbiddenException('Tenant account blocked');
        }
        const payload = {
            sub: user.id,
            tenant_id: user.tenantId,
            profile: user.profile,
            scopes: this.getScopesForProfile(user.profile),
        };
        const access_token = this.jwtService.sign(payload);
        return { access_token };
    }
    getScopesForProfile(profile) {
        switch (profile) {
            case 'director':
                return ['analytics:read', 'opportunities:write', 'users:write'];
            case 'marketing_manager':
                return ['analytics:read', 'leads:write', 'opportunities:read'];
            case 'sales_rep':
            default:
                return ['leads:read', 'opportunities:read'];
        }
    }
    async hashPassword(password) {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const derivedKey = (await scrypt(password, salt, 64));
        return `${salt}:${derivedKey.toString('hex')}`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map