try {
  if (require('fs').existsSync('./add-new-countries.js')) {
    require('./add-new-countries.js');
  }
} catch(err) { console.log('New countries:', err.message); }