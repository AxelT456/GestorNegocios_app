import { Component } from '@angular/core';
import { FinanzasService } from '../services/finanzas';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {

  productos: any[] = [];
  productosFiltrados: any[] = [];
  carrito: any[] = [];

  totalVenta = 0;
  totalItems = 0;

  constructor(
    private finanzasService: FinanzasService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.finanzasService.getProductos().subscribe((res: any) => {
      this.productos = res;
      this.productosFiltrados = res; // Al inicio se ven todos
    });
  }

  // Buscador
  filtrarProductos(event: any) {
    const texto = event.target.value.toLowerCase();
    if (!texto) {
      this.productosFiltrados = this.productos;
      return;
    }
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(texto)
    );
  }

  agregarAlCarrito(producto: any) {
    const item = this.carrito.find(i => i.id === producto.id);

    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio_venta),
        cantidad: 1
      });
    }
    this.calcularTotales();
  }

  getCantidad(producto: any) {
    const item = this.carrito.find(i => i.id === producto.id);
    return item ? item.cantidad : 0;
  }

  calcularTotales() {
    this.totalVenta = this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    this.totalItems = this.carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }

  async cobrar() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Venta',
      message: `Total a cobrar: $${this.totalVenta.toFixed(2)}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Efectivo',
          handler: () => this.procesarVentaBackend('EFECTIVO')
        },
        {
          text: 'Tarjeta',
          handler: () => this.procesarVentaBackend('TARJETA')
        }
      ]
    });
    await alert.present();
  }

  async procesarVentaBackend(metodo: string) {
    const loading = await this.loadingCtrl.create({ message: 'Procesando...', spinner: 'circles' });
    await loading.present();

    const ventaData = {
      metodo_pago: metodo,
      productos: this.carrito.map(item => ({
        id: item.id,
        cantidad: item.cantidad
      }))
    };

    this.finanzasService.registrarVenta(ventaData).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('¡Venta registrada!');
        this.limpiarCarrito();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.presentToast('Error al registrar', 'danger');
      }
    });
  }

  limpiarCarrito() {
    this.carrito = [];
    this.totalVenta = 0;
    this.totalItems = 0;
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message, duration: 1500, color, position: 'bottom', icon: 'checkmark-circle'
    });
    toast.present();
  }
}
