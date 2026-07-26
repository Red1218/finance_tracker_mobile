import { UserId } from '../value-objects/UserId';
import { EmailAddress } from '../value-objects/EmailAddress';
import { AuthStatus } from '../value-objects/AuthStatus';
import { AuthDomainError } from '../errors/AuthDomainError';

export interface UserSessionProps {
  userId: UserId;
  email: EmailAddress;
  status: AuthStatus;
  createdAt?: Date;
  expiresAt: Date;
}

export class UserSession {
  public readonly userId: UserId | null;
  public readonly email: EmailAddress | null;
  public readonly status: AuthStatus;
  public readonly createdAt: Date;
  public readonly expiresAt: Date | null;

  constructor(props: Partial<UserSessionProps> & { status: AuthStatus }) {
    this.status = props.status;
    this.createdAt = props.createdAt ?? new Date();

    if (props.status === AuthStatus.AUTHENTICATED || props.status === AuthStatus.EXPIRED) {
      if (!props.userId) {
        throw new AuthDomainError('INVALID_USER_ID', 'Authenticated session must have a valid UserId.');
      }
      if (!props.email) {
        throw new AuthDomainError('INVALID_EMAIL', 'Authenticated session must have a valid EmailAddress.');
      }
      if (!props.expiresAt) {
        throw new AuthDomainError('EXPIRED_SESSION', 'Authenticated session must specify an expiration date.');
      }
      this.userId = props.userId;
      this.email = props.email;
      this.expiresAt = props.expiresAt;
    } else {
      this.userId = props.userId ?? null;
      this.email = props.email ?? null;
      this.expiresAt = props.expiresAt ?? null;
    }

    Object.freeze(this);
  }

  public get isAuthenticated(): boolean {
    return this.status === AuthStatus.AUTHENTICATED && !this.isExpired();
  }

  public isExpired(currentDate: Date = new Date()): boolean {
    if (!this.expiresAt) return false;
    return currentDate.getTime() >= this.expiresAt.getTime();
  }

  public static createAuthenticated(props: {
    userId: UserId;
    email: EmailAddress;
    expiresAt: Date;
    createdAt?: Date;
  }): UserSession {
    return new UserSession({
      userId: props.userId,
      email: props.email,
      status: AuthStatus.AUTHENTICATED,
      createdAt: props.createdAt,
      expiresAt: props.expiresAt,
    });
  }

  public static createUnauthenticated(): UserSession {
    return new UserSession({
      userId: undefined,
      email: undefined,
      status: AuthStatus.UNAUTHENTICATED,
      expiresAt: undefined,
    });
  }

  public refresh(newExpiresAt: Date, currentDate: Date = new Date()): UserSession {
    if (this.status === AuthStatus.UNAUTHENTICATED) {
      throw new AuthDomainError('UNAUTHENTICATED_ACCESS', 'Cannot refresh an unauthenticated session.');
    }
    if (this.isExpired(currentDate)) {
      throw new AuthDomainError(
        'EXPIRED_SESSION',
        'Expired session cannot transition back to authenticated without re-authentication.'
      );
    }
    if (newExpiresAt.getTime() <= currentDate.getTime()) {
      throw new AuthDomainError('EXPIRED_SESSION', 'New expiration date must be in the future.');
    }

    return new UserSession({
      userId: this.userId!,
      email: this.email!,
      status: AuthStatus.AUTHENTICATED,
      createdAt: this.createdAt,
      expiresAt: newExpiresAt,
    });
  }

  public invalidate(): UserSession {
    return new UserSession({
      userId: null as any,
      email: null as any,
      status: AuthStatus.UNAUTHENTICATED,
      expiresAt: null as any,
    });
  }
}
