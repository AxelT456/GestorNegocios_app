import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {

  usuario = {
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private navCtrl: NavController // Usamos NavController para volver atrás bonito
  ) { }

  ngOnInit() {
  }

  regresar() {
    this.navCtrl.back(); // Vuelve al Login con animación de retroceso
  }

  async registrarse() {
    // 1. Validación básica en Frontend
    if (this.usuario.password !== this.usuario.password_confirm) {
      this.mostrarAlerta('Error', 'Las contraseñas no coinciden.');
      return;
    }

    // 2. Mostrar cargando
    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'circles'
    });
    await loading.present();

    // 3. Llamar al servicio
    this.authService.registro(this.usuario).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        console.log('Registro exitoso:', res);

        // Al registrarse, el backend ya devuelve el Token, así que entra directo
        this.mostrarAlerta('¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente.');
        this.router.navigate(['/tabs/tab1']);
      },
      error: async (err: any) => {
        await loading.dismiss();
        console.error('Error registro:', err);

        // Manejo de errores comunes
        let mensaje = 'No se pudo crear la cuenta.';
        if (err.error?.username) mensaje = 'El nombre de usuario ya existe.';
        if (err.error?.email) mensaje = 'Ese correo ya está registrado.';

        this.mostrarAlerta('Error', mensaje);
      }
    });
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
