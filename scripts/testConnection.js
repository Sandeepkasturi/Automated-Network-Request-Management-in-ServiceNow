const { SNClient } = require('./snClient');

async function main() {
  const client = new SNClient('dev382110');
  console.log('Testing SNClient connection and script runner...');
  const output = await client.runScript(`
    gs.print('--- SNCLIENT_TEST_START ---');
    gs.print('Instance: ' + gs.getProperty('instance_name'));
    gs.print('Current user: ' + gs.getUserName());
    gs.print('--- SNCLIENT_TEST_END ---');
  `);
  console.log('Output:\n', output);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
