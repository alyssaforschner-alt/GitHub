import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./start-page/start-page.component').then(m => m.StartPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./login-page/login-page.component').then(m => m.LoginPageComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./home-page/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'highscore',
    loadComponent: () => import('./highscore-page/highscore-page.component').then(m => m.HighscorePageComponent),
  },
  {
    path: 'spiel',
    loadComponent: () => import('./game-page/game-page.component').then(m => m.GamePageComponent),
  },
  {
    path: 'multiplayer',
    loadComponent: () => import('./multiplayer-page/multiplayer-page.component').then(m => m.MultiplayerPageComponent),
  },
  {
    path: 'optionen',
    loadComponent: () => import('./options-page/options-page.component').then(m => m.OptionsPageComponent),
  },
  { path: '**', redirectTo: '' }
];
