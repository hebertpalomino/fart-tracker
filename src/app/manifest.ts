import { MetadataRoute } from 'next';
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fart Tracker',
    short_name: 'Fart Tracker',
    description: 'Track and map your farts around the world',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png'
      }
    ]
  };
}
