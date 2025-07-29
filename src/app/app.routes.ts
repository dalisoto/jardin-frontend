import { Routes } from '@angular/router';
import {Home} from './components/home/home'
import {Inicio} from './components/inicio/inicio'

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'inicio', component: Inicio }
];
