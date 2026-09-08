const { SNClient } = require('./snClient');

async function main() {
  const client = new SNClient('dev382110');
  console.log('Deploying Phase 3 Service Catalog, Variables, Variable Sets, and UI Policies...');

  const script = `
    var serviceCatalogId = 'e0d08b13c3330100c8b837659bba8fb4';

    // 1. Create Category: Network
    var catGr = new GlideRecord('sc_category');
    catGr.addQuery('title', 'Network');
    catGr.addQuery('sc_catalog', serviceCatalogId);
    catGr.query();
    var categoryId;
    if (!catGr.next()) {
      catGr.initialize();
      catGr.title = 'Network';
      catGr.sc_catalog = serviceCatalogId;
      catGr.description = 'Network requests, connections, and hardware services';
      catGr.active = true;
      categoryId = catGr.insert();
      gs.print('Created Category: Network (sys_id: ' + categoryId + ')');
    } else {
      categoryId = catGr.getUniqueValue();
      gs.print('Category Network already exists (sys_id: ' + categoryId + ')');
    }

    // 2. Create Variable Set: Requester Information
    var vsGr = new GlideRecord('item_option_new_set');
    vsGr.addQuery('internal_name', 'requester_information');
    vsGr.query();
    var varSetId;
    if (!vsGr.next()) {
      vsGr.initialize();
      vsGr.name = 'Requester Information';
      vsGr.internal_name = 'requester_information';
      vsGr.title = 'Requester Information';
      vsGr.description = 'Auto-populated details for the requesting employee';
      vsGr.type = 'one_to_one';
      varSetId = vsGr.insert();
      gs.print('Created Variable Set: Requester Information (sys_id: ' + varSetId + ')');
    } else {
      varSetId = vsGr.getUniqueValue();
      vsGr.type = 'one_to_one';
      vsGr.update();
      gs.print('Variable Set exists (sys_id: ' + varSetId + ')');
    }

    // Helper to create variables
    function createVariable(config) {
      var varGr = new GlideRecord('item_option_new');
      varGr.addQuery('name', config.name);
      if (config.cat_item) varGr.addQuery('cat_item', config.cat_item);
      if (config.variable_set) varGr.addQuery('variable_set', config.variable_set);
      varGr.query();
      if (!varGr.next()) {
        varGr.initialize();
        varGr.name = config.name;
        varGr.question_text = config.question_text;
        varGr.type = config.type; // 6 = Single Line Text, 8 = Reference, 3 = Multiple Choice
        varGr.order = config.order;
        varGr.mandatory = config.mandatory || false;
        varGr.read_only = config.read_only || false;
        if (config.default_value) varGr.default_value = config.default_value;
        if (config.reference) varGr.reference = config.reference;
        if (config.cat_item) varGr.cat_item = config.cat_item;
        if (config.variable_set) varGr.variable_set = config.variable_set;
        var vid = varGr.insert();
        gs.print('Created variable: ' + config.name + ' (sys_id: ' + vid + ')');
        
        // Add choices if any
        if (config.choices && config.choices.length > 0) {
          for (var i = 0; i < config.choices.length; i++) {
            var ch = config.choices[i];
            var qch = new GlideRecord('question_choice');
            qch.initialize();
            qch.question = vid;
            qch.value = ch.value;
            qch.text = ch.text;
            qch.order = ch.order;
            qch.insert();
            gs.print('  Added choice: ' + ch.text + ' (' + ch.value + ')');
          }
        }
        return vid;
      } else {
        gs.print('Variable already exists: ' + config.name);
        return varGr.getUniqueValue();
      }
    }

    // 2b. Add variables to Variable Set: Requester Information
    // Type 8 = Reference, Type 6 = Single line text
    var vOpenedOnBehalf = createVariable({
      name: 'opened_on_behalf_of',
      question_text: 'Opened on behalf of',
      type: 8,
      reference: 'sys_user',
      order: 10,
      mandatory: true,
      default_value: 'javascript:gs.getUserID();',
      variable_set: varSetId
    });

    createVariable({
      name: 'user_name',
      question_text: 'User Name',
      type: 6,
      order: 20,
      read_only: true,
      default_value: 'javascript:gs.getUserDisplayName();',
      variable_set: varSetId
    });

    createVariable({
      name: 'email_id',
      question_text: 'Email ID',
      type: 6,
      order: 30,
      read_only: true,
      default_value: 'javascript:gs.getUser().getEmail();',
      variable_set: varSetId
    });

    createVariable({
      name: 'phone_number',
      question_text: 'Phone Number',
      type: 6,
      order: 40,
      read_only: true,
      default_value: 'javascript:gs.getUser().getRecord().getValue("phone") || gs.getUser().getRecord().getValue("mobile_phone") || "";',
      variable_set: varSetId
    });

    // 3. Create Catalog Item: Network Request
    var itemGr = new GlideRecord('sc_cat_item');
    itemGr.addQuery('name', 'Network Request');
    itemGr.query();
    var catalogItemId;
    if (!itemGr.next()) {
      itemGr.initialize();
      itemGr.name = 'Network Request';
      itemGr.short_description = 'Network request Management';
      itemGr.description = 'Submit a network request for new or existing network connection setups, access level configurations, and hardware provisioning.';
      itemGr.category = categoryId;
      itemGr.sc_catalogs = serviceCatalogId;
      itemGr.active = true;
      itemGr.price = '0';
      itemGr.recurring_price = '0';
      catalogItemId = itemGr.insert();
      gs.print('Created Catalog Item: Network Request (sys_id: ' + catalogItemId + ')');
    } else {
      catalogItemId = itemGr.getUniqueValue();
      itemGr.category = categoryId;
      itemGr.sc_catalogs = serviceCatalogId;
      itemGr.update();
      gs.print('Catalog Item exists: Network Request (sys_id: ' + catalogItemId + ')');
    }

    // 4. Link Variable Set to Catalog Item
    var setLink = new GlideRecord('io_set_item');
    setLink.addQuery('sc_cat_item', catalogItemId);
    setLink.addQuery('variable_set', varSetId);
    setLink.query();
    if (!setLink.next()) {
      setLink.initialize();
      setLink.sc_cat_item = catalogItemId;
      setLink.variable_set = varSetId;
      setLink.order = 50;
      setLink.insert();
      gs.print('Linked Variable Set to Catalog Item');
    }

    // 5. Create Item-level Variables on Network Request
    // 1. Requested For
    createVariable({
      name: 'requested_for',
      question_text: 'Requested For',
      type: 6, // Single Line Text
      order: 100,
      mandatory: true,
      cat_item: catalogItemId
    });

    // 2. Mobile Number
    createVariable({
      name: 'mobile_number',
      question_text: 'Mobile Number',
      type: 6, // Single Line Text
      order: 200,
      mandatory: true,
      cat_item: catalogItemId
    });

    // 3. Type of Connection (Multiple Choice)
    var vTypeConn = createVariable({
      name: 'type_of_connection',
      question_text: 'Type of Connection',
      type: 3, // Multiple Choice
      order: 300,
      mandatory: true,
      cat_item: catalogItemId,
      choices: [
        { value: 'New', text: 'New', order: 10 },
        { value: 'Existing', text: 'Existing', order: 20 }
      ]
    });

    // 4. Enter your Existing ID
    var vExistingId = createVariable({
      name: 'existing_id',
      question_text: 'Enter your Existing ID',
      type: 6, // Single Line Text
      order: 400,
      mandatory: false,
      cat_item: catalogItemId
    });

    // 5. Total Amount
    createVariable({
      name: 'total_amount',
      question_text: 'Total Amount',
      type: 6, // Single Line Text
      order: 500,
      mandatory: true,
      default_value: '500',
      cat_item: catalogItemId
    });

    // 6. Mode of Payment (Multiple Choice)
    createVariable({
      name: 'mode_of_payment',
      question_text: 'Mode of Payment',
      type: 3, // Multiple Choice
      order: 600,
      mandatory: true,
      cat_item: catalogItemId,
      choices: [
        { value: 'UPI', text: 'UPI', order: 10 },
        { value: 'CARD', text: 'CARD', order: 20 }
      ]
    });

    // 7. Address
    createVariable({
      name: 'address',
      question_text: 'Address',
      type: 6, // Single Line Text
      order: 700,
      mandatory: true,
      cat_item: catalogItemId
    });

    // 6. Create Catalog UI Policy: Show Existing ID for Existing Connection
    var policyGr = new GlideRecord('catalog_ui_policy');
    policyGr.addQuery('catalog_item', catalogItemId);
    policyGr.addQuery('short_description', 'Show Existing ID for Existing Connection');
    policyGr.query();
    var policyId;
    if (!policyGr.next()) {
      policyGr.initialize();
      policyGr.catalog_item = catalogItemId;
      policyGr.applies_to = 'item';
      policyGr.short_description = 'Show Existing ID for Existing Connection';
      policyGr.catalog_conditions = 'IO:' + vTypeConn + '=Existing^EQ';
      policyGr.on_load = true;
      policyGr.reverse_if_false = true;
      policyGr.active = true;
      policyId = policyGr.insert();
      gs.print('Created Catalog UI Policy: Show Existing ID for Existing Connection (sys_id: ' + policyId + ')');

      // Create Policy Action for existing_id
      var actGr = new GlideRecord('catalog_ui_policy_action');
      actGr.initialize();
      actGr.ui_policy = policyId;
      actGr.catalog_item = catalogItemId;
      actGr.catalog_variable = 'IO:' + vExistingId;
      actGr.visible = 'true';
      actGr.mandatory = 'true';
      actGr.insert();
      gs.print('Created Catalog UI Policy Action: existing_id Visible = true, Mandatory = true');
    } else {
      gs.print('Catalog UI Policy already exists');
    }

    // 7. Add Catalog Client Script to update user fields dynamically if opened_on_behalf_of changes
    var csGr = new GlideRecord('catalog_script_client');
    csGr.addQuery('cat_item', catalogItemId);
    csGr.addQuery('name', 'Auto-populate Requester Details');
    csGr.query();
    if (!csGr.next()) {
      csGr.initialize();
      csGr.name = 'Auto-populate Requester Details';
      csGr.cat_item = catalogItemId;
      csGr.type = 'onChange';
      csGr.cat_variable = 'IO:' + vOpenedOnBehalf;
      csGr.applies_to = 'item';
      csGr.active = true;
      csGr.script = [
        'function onChange(control, oldValue, newValue, isLoading) {',
        '   if (isLoading || !newValue) return;',
        '   g_form.getReference("opened_on_behalf_of", function(user) {',
        '       if (user) {',
        '           g_form.setValue("user_name", user.name || "");',
        '           g_form.setValue("email_id", user.email || "");',
        '           g_form.setValue("phone_number", user.phone || user.mobile_phone || "");',
        '       }',
        '   });',
        '}'
      ].join('\\n');
      csGr.insert();
      gs.print('Created Catalog Client Script for auto-populating requester info');
    }

    gs.print('--- PHASE_3_COMPLETED ---');
  `;

  const output = await client.runScript(script);
  console.log('Output:\n', output);
}

main().catch(console.error);
