import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
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

  onLogin() {
    console.log('Datos de login:', this.login);
    // Aquí iría la lógica para validar el login con el backend
  }

  onSubmit() {
    console.log('Datos del formulario:', this.form);
    // Aquí puedes hacer una petición HTTP al backend
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


