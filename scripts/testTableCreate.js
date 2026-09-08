const { SNClient } = require('./snClient');

async function main() {
  const client = new SNClient('dev382110');
  console.log('Testing table creation via sys_db_object.insert()...');
  const script = `
    var tableName = 'u_network_database';
    var grObj = new GlideRecord('sys_db_object');
    grObj.addQuery('name', tableName);
    grObj.query();
    if (grObj.next()) {
      gs.print('TABLE_EXISTS: ' + grObj.getUniqueValue() + ' label: ' + grObj.label);
    } else {
      grObj.initialize();
      grObj.name = tableName;
      grObj.label = 'Network Database';
      grObj.is_extendable = false;
      var sysId = grObj.insert();
      gs.print('TABLE_INSERTED: ' + sysId);
    }
  `;
  const output = await client.runScript(script);
  console.log('Output:\n', output);
}

main().catch(console.error);
