import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {

  // Asegúrate que esta IP sea la correcta
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper para poner el Token automáticamente
  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Token ${token}`
      })
    };
  }

  // --- TAB 1: DASHBOARD ---

  getVentas(startDate: string = '', endDate: string = ''): Observable<any> {
    let params = new HttpParams();
    if (startDate && endDate) {
      params = params.set('start_date', startDate);
      params = params.set('end_date', endDate);
    }
    return this.http.get(`${this.apiUrl}/ventas/historial/`, { headers: this.getHeaders().headers, params });
  }

  getMovimientos(startDate: string = '', endDate: string = ''): Observable<any> {
    let params = new HttpParams();
    if (startDate && endDate) {
      params = params.set('start_date', startDate);
      params = params.set('end_date', endDate);
    }
    return this.http.get(`${this.apiUrl}/movimientos/`, { headers: this.getHeaders().headers, params });
  }

  // --- TAB 2: PUNTO DE VENTA  ---

  getProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/`, this.getHeaders());
  }

  registrarVenta(venta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas/nueva/`, venta, this.getHeaders());
  }

  // --- TAB 3: ADMINISTRACIÓN ---

  crearProducto(producto: any): Observable<any> {

    const formData = new FormData();
    formData.append('nombre', producto.nombre);
    formData.append('precio_venta', producto.precio_venta);
    formData.append('categoria', '1'); // Default

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Token ${token}` });

    return this.http.post(`${this.apiUrl}/productos/`, formData, { headers });
  }

  borrarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}/`, this.getHeaders());
  }

  crearMovimiento(gasto: any): Observable<any> {
    // Los gastos sí van en JSON normal
    return this.http.post(`${this.apiUrl}/movimientos/`, gasto, this.getHeaders());
  }

  borrarMovimiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/movimientos/${id}/`, this.getHeaders());
  }
}
