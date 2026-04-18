import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class LoginResponseDto {
    access_token: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<LoginResponseDto>;
}
export {};
