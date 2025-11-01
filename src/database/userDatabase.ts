import { v4 as uuidV4 } from 'uuid';
import { User, CreateUserDto } from '../types/user.js';

export class UserDatabase {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  create(userData: CreateUserDto): User {
    const user: User = {
      id: uuidV4(),
      ...userData,
    };
    this.users.set(user.id, user);
    return user;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  update(id: string, userData: Partial<CreateUserDto>): User | null {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    const updatedUser: User = {
      ...user,
      ...userData,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }

  // Clear is needed for testing
  clear(): void {
    this.users.clear();
  }
}

export const userDatabase = new UserDatabase();
