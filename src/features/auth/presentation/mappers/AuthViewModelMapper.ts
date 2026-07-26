import { AuthSessionDTO } from '../../application';
import { AuthViewModel } from '../models/AuthViewModel';

export class AuthViewModelMapper {
  public static toViewModel(dto: AuthSessionDTO): AuthViewModel {
    return {
      isAuthenticated: dto.isAuthenticated,
      status: dto.status,
      userId: dto.userId,
      userEmail: dto.email,
      expiresAt: dto.expiresAt,
    };
  }
}
