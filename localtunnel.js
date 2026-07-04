const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({
      port: 3000,
      subdomain: 'nearme-app-' + Math.random().toString(36).substring(2, 7)
    });

    console.log('🚀 Public Sharing URL:', tunnel.url);

    tunnel.on('close', () => {
      console.log('🔌 Tunnel connection closed. Reconnecting...');
    });
    
    // Keep process alive
    process.stdin.resume();
  } catch (err) {
    console.error('❌ Error creating tunnel:', err);
  }
})();
