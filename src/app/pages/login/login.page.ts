import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth'; // Asegúrate que el nombre coincida con tu archivo
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  credenciales = {
    username: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  async ingresar() {
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circles'
    });
    await loading.present();

    this.authService.login(this.credenciales).subscribe({
      next: async (res: any) => {
        console.log('Login exitoso:', res);
        await loading.dismiss();
        this.router.navigate(['/tabs/tab1']);
      },
      error: async (err: any) => {
        console.error('Error login:', err);
        await loading.dismiss();
        this.mostrarAlerta('Error', 'Usuario o contraseña incorrectos');
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
