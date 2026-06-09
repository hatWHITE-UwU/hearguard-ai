import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiEnvelope } from '../../shared/models/auth.model';
import type { NoiseRecord, NoiseStats, PaginatedList } from '../../shared/models/api.model';

@Injectable({ providedIn: 'root' })
export class NoiseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/noise`;

  getList(limit = 50): Observable<ApiEnvelope<PaginatedList<NoiseRecord>>> {
    return this.http.get<ApiEnvelope<PaginatedList<NoiseRecord>>>(
      `${this.base}?limit=${limit}`,
    );
  }

  getStatsToday(): Observable<ApiEnvelope<NoiseStats>> {
    return this.http.get<ApiEnvelope<NoiseStats>>(`${this.base}/stats/today`);
  }
}
