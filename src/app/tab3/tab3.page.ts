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

  seccion = 'productos'; // Controla qué vista vemos
  filtroFecha = 'hoy';   // Filtro para gastos

  productos: any[] = [];
  gastos: any[] = [];

  // Variable vital para evitar el error 400
  categoriaIdDefault: number | null = null;

  constructor(
    private finanzasService: FinanzasService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.cargarDatos();
    this.buscarCategoriaDefault();
  }

  // --- LOGICA DE UI ---
  cambiarSeccion() {
    this.cargarDatos();
  }

  cambiarFiltroFecha(event: any) {
    this.filtroFecha = event.detail.value;
    this.cargarDatos();
  }

  cargarDatos() {
    if (this.seccion === 'productos') {
      this.finanzasService.getProductos().subscribe((res: any) => this.productos = res);
    } else {
      this.cargarGastosConFiltro();
    }
  }

  // --- 1. GESTIÓN DE CATEGORÍAS (FIX ERROR 400) ---

  buscarCategoriaDefault() {
    this.finanzasService.getCategorias().subscribe((res: any) => {
      if (res.length > 0) {
        this.categoriaIdDefault = res[0].id;
      } else {
        // Si no hay, creamos una "General" automáticamente
        this.finanzasService.crearCategoria('General', 'GASTO').subscribe((cat: any) => {
          this.categoriaIdDefault = cat.id;
        });
      }
    });
  }

  async abrirAlertCategoria() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Categoría',
      inputs: [{ name: 'nombre', type: 'text', placeholder: 'Ej. Insumos, Renta' }],
      buttons: ['Cancelar', {
        text: 'Crear',
        handler: (data) => {
          if (data.nombre) {
            this.finanzasService.crearCategoria(data.nombre, 'GASTO').subscribe(() => {
              this.presentToast('Categoría creada');
              this.buscarCategoriaDefault();
            });
          }
        }
      }]
    });
    await alert.present();
  }

  // --- 2. GESTIÓN DE PRODUCTOS ---

  async abrirAlertProducto() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo Platillo',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre' },
        { name: 'precio', type: 'number', placeholder: 'Precio $' }
      ],
      buttons: ['Cancelar', {
        text: 'Guardar',
        handler: (data) => {
          if (data.nombre && data.precio) this.crearProducto(data.nombre, data.precio);
        }
      }]
    });
    await alert.present();
  }

  async abrirAlertEditarProducto(p: any) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Producto',
      inputs: [
        { name: 'nombre', type: 'text', value: p.nombre, placeholder: 'Nombre' },
        { name: 'precio', type: 'number', value: p.precio_venta, placeholder: 'Precio $' }
      ],
      buttons: ['Cancelar', {
        text: 'Actualizar',
        handler: (data) => {
          if (data.nombre && data.precio) this.actualizarProducto(p.id, data.nombre, data.precio);
        }
      }]
    });
    await alert.present();
  }

  crearProducto(nombre: string, precio: string) {
    const nuevo = { nombre: nombre, precio_venta: precio, categoria: 1 };
    this.finanzasService.crearProducto(nuevo).subscribe({
      next: () => { this.presentToast('Producto creado'); this.cargarDatos(); },
      error: () => this.presentToast('Error al crear', 'danger')
    });
  }

  actualizarProducto(id: number, nombre: string, precio: string) {
    const prod = { nombre, precio_venta: precio };
    this.finanzasService.actualizarProducto(id, prod).subscribe({
      next: () => { this.presentToast('Actualizado'); this.cargarDatos(); },
      error: () => this.presentToast('Error al actualizar', 'danger')
    });
  }

  eliminarProducto(p: any) {
    this.finanzasService.borrarProducto(p.id).subscribe({
      next: () => { this.presentToast('Eliminado'); this.cargarDatos(); },
      error: () => this.presentToast('No se puede borrar (tiene ventas)', 'warning')
    });
  }

  // --- 3. GESTIÓN DE GASTOS ---

  cargarGastosConFiltro() {
    const hoy = new Date();
    const formatDate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const dateLocal = new Date(date.getTime() - (offset * 60 * 1000));
      return dateLocal.toISOString().split('T')[0];
    };

    let inicio = '', fin = '';

    if (this.filtroFecha === 'hoy') {
      inicio = fin = formatDate(hoy);
    } else if (this.filtroFecha === 'semana') {
      const primerDia = new Date(hoy); primerDia.setDate(hoy.getDate() - hoy.getDay() + 1);
      const ultimoDia = new Date(hoy); ultimoDia.setDate(hoy.getDate() - hoy.getDay() + 7);
      inicio = formatDate(primerDia); fin = formatDate(ultimoDia);
    } else if (this.filtroFecha === 'mes') {
      inicio = formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      fin = formatDate(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
    }

    this.finanzasService.getMovimientos(inicio, fin).subscribe((res: any) => {
      this.gastos = res.filter((m: any) => m.es_gasto === true || m.es_gasto === 1);
    });
  }

  async abrirAlertGasto() {
    const alert = await this.alertCtrl.create({
      header: 'Registrar Gasto',
      inputs: [
        { name: 'descripcion', type: 'text', placeholder: 'Descripción' },
        { name: 'monto', type: 'number', placeholder: 'Monto $' }
      ],
      buttons: ['Cancelar', {
        text: 'Registrar',
        handler: (data) => {
          if (data.descripcion && data.monto) this.crearGasto(data.descripcion, data.monto);
        }
      }]
    });
    await alert.present();
  }

  crearGasto(desc: string, monto: string) {
    if (!this.categoriaIdDefault) {
      this.presentToast('Cargando categorías... intenta de nuevo', 'warning');
      this.buscarCategoriaDefault();
      return;
    }

    const gasto = {
      descripcion: desc,
      monto: parseFloat(monto),
      es_gasto: true,
      categoria: this.categoriaIdDefault // Usamos el ID real obtenido de la BD
    };

    this.finanzasService.crearMovimiento(gasto).subscribe({
      next: () => { this.presentToast('Gasto registrado'); this.cargarDatos(); },
      error: (e) => { console.error(e); this.presentToast('Error al registrar', 'danger'); }
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
