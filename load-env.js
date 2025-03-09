// This script loads environment variables from .env into the web page
(async function() {
  try {
    // Read .env file content
    const response = await fetch('.env');
    if (!response.ok) {
      console.error('Failed to load .env file');
      return;
    }
    
    const envText = await response.text();
    
    // Create window.ENV object
    window.ENV = {};
    
    // Parse the .env file and extract variables
    const lines = envText.split('\n');
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;
      
      // Split by first equals sign
      const equalSignIndex = line.indexOf('=');
      if (equalSignIndex > 0) {
        const key = line.substring(0, equalSignIndex).trim();
        let value = line.substring(equalSignIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        
        window.ENV[key] = value;
        console.log(`Loaded environment variable: ${key}`);
      }
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
})();
