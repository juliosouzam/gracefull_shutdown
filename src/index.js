import { createServer } from 'node:http';
import { once } from 'node:events';

async function handler(request, response) {
  try {
    const data = JSON.parse(await once(request, 'data'));

    console.log('\nreceived data:', data);

    response.writeHead(200);
    response.end(JSON.stringify(data));

    setTimeout(() => {
      throw new Error('will be handle on uncaught');
    }, 1000);

    Promise.reject('will be handle by promise');
  } catch (error) {
    console.error('DEU RUIM', error.stack);
    response.writeHead(500);
    response.end();
  }
}

const PORT = process.env.PORT || 3333;

const server = createServer(handler)
  .listen(PORT)
  .on('listening', () => console.log(`Listening on ${PORT}`));

// catch unhandled rejections
process.on('uncaughtException', (error, origin) => {
  console.log(`\n${origin} signal received: \n${error}`);
});

process.on('unhandledRejection', (error) => {
  console.log(`\nunhandledRejection signal received: \n${error}`);
});

function gracefulShutdown(event) {
  return (code) => {
    console.log(`\n${event} signal received: ${code}`);
    server.close(() => {
      console.log('\nServer closed');
      console.log('\nDB closed');
      process.exit(code);
    });
  };
}

process.on('SIGINT', gracefulShutdown('SIGINT'));

process.on('SIGTERM', gracefulShutdown('SIGTERM'));

process.on('exit', (code) => {
  console.log(`\nexit signal received: ${code}`);
});
