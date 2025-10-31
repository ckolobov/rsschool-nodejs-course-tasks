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


// Validate update data (partial CreateUserDto)
export const validateUpdateUserDto = (data: unknown): data is Partial<CreateUserDto> => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const dto = data as Record<string, unknown>;

  // Check if at least one field is provided
  if (!('username' in dto || 'age' in dto || 'hobbies' in dto)) {
    return false;
  }

  // Validate username if provided
  if ('username' in dto) {
    if (typeof dto.username !== 'string' || dto.username.trim() === '') {
      return false;
    }
  }

  // Validate age if provided
  if ('age' in dto) {
    if (typeof dto.age !== 'number' || dto.age < 0) {
      return false;
    }
  }

  // Validate hobbies if provided
  if ('hobbies' in dto) {
    if (!Array.isArray(dto.hobbies)) {
      return false;
    }
    if (!dto.hobbies.every((hobby) => typeof hobby === 'string')) {
      return false;
    }
  }

  return true;
}