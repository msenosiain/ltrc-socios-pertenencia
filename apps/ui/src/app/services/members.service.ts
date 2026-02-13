import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Member, CreateMemberDto } from '@socios-pertenencia/shared';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private readonly apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  create(member: CreateMemberDto, documentImage?: File): Observable<Member> {
    const formData = new FormData();

    // Member data
    formData.append('firstName', member.firstName);
    formData.append('lastName', member.lastName);
    formData.append('birthDate', member.birthDate);
    formData.append('documentNumber', member.documentNumber);

    // Card holder data
    formData.append('cardHolderFirstName', member.cardHolderFirstName);
    formData.append('cardHolderLastName', member.cardHolderLastName);
    formData.append('cardHolderDocumentNumber', member.cardHolderDocumentNumber);
    formData.append('creditCardNumber', member.creditCardNumber);
    formData.append('creditCardExpirationDate', member.creditCardExpirationDate);

    // Document image
    if (documentImage) {
      formData.append('documentImage', documentImage);
    }

    return this.http.post<Member>(this.apiUrl, formData);
  }

  getAll(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
  }

  getById(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }
}

