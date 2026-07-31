// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { PedidosComponent } from './pages/pedidos/pedidos';
import { ControleComponent } from './pages/controle/controle';
import { PedidoDetalheComponent } from './pages/pedido-detalhe/pedido-detalhe';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'controle', component: ControleComponent },
  { path: 'pedido-detalhe/:id', component: PedidoDetalheComponent }, //Como o pedido detalhe será uma rota dinâmica, é preciso colocar o número/id como parâmetro para encontrar o pedido específico posteriormente com o pedido.numero
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
