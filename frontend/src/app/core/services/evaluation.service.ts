import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiEnvelope } from '../../shared/models/auth.model';
import type {
  EvaluationCreate,
  EvaluationDetail,
  EvaluationItem,
  PaginatedList,
} from '../../shared/models/api.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/evaluations`;

  getList(limit = 50): Observable<ApiEnvelope<PaginatedList<EvaluationItem>>> {
    return this.http.get<ApiEnvelope<PaginatedList<EvaluationItem>>>(
      `${this.base}?limit=${limit}`,
    );
  }

  getLatest(): Observable<ApiEnvelope<PaginatedList<EvaluationItem>>> {
    return this.getList(1);
  }

  getById(id: string): Observable<ApiEnvelope<EvaluationDetail>> {
    return this.http.get<ApiEnvelope<EvaluationDetail>>(`${this.base}/${id}`);
  }

  create(body: object): Observable<ApiEnvelope<EvaluationCreate>> {
    return this.http.post<ApiEnvelope<EvaluationCreate>>(this.base, body);
  }
}
