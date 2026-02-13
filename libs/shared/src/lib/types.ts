/**
 * Member (Socio) - Main entity
 */
export interface Member {
  _id: string;

  // Member data
  firstName: string;
  lastName: string;
  birthDate: string;
  documentNumber: string;

  // Card holder data
  cardHolderFirstName: string;
  cardHolderLastName: string;
  cardHolderDocumentNumber: string;
  creditCardNumber: string;
  creditCardExpirationDate: string;

  // Document image
  documentImageFileId?: string;
  documentImageFileName?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new member
 */
export interface CreateMemberDto {
  // Member data
  firstName: string;
  lastName: string;
  birthDate: string;
  documentNumber: string;

  // Card holder data
  cardHolderFirstName: string;
  cardHolderLastName: string;
  cardHolderDocumentNumber: string;
  creditCardNumber: string;
  creditCardExpirationDate: string;
}

/**
 * DTO for updating a member (all fields optional)
 */
export type UpdateMemberDto = Partial<CreateMemberDto>;

/**
 * API response for member operations
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptimeSeconds: number;
}

