import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiEnvelope } from '../../shared/models/auth.model';
import type { Device } from '../../shared/models/api.model';

export interface DeviceCreateRequest {
  name: string;
  type: 'arduino' | 'esp32' | 'other';
  hardwareId?: string;
}

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/devices`;

  getList(): Observable<ApiEnvelope<{ items: Device[] }>> {
    return this.http.get<ApiEnvelope<{ items: Device[] }>>(this.base);
  }

  create(body: DeviceCreateRequest): Observable<ApiEnvelope<{ device: Device; apiKey: string }>> {
    return this.http.post<ApiEnvelope<{ device: Device; apiKey: string }>>(this.base, body);
  }
}
