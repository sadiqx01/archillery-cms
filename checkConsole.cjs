const http = require('http');

const getJson = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

async function main() {
  try {
    const targets = await getJson('http://127.0.0.1:9222/json');
    const target = targets.find(t => t.url.includes('localhost:5173'));
    if (!target) {
      console.log('No localhost:5173 target found in Chrome! Available targets:', targets.map(t => t.url));
      process.exit(1);
    }
    
    console.log('Connecting to target:', target.title);
    const wsUrl = target.webSocketDebuggerUrl;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected. Enabling Console and Runtime logs...');
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
      ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
      
      // Trigger a page reload to capture startup console logs
      setTimeout(() => {
        console.log('Reloading page...');
        ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));
      }, 500);
    };
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a));
        console.log(`[BROWSER CONSOLE ${type.toUpperCase()}]:`, ...args);
      }
      
      if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params.exceptionDetails;
        const text = details.exception ? (details.exception.description || details.exception.value) : details.text;
        console.log('\n[BROWSER EXCEPTION CRASH]:', text);
        console.log('Line:', details.lineNumber, 'Column:', details.columnNumber);
        if (details.stackTrace) {
          console.log(details.stackTrace.callFrames.map(f => `  at ${f.functionName} (${f.url}:${f.lineNumber}:${f.columnNumber})`).join('\n'));
        }
        console.log('\n');
      }
      
      if (msg.method === 'Log.entryAdded') {
        console.log('[BROWSER LOG ENTRY]:', msg.params.entry.text);
      }
    };
    
    ws.onerror = (err) => {
      console.error('WS Error:', err);
    };
    
    ws.onclose = () => {
      console.log('WebSocket closed.');
    };
    
    // Keep alive for 8 seconds to collect logs
    setTimeout(() => {
      console.log('Closing debug session.');
      ws.close();
      process.exit(0);
    }, 8000);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
