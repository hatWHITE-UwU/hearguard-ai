import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EvaluationService } from './evaluation.service';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/api/evaluations`;

describe('EvaluationService', () => {
  let service: EvaluationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EvaluationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getList() calls GET /api/evaluations?limit=50', () => {
    service.getList().subscribe();
    const req = httpMock.expectOne(`${BASE}?limit=50`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { items: [], total: 0 } });
  });

  it('getLatest() calls GET /api/evaluations?limit=1', () => {
    service.getLatest().subscribe();
    const req = httpMock.expectOne(`${BASE}?limit=1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { items: [], total: 0 } });
  });

  it('getById() calls GET /api/evaluations/:id', () => {
    service.getById('abc123').subscribe();
    const req = httpMock.expectOne(`${BASE}/abc123`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { evaluation: null } });
  });

  it('create() calls POST /api/evaluations', () => {
    const body = { overallScore: 8 };
    service.create(body).subscribe();
    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: { evaluation: null } });
  });
});
