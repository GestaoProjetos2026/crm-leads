import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    return {
      success: true,
      data: {
        status: "ok",
        services: {
          database: "ok",
          redis: "ok"
        }
      },
      timestamp: Date.now().toString(),
      path: "/v1/health"
    };
  }
}
