import { Component, OnInit } from '@angular/core';
import { FinanzasService } from '../../services/finanzas';
import { ModalController } from '@ionic/angular';
import { DetalleVentaPage } from '../detalle-venta/detalle-venta.page';

@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.page.html',
  styleUrls: ['./historial-ventas.page.scss'],
  standalone: false
})
export class HistorialVentasPage implements OnInit {

  ventas: any[] = [];
  filtroActual = 'mes'; // Por defecto mostramos el MES completo aquí

  constructor(
    private finanzasService: FinanzasService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.filtrarPorFecha(this.filtroActual);
  }

  cambiarFiltro(event: any) {
    this.filtroActual = event.detail.value;
    this.filtrarPorFecha(this.filtroActual);
  }

  filtrarPorFecha(tipo: string) {
    const hoy = new Date();
    let fechaInicio = '';
    let fechaFin = '';

    const formatDate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const dateLocal = new Date(date.getTime() - (offset * 60 * 1000));
      return dateLocal.toISOString().split('T')[0];
    };

    if (tipo === 'hoy') {
      fechaInicio = formatDate(hoy);
      fechaFin = formatDate(hoy);
    } else if (tipo === 'semana') {
      const primerDia = new Date(hoy);
      primerDia.setDate(hoy.getDate() - hoy.getDay() + 1);
      const ultimoDia = new Date(hoy);
      ultimoDia.setDate(hoy.getDate() - hoy.getDay() + 7);
      fechaInicio = formatDate(primerDia);
      fechaFin = formatDate(ultimoDia);
    } else if (tipo === 'mes') {
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      fechaInicio = formatDate(primerDia);
      fechaFin = formatDate(ultimoDia);
    }

    this.finanzasService.getVentas(fechaInicio, fechaFin).subscribe((res: any) => {
      this.ventas = res;
    });
  }

  async verDetalle(venta: any) {
    const modal = await this.modalCtrl.create({
      component: DetalleVentaPage,
      componentProps: { venta: venta }
    });
    return await modal.present();
  }
}
