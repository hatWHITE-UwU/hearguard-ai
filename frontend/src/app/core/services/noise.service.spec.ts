import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NoiseService } from './noise.service';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/api/noise`;

describe('NoiseService', () => {
  let service: NoiseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NoiseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getList() calls GET /api/noise?limit=50', () => {
    service.getList().subscribe();
    const req = httpMock.expectOne(`${BASE}?limit=50`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { items: [], total: 0 } });
  });

  it('getList(10) calls GET /api/noise?limit=10', () => {
    service.getList(10).subscribe();
    const req = httpMock.expectOne(`${BASE}?limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { items: [], total: 0 } });
  });

  it('getStatsToday() calls GET /api/noise/stats/today', () => {
    service.getStatsToday().subscribe();
    const req = httpMock.expectOne(`${BASE}/stats/today`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { avgDb: 0, maxDb: 0, count: 0, exposureMinutes: 0 } });
  });
});
