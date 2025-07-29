import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/UserService';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  userProfile: any;

  form = {
    correo: '',
    password: '',
    nombre: '',
    edad: null,
    clima: '',
    zona: '',
    espacio: '',
    mascotas: '',
    experiencia: ''
  };

  login = {
    correo: '',
    password: ''
  };

  ngOnInit() {
    this.onLogin();
  }

  onLogin() {
    // console.log('Datos de login:', this.login);
    // this.userService.getProfile().subscribe({
    //   next: (response) => {
    //     this.userProfile = response.user;
    //   },
    //   error: (err) => {
    //     console.error('Error al cargar perfil', err);
    //     // Manejar error (redirigir a login, mostrar mensaje, etc.)
    //   }
    // });
  }

  // Inyecta UserService correctamente
  constructor(private userService: UserService) {}

  onSubmit() {
    console.log('Datos del formulario:', this.form);
    // Aquí puedes hacer una petición HTTP al backend
    // Mapeamos los nombres del formulario a los del backend
    const userData = {
        email: this.form.correo,
        password: this.form.password,
        nombre:this.form.nombre,
        edad:this.form.edad,
        tipoClima: this.form.clima,
        zonaGeo: this.form.zona,
        espacio: this.form.espacio,
        mascota: this.form.mascotas,
        experiencia: this.form.experiencia
    };
    // Envía los datos al backend
    this.userService.register(userData).subscribe({
    next: (response: any) => {
      console.log('Registro exitoso', response);
      this.cerrarModal();
    },
    error: (err: any) => {
      console.error('Error en registro', err);
    }
  });
}

  abrirModal(tipo: 'registro' | 'login'): void {
    let modalId = '';

    if (tipo === 'registro') {
      modalId = 'modalRegistrar';
    } else if (tipo === 'login') {
      modalId = 'modalLogin';
    }

    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  
  cerrarModal(): void {
    const modales = ['modalRegistrar', 'modalLogin'];
    modales.forEach(id => {
      const modal = document.getElementById(id);
      if (modal) modal.style.display = 'none';
    });
  }

  // Detecta clics en cualquier parte de la ventana
  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent): void {
    const modal = document.getElementById('modalRegistrar');
    if (modal && event.target === modal) {
      modal.style.display = 'none';
    }
  }

  imagenActual = 0;
  imagenes: string[] = [
    'assets/img/planta1.jpg',
    'assets/img/planta2.jpg',
    'assets/img/planta3.jpg'
  ];

  siguienteImagen() {
    this.imagenActual = (this.imagenActual + 1) % this.imagenes.length;
  }

  anteriorImagen() {
    this.imagenActual =
      (this.imagenActual - 1 + this.imagenes.length) % this.imagenes.length;
  }


}


