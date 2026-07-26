import { UserSession } from '../../domain';

export interface AuthSessionDTO {
  userId: string | null;
  email: string | null;
  status: string;
  expiresAt: string | null;
  isAuthenticated: boolean;
}

export class AuthSessionMapper {
  public static toDTO(session: UserSession): AuthSessionDTO {
    return {
      userId: session.userId?.value ?? null,
      email: session.email?.value ?? null,
      status: session.status,
      expiresAt: session.expiresAt?.toISOString() ?? null,
      isAuthenticated: session.isAuthenticated,
    };
  }
}
