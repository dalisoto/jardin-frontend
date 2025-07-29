// Ejemplo completo (frontend)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // getProfile(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/profile`, {  });
  // }
}