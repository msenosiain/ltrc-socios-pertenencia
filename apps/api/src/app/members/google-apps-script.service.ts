import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface MemberDataForSheet {
  // Member data
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  documentImageLink: string;
  // Card holder data
  cardHolderFirstName: string;
  cardHolderLastName: string;
  cardHolderDocumentNumber: string;
  creditCardNumber: string;
  creditCardExpirationDate: string;
  createdAt: string;
}

@Injectable()
export class GoogleAppsScriptService {
  private readonly logger = new Logger(GoogleAppsScriptService.name);
  private readonly googleAppsScriptUrl: string;

  constructor() {
    this.googleAppsScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_URL || '';

    if (!this.googleAppsScriptUrl) {
      this.logger.warn(
        'GOOGLE_APPS_SCRIPT_URL not configured. Google Sheets integration disabled.',
      );
    }
  }

  /**
   * Enviar datos de un miembro a Google Sheets vía Google Apps Script
   * @param memberData Datos del miembro
   * @returns true si fue exitoso, false en caso contrario
   */
  async appendMemberToSheet(memberData: MemberDataForSheet): Promise<boolean> {
    try {
      if (!this.googleAppsScriptUrl) {
        this.logger.warn(
          'Google Apps Script URL not configured. Skipping sheet update.',
        );
        return false;
      }

      const payload = {
        // Member data
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        documentNumber: memberData.documentNumber,
        birthDate: memberData.birthDate,
        documentImageLink: memberData.documentImageLink,
        // Card holder data
        cardHolderFirstName: memberData.cardHolderFirstName,
        cardHolderLastName: memberData.cardHolderLastName,
        cardHolderDocumentNumber: memberData.cardHolderDocumentNumber,
        creditCardNumber: this.formatCreditCard(memberData.creditCardNumber),
        creditCardExpirationDate: memberData.creditCardExpirationDate,
        createdAt: memberData.createdAt,
      };

      const response = await axios.post(this.googleAppsScriptUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos de timeout
      });

      if (response.data?.success) {
        this.logger.log(
          `Member data appended to Google Sheet: ${memberData.firstName} ${memberData.lastName}`,
        );
        return true;
      } else {
        this.logger.error(
          `Error from Google Apps Script: ${response.data?.error}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error appending to Google Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // No lanzar excepción, solo registrar el error
      // La creación del miembro debe continuar aunque falle Google Sheets
      return false;
    }
  }

  /**
   * Obtener todos los miembros desde Google Sheets
   */
  async getAllMembers(): Promise<MemberDataForSheet[]> {
    try {
      if (!this.googleAppsScriptUrl) {
        return [];
      }

      const response = await axios.get(this.googleAppsScriptUrl, {
        timeout: 10000,
      });

      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      this.logger.error(
        `Error fetching members from Google Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Buscar miembro por DNI en Google Sheets
   *
   * Nota: Este método se usa en validaciones de sincronización y puede ser
   * utilizado por controladores o servicios externos para auditoría.
   *
   * @param documentNumber - Número de DNI del miembro
   * @returns Datos del miembro en Google Sheets o null si no existe
   */
  async findMemberByDocumentNumber(
    documentNumber: string,
  ): Promise<MemberDataForSheet | null> {
    try {
      if (!this.googleAppsScriptUrl) {
        return null;
      }

      const members = await this.getAllMembers();
      const member = members.find(
        (m) => m.documentNumber === documentNumber,
      );

      return member || null;
    } catch (error) {
      this.logger.error(
        `Error searching member: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Formatear número de tarjeta de crédito en segmentos de 4 dígitos
   */
  private formatCreditCard(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) {
      return cardNumber;
    }
    // Remover espacios existentes y formatear en grupos de 4
    // eslint-disable-next-line prefer-string-replace-all
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cardNumber;
  }

  /**
   * Sincronizar miembros desde Google Sheets
   * Útil para auditoría y validaciones cruzadas
   */
  async syncMembersFromSheet(): Promise<MemberDataForSheet[]> {
    return this.getAllMembers();
  }
}
