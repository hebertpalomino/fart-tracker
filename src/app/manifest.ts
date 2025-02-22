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
        src: '/icon?size=192x192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512x512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
