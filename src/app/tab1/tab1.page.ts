import { Component, OnInit } from '@angular/core';
import { FinanzasService } from '../services/finanzas';
import { AuthService } from '../services/auth';
import Chart from 'chart.js/auto';
import { forkJoin } from 'rxjs';

import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { DetalleVentaPage } from '../pages/detalle-venta/detalle-venta.page';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {

  // Variables para las gráficas
  chartBarras: any;
  chartProductos: any;
  chartMetodos: any;

  // Variables de datos financieros
  totalVentas = 0;
  totalGastos = 0;
  gananciaTotal = 0;
  ultimasVentas: any[] = [];

  // Variables de UI
  userInitials: string = 'CM';
  filtroActual = 'hoy'; // Filtro por defecto

  constructor(
    private finanzasService: FinanzasService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private alertCtrl: AlertController, // <--- Inyectar
    private router: Router
  ) {}

  ngOnInit() {
    this.generarIniciales();
    // Cargamos datos iniciales (Hoy)
    this.filtrarPorFecha('hoy');
  }

  ionViewWillEnter() {
    // Recargar datos cada vez que entras a la pantalla
    this.filtrarPorFecha(this.filtroActual);
  }

  // --- 1. LÓGICA DE UI ---

  generarIniciales() {
    // Aquí podrías tomar el username real del localStorage
    // Por ahora usamos las iniciales del negocio
    this.userInitials = 'AD';
  }

  cambiarFiltro(event: any) {
    this.filtroActual = event.detail.value;
    this.filtrarPorFecha(this.filtroActual);
  }

  handleRefresh(event: any) {
    this.filtrarPorFecha(this.filtroActual, event);
  }

  // --- 2. LÓGICA DE FECHAS ---

filtrarPorFecha(tipo: string, event: any = null) {
    const hoy = new Date();
    let fechaInicio = '';
    let fechaFin = '';

    const formatDate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const dateLocal = new Date(date.getTime() - (offset * 60 * 1000));
      return dateLocal.toISOString().split('T')[0];
    };
    // ------------------------------------------------

    if (tipo === 'hoy') {
      fechaInicio = formatDate(hoy);
      fechaFin = formatDate(hoy);
    }
    else if (tipo === 'semana') {
      const primerDia = new Date(hoy);
      primerDia.setDate(hoy.getDate() - hoy.getDay() + 1);
      const ultimoDia = new Date(hoy);
      ultimoDia.setDate(hoy.getDate() - hoy.getDay() + 7);

      fechaInicio = formatDate(primerDia);
      fechaFin = formatDate(ultimoDia);
    }
    else if (tipo === 'mes') {
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      fechaInicio = formatDate(primerDia);
      fechaFin = formatDate(ultimoDia);
    }

    // Imprimimos en consola para verificar qué está pidiendo
    console.log(`Filtrando desde: ${fechaInicio} hasta ${fechaFin}`);

    this.cargarDatos(fechaInicio, fechaFin, event);
  }

  // --- 3. CARGA DE DATOS ---

  cargarDatos(start: string, end: string, event: any = null) {
    // Usamos forkJoin para esperar a que VENTAS y GASTOS lleguen juntos
    forkJoin({
      ventas: this.finanzasService.getVentas(start, end),
      movimientos: this.finanzasService.getMovimientos(start, end)
    }).subscribe({
      next: (resultado: any) => {
        console.log('Datos recibidos:', resultado); // Para depurar en consola

        // 1. PROCESAR VENTAS
        const ventasRes = resultado.ventas;
        this.ultimasVentas = ventasRes;
        this.totalVentas = ventasRes.reduce((acc: number, v: any) => acc + parseFloat(v.total), 0);

        // 2. PROCESAR GASTOS (LÓGICA BLINDADA)
        const movsRes = resultado.movimientos;

        // Filtramos asegurando que detecte true, 1 o "true"
        const gastos = movsRes.filter((m: any) => {
          return m.es_gasto === true || m.es_gasto === 1 || m.es_gasto === 'true';
        });

        this.totalGastos = gastos.reduce((acc: number, g: any) => acc + parseFloat(g.monto), 0);

        // 3. CALCULAR GANANCIA
        this.calcularGanancia();

        // 4. GENERAR GRÁFICAS
        this.generarGraficaBarras();
        this.generarGraficaDona(ventasRes);
        this.generarGraficaMetodos(ventasRes);

        // 5. TERMINAR REFRESHER
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error cargando datos', err);
        if (event) event.target.complete();
      }
    });
  }

  calcularGanancia() {
    this.gananciaTotal = this.totalVentas - this.totalGastos;
  }

  // --- 4. GENERACIÓN DE GRÁFICAS ---

  // Gráfica 1: Balance (Barras)
  generarGraficaBarras() {
    if (this.chartBarras) this.chartBarras.destroy();

    const ctx = document.getElementById('ventasChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.chartBarras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Egresos'],
        datasets: [{
          label: 'Total',
          data: [this.totalVentas, this.totalGastos],
          backgroundColor: ['#3880ff', '#eb445a'],
          borderRadius: 15,
          barThickness: 50
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { display: false } }
        }
      }
    });
  }

  // Gráfica 2: Top Productos (Dona)
  generarGraficaDona(ventas: any[]) {
    if (this.chartProductos) this.chartProductos.destroy();

    const ctx = document.getElementById('productosChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Procesar datos: contar productos
    const conteo: any = {};
    ventas.forEach((venta: any) => {
      venta.detalles.forEach((detalle: any) => {
        const nombre = detalle.producto_nombre || 'Producto';
        conteo[nombre] = (conteo[nombre] || 0) + detalle.cantidad;
      });
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    this.chartProductos = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#3880ff', '#2dd36f', '#ffc409', '#eb445a', '#3dc2ff'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } }
        },
        cutout: '75%'
      }
    });
  }

  // Gráfica 3: Métodos de Pago (Pastel)
  generarGraficaMetodos(ventas: any[]) {
    if (this.chartMetodos) this.chartMetodos.destroy();

    const ctx = document.getElementById('metodosChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Procesar datos: sumar dinero por método
    const acumulado: any = {};
    ventas.forEach((venta: any) => {
      const metodo = venta.metodo_pago || 'Desconocido';
      const total = parseFloat(venta.total);
      acumulado[metodo] = (acumulado[metodo] || 0) + total;
    });

    const labels = Object.keys(acumulado);
    const data = Object.values(acumulado);

    this.chartMetodos = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#2dd36f', '#3880ff', '#ffc409'], // Verde, Azul, Amarillo
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
        }
      }
    });
  }

  async verDetalle(venta: any) {
    const modal = await this.modalCtrl.create({
      component: DetalleVentaPage,
      componentProps: { venta: venta }
    });
    return await modal.present();
  }

  async cerrarSesion() {
  const alert = await this.alertCtrl.create({
    header: 'Cerrar Sesión',
    message: '¿Estás seguro de que quieres salir?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Salir',
        handler: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    ]
  });
  await alert.present();
}
}
