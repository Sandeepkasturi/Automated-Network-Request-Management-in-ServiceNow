const { SNClient } = require('./snClient');

async function main() {
  const client = new SNClient('dev382110');
  console.log('Provisioning columns, labels, and choices on u_network_database...');

  const script = `
    var tableName = 'u_network_database';
    
    function addColumn(element, type, label, maxLen, refTable, isDisplay) {
      var dict = new GlideRecord('sys_dictionary');
      dict.addQuery('name', tableName);
      dict.addQuery('element', element);
      dict.query();
      if (!dict.next()) {
        dict.initialize();
        dict.name = tableName;
        dict.element = element;
        dict.internal_type = type;
        dict.max_length = maxLen || 100;
        if (refTable) dict.reference = refTable;
        if (isDisplay) dict.display = true;
        dict.insert();
        gs.print('Created column: ' + element + ' (' + type + ')');
      } else {
        gs.print('Column exists: ' + element);
      }

      var doc = new GlideRecord('sys_documentation');
      doc.addQuery('name', tableName);
      doc.addQuery('element', element);
      doc.addQuery('language', 'en');
      doc.query();
      if (!doc.next()) {
        doc.initialize();
        doc.name = tableName;
        doc.element = element;
        doc.language = 'en';
        doc.label = label;
        doc.plural = label;
        doc.insert();
      }
    }

    function addChoice(element, value, label, seq) {
      var ch = new GlideRecord('sys_choice');
      ch.addQuery('name', tableName);
      ch.addQuery('element', element);
      ch.addQuery('value', value);
      ch.query();
      if (!ch.next()) {
        ch.initialize();
        ch.name = tableName;
        ch.element = element;
        ch.language = 'en';
        ch.value = value;
        ch.label = label;
        ch.sequence = seq || 0;
        ch.insert();
        gs.print('Created choice: ' + element + ' -> ' + value);
      }
    }

    // 1. Auto-number / number
    addColumn('u_number', 'string', 'Number', 40, '', true);
    
    // Auto-number rule
    var numGr = new GlideRecord('sys_number');
    numGr.addQuery('category', tableName);
    numGr.query();
    if (!numGr.next()) {
      numGr.initialize();
      numGr.category = tableName;
      numGr.prefix = 'NET';
      numGr.number = 1000;
      numGr.digits = 7;
      numGr.insert();
      gs.print('Created number counter for NET');
    }

    // 2. Requester details
    addColumn('u_opened_on_behalf_of', 'reference', 'Opened on behalf of', 32, 'sys_user', false);
    addColumn('u_requested_for', 'string', 'Requested For', 100, '', false);
    addColumn('u_user_name', 'string', 'User Name', 100, '', false);
    addColumn('u_email_id', 'string', 'Email ID', 100, '', false);
    addColumn('u_phone_number', 'string', 'Phone Number', 40, '', false);
    addColumn('u_mobile_number', 'string', 'Mobile Number', 40, '', false);

    // 3. Request specifics
    addColumn('u_type_of_connection', 'string', 'Type of Connection', 40, '', false);
    addChoice('u_type_of_connection', 'New', 'New', 10);
    addChoice('u_type_of_connection', 'Existing', 'Existing', 20);

    addColumn('u_existing_id', 'string', 'Existing ID', 100, '', false);
    addColumn('u_total_amount', 'string', 'Total Amount', 40, '', false);

    addColumn('u_mode_of_payment', 'string', 'Mode of Payment', 40, '', false);
    addChoice('u_mode_of_payment', 'UPI', 'UPI', 10);
    addChoice('u_mode_of_payment', 'CARD', 'CARD', 20);

    addColumn('u_address', 'string', 'Address', 500, '', false);
    addColumn('u_short_description', 'string', 'Short Description', 255, '', false);

    // 4. Lifecycle & fulfillment
    addColumn('u_state', 'string', 'State', 40, '', false);
    addChoice('u_state', 'New', 'New', 10);
    addChoice('u_state', 'Awaiting Approval', 'Awaiting Approval', 20);
    addChoice('u_state', 'In Progress', 'In Progress', 30);
    addChoice('u_state', 'Completed', 'Completed', 40);
    addChoice('u_state', 'Rejected', 'Rejected', 50);

    addColumn('u_assignment_group', 'reference', 'Assignment Group', 32, 'sys_user_group', false);
    addColumn('u_assigned_to', 'reference', 'Assigned to', 32, 'sys_user', false);
    addColumn('u_work_notes', 'journal_input', 'Work Notes', 4000, '', false);

    gs.print('--- COLUMNS_PROVISIONING_COMPLETE ---');
  `;

  const output = await client.runScript(script);
  console.log('Output:\n', output);
}

main().catch(console.error);
