import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SetupDto } from './dto/setup.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    setup(setupDto: SetupDto): Promise<{
        success: boolean;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        success: boolean;
    }>;
}
