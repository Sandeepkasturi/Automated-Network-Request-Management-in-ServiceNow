const { SNClient } = require('./snClient');

async function main() {
  const client = new SNClient('dev382110');
  console.log('Ensuring auto-numbering rule on u_network_database...');

  const script = `
    var brGr = new GlideRecord('sys_script');
    brGr.addQuery('name', 'Auto-number u_network_database');
    brGr.addQuery('collection', 'u_network_database');
    brGr.query();
    if (!brGr.next()) {
      brGr.initialize();
      brGr.name = 'Auto-number u_network_database';
      brGr.collection = 'u_network_database';
      brGr.when = 'before';
      brGr.action_insert = true;
      brGr.order = 50;
      brGr.script = [
        '(function executeRule(current, previous /*null when async*/) {',
        '    if (!current.u_number) {',
        '        var nm = new NumberManager("u_network_database");',
        '        current.u_number = nm.getNextObjNumberPadded();',
        '    }',
        '})(current, previous);'
      ].join('\\n');
      brGr.insert();
      gs.print('Created auto-numbering Business Rule for u_network_database');
    } else {
      gs.print('Auto-numbering rule already exists');
    }
  `;

  const output = await client.runScript(script);
  console.log('Output:\n', output);
}

main().catch(console.error);
