import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

interface RuntimeConfig {
  googleMapsApiKey?: string;
}

async function loadGoogleMapsApi(): Promise<void> {
  const response = await fetch('./assets/runtime-config.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Runtime configuration request failed (${response.status}).`);
  }

  const config = await response.json() as RuntimeConfig;
  if (!config.googleMapsApiKey) {
    throw new Error('The Google Maps API key is not configured in assets/runtime-config.json.');
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&key=${encodeURIComponent(config.googleMapsApiKey)}&region=ZAF`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('The Google Maps JavaScript API could not be loaded.'));
    document.head.appendChild(script);
  });
}

async function bootstrap(): Promise<void> {
  try {
    await loadGoogleMapsApi();
  } catch (error) {
    console.error('Google Maps configuration or loading failed.', error);
  }

  await platformBrowser().bootstrapModule(AppModule);
}

bootstrap().catch(error => console.error('Application bootstrap failed.', error));
