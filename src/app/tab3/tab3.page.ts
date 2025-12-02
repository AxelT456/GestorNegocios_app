import { Component } from '@angular/core';
import { FinanzasService } from '../services/finanzas';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page {

  seccion = 'productos';
  filtroFecha = 'hoy'; // Nuevo filtro para gastos

  productos: any[] = [];
  gastos: any[] = [];

  constructor(
    private finanzasService: FinanzasService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.cargarDatos();
  }

  // Se ejecuta al cambiar entre "Menú" y "Gastos"
  cambiarSeccion() {
    this.cargarDatos();
  }

  // Se ejecuta al cambiar "Hoy/Semana/Mes"
  cambiarFiltroFecha(event: any) {
    this.filtroFecha = event.detail.value;
    this.cargarDatos();
  }

  cargarDatos() {
    if (this.seccion === 'productos') {
      // Los productos no se filtran por fecha, se traen todos
      this.finanzasService.getProductos().subscribe((res: any) => this.productos = res);
    } else {
      // Los gastos SÍ se filtran
      this.cargarGastosConFiltro();
    }
  }

  cargarGastosConFiltro() {
    const hoy = new Date();
    let fechaInicio = '';
    let fechaFin = '';

    // Misma lógica de corrección de zona horaria que en Tab 1
    const formatDate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const dateLocal = new Date(date.getTime() - (offset * 60 * 1000));
      return dateLocal.toISOString().split('T')[0];
    };

    if (this.filtroFecha === 'hoy') {
      fechaInicio = formatDate(hoy);
      fechaFin = formatDate(hoy);
    } else if (this.filtroFecha === 'semana') {
      const primerDia = new Date(hoy);
      primerDia.setDate(hoy.getDate() - hoy.getDay() + 1);
      const ultimoDia = new Date(hoy);
      ultimoDia.setDate(hoy.getDate() - hoy.getDay() + 7);
      fechaInicio = formatDate(primerDia);
      fechaFin = formatDate(ultimoDia);
    } else if (this.filtroFecha === 'mes') {
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      fechaInicio = formatDate(primerDia);
      fechaFin = formatDate(ultimoDia);
    }

    this.finanzasService.getMovimientos(fechaInicio, fechaFin).subscribe((res: any) => {
      // Filtramos solo los que son gastos reales
      this.gastos = res.filter((m: any) => m.es_gasto === true || m.es_gasto === 1);
    });
  }

  // --- RESTO DE FUNCIONES (CREAR/BORRAR) IGUAL QUE ANTES ---

  async abrirAlertProducto() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo Platillo',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Ej. Hamburguesa Doble' },
        { name: 'precio', type: 'number', placeholder: 'Precio $' }
      ],
      buttons: [
        'Cancelar',
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.nombre && data.precio) this.crearProducto(data.nombre, data.precio);
          }
        }
      ]
    });
    await alert.present();
  }

  crearProducto(nombre: string, precio: string) {
    const nuevoProducto = { nombre: nombre, precio_venta: precio, categoria: 1 };
    this.finanzasService.crearProducto(nuevoProducto).subscribe(() => {
      this.presentToast('Producto agregado');
      this.cargarDatos();
    });
  }

  eliminarProducto(p: any) {
    this.finanzasService.borrarProducto(p.id).subscribe({
        next: () => {
            this.presentToast('Producto eliminado');
            this.cargarDatos();
        },
        error: () => this.presentToast('No se puede borrar (tiene ventas)', 'warning')
    });
  }

  async abrirAlertGasto() {
    const alert = await this.alertCtrl.create({
      header: 'Registrar Gasto',
      inputs: [
        { name: 'descripcion', type: 'text', placeholder: 'Ej. Gas, Servilletas' },
        { name: 'monto', type: 'number', placeholder: 'Monto $' }
      ],
      buttons: [
        'Cancelar',
        {
          text: 'Registrar',
          handler: (data) => {
            if (data.descripcion && data.monto) this.crearGasto(data.descripcion, data.monto);
          }
        }
      ]
    });
    await alert.present();
  }

  crearGasto(desc: string, monto: string) {
    const nuevoGasto = { descripcion: desc, monto: parseFloat(monto), es_gasto: true, categoria: 1 };
    this.finanzasService.crearMovimiento(nuevoGasto).subscribe(() => {
      this.presentToast('Gasto registrado');
      this.cargarDatos();
    });
  }

  eliminarGasto(g: any) {
    this.finanzasService.borrarMovimiento(g.id).subscribe(() => {
      this.presentToast('Gasto eliminado');
      this.cargarDatos();
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 1500, color, position: 'bottom' });
    toast.present();
  }
}
