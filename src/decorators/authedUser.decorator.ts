import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
