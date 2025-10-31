import { CreateUserDto } from "../types/user.js";

// Validate CreateUserDto
export const validateCreateUserDto = (data: unknown): data is CreateUserDto => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const dto = data as Record<string, unknown>;

  if (typeof dto.username !== 'string' || dto.username.trim() === '') {
    return false;
  }

  if (typeof dto.age !== 'number' || dto.age < 0) {
    return false;
  }

  if (!Array.isArray(dto.hobbies)) {
    return false;
  }

  if (!dto.hobbies.every((hobby) => typeof hobby === 'string')) {
    return false;
  }

  return true;
}
