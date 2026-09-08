const { SNClient } = require('./snClient');

async function main() {
  const client = new SNClient('dev382110');
  console.log('Deploying Phase 4 Automation (Business Rules, Approval Handlers, Notifications, and Flow)...');

  const script = `
    // Find our Catalog Item sys_id
    var catItemGr = new GlideRecord('sc_cat_item');
    catItemGr.addQuery('name', 'Network Request');
    catItemGr.query();
    if (!catItemGr.next()) {
      gs.print('ERROR: Network Request catalog item not found');
    }
    var catalogItemId = catItemGr.getUniqueValue();

    // 1. Business Rule on sc_req_item to process Network Request submission
    var brGr = new GlideRecord('sys_script');
    brGr.addQuery('name', 'Process Network Request Submission');
    brGr.addQuery('collection', 'sc_req_item');
    brGr.query();
    if (!brGr.next()) {
      brGr.initialize();
      brGr.name = 'Process Network Request Submission';
      brGr.collection = 'sc_req_item';
      brGr.when = 'after';
      brGr.action_insert = true;
      brGr.filter_condition = 'cat_item=' + catalogItemId + '^EQ';
      brGr.active = true;
      brGr.order = 100;
      brGr.script = [
        '(function executeRule(current, previous /*null when async*/) {',
        '    try {',
        '        var netGr = new GlideRecord("u_network_database");',
        '        netGr.initialize();',
        '        netGr.u_short_description = "Network Request: " + (current.variables.type_of_connection || "New") + " Connection for " + (current.variables.requested_for || current.request.requested_for.name);',
        '        netGr.u_opened_on_behalf_of = current.variables.opened_on_behalf_of || current.opened_by;',
        '        netGr.u_requested_for = current.variables.requested_for || current.request.requested_for.name;',
        '        netGr.u_user_name = current.variables.user_name || current.opened_by.name;',
        '        netGr.u_email_id = current.variables.email_id || current.opened_by.email;',
        '        netGr.u_phone_number = current.variables.phone_number || "";',
        '        netGr.u_mobile_number = current.variables.mobile_number || "";',
        '        netGr.u_type_of_connection = current.variables.type_of_connection || "New";',
        '        netGr.u_existing_id = current.variables.existing_id || "";',
        '        netGr.u_total_amount = current.variables.total_amount || "500";',
        '        netGr.u_mode_of_payment = current.variables.mode_of_payment || "UPI";',
        '        netGr.u_address = current.variables.address || "";',
        '        netGr.u_state = "Awaiting Approval";',
        '',
        '        // Assignment Group: Network Team',
        '        var grpGr = new GlideRecord("sys_user_group");',
        '        if (grpGr.get("name", "Network Team")) {',
        '            netGr.u_assignment_group = grpGr.getUniqueValue();',
        '        }',
        '',
        '        var netDbSysId = netGr.insert();',
        '        gs.info("Network Database record created: " + netDbSysId + " for RITM: " + current.number);',
        '',
        '        // Create Approval Request on Network Database record',
        '        var appGr = new GlideRecord("sysapproval_approver");',
        '        appGr.initialize();',
        '        appGr.sysapproval = netDbSysId;',
        '        appGr.source_table = "u_network_database";',
        '        appGr.document_id = netDbSysId;',
        '        appGr.state = "requested";',
        '',
        '        // Approver: manager of requester or admin/approver',
        '        var approverUser = netGr.u_opened_on_behalf_of.manager;',
        '        if (!approverUser) {',
        '            var adminGr = new GlideRecord("sys_user");',
        '            if (adminGr.get("user_name", "admin")) {',
        '                approverUser = adminGr.getUniqueValue();',
        '            }',
        '        }',
        '        appGr.approver = approverUser;',
        '        appGr.comments = "Network request submitted. Waiting for manager / security approval.";',
        '        appGr.insert();',
        '',
        '        // Send notification email (System Email log)',
        '        gs.eventQueue("network_request.submitted", netGr, netGr.u_email_id, netGr.u_requested_for);',
        '        current.work_notes = "Network Database Record created: " + netGr.u_number + ". Waiting for approval.";',
        '        current.update();',
        '    } catch (e) {',
        '        gs.error("Error in Process Network Request Submission: " + e.message);',
        '    }',
        '})(current, previous);'
      ].join('\\n');
      var sId = brGr.insert();
      gs.print('Created Business Rule: Process Network Request Submission (sys_id: ' + sId + ')');
    } else {
      gs.print('Business Rule Process Network Request Submission exists');
    }

    // 2. Business Rule on sysapproval_approver to sync approval back to u_network_database
    var brApp = new GlideRecord('sys_script');
    brApp.addQuery('name', 'Sync Network Request Approval State');
    brApp.addQuery('collection', 'sysapproval_approver');
    brApp.query();
    if (!brApp.next()) {
      brApp.initialize();
      brApp.name = 'Sync Network Request Approval State';
      brApp.collection = 'sysapproval_approver';
      brApp.when = 'after';
      brApp.action_update = true;
      brApp.filter_condition = 'source_table=u_network_database^stateCHANGESTOapproved^ORstateCHANGESTOrejected^EQ';
      brApp.active = true;
      brApp.order = 100;
      brApp.script = [
        '(function executeRule(current, previous /*null when async*/) {',
        '    try {',
        '        var netGr = new GlideRecord("u_network_database");',
        '        if (netGr.get(current.sysapproval)) {',
        '            if (current.state == "approved") {',
        '                netGr.u_state = "In Progress";',
        '                netGr.u_work_notes = "Approval granted by " + current.approver.name + ". Fulfillment task in progress.";',
        '                netGr.update();',
        '                gs.info("Network Database record approved: " + netGr.u_number);',
        '                gs.eventQueue("network_request.approved", netGr, netGr.u_email_id, current.approver.name);',
        '            } else if (current.state == "rejected") {',
        '                netGr.u_state = "Rejected";',
        '                netGr.u_work_notes = "Approval rejected by " + current.approver.name + ". Reason: " + (current.comments || "Policy restriction");',
        '                netGr.update();',
        '                gs.info("Network Database record rejected: " + netGr.u_number);',
        '                gs.eventQueue("network_request.rejected", netGr, netGr.u_email_id, current.approver.name);',
        '            }',
        '        }',
        '    } catch (e) {',
        '        gs.error("Error in Sync Network Request Approval State: " + e.message);',
        '    }',
        '})(current, previous);'
      ].join('\\n');
      var aId = brApp.insert();
      gs.print('Created Business Rule: Sync Network Request Approval State (sys_id: ' + aId + ')');
    } else {
      gs.print('Business Rule Sync Network Request Approval State exists');
    }

    // 3. Register Event Registry items for Notifications
    function ensureEvent(eventName, table, desc) {
      var ev = new GlideRecord('sysevent_register');
      ev.addQuery('event_name', eventName);
      ev.query();
      if (!ev.next()) {
        ev.initialize();
        ev.event_name = eventName;
        ev.table = table;
        ev.description = desc;
        ev.fired_by = 'Process Network Request Automation';
        ev.insert();
        gs.print('Registered event: ' + eventName);
      }
    }
    ensureEvent('network_request.submitted', 'u_network_database', 'Fired when a network request is submitted and awaiting approval');
    ensureEvent('network_request.approved', 'u_network_database', 'Fired when a network request is approved and fulfillment starts');
    ensureEvent('network_request.rejected', 'u_network_database', 'Fired when a network request is rejected');

    // 4. Create Email Notifications in sysevent_email_action
    function ensureNotification(name, eventName, subject, message) {
      var notif = new GlideRecord('sysevent_email_action');
      notif.addQuery('name', name);
      notif.query();
      if (!notif.next()) {
        notif.initialize();
        notif.name = name;
        notif.collection = 'u_network_database';
        notif.event_name = eventName;
        notif.generation_type = 'event';
        notif.send_self = true;
        notif.active = true;
        notif.subject = subject;
        notif.message_html = message;
        notif.event_parm_1 = true; // Send to event param 1 (requester email)
        notif.insert();
        gs.print('Created Notification: ' + name);
      }
    }

    var fieldShortDesc = '$' + '{u_short_description}';
    var fieldReqFor = '$' + '{u_requested_for}';
    var fieldTypeConn = '$' + '{u_type_of_connection}';
    var fieldPayMode = '$' + '{u_mode_of_payment}';
    var fieldTotalAmt = '$' + '{u_total_amount}';
    var fieldState = '$' + '{u_state}';
    var fieldNotes = '$' + '{u_work_notes}';

    ensureNotification(
      'Network Request Submitted',
      'network_request.submitted',
      'Network Request Submitted: ' + fieldShortDesc + ' (Waiting for Approval)',
      '<p>Dear ' + fieldReqFor + ',</p><p>Your network request has been successfully submitted and is currently awaiting approval.</p><p><b>Request Summary:</b><br/>Type of Connection: ' + fieldTypeConn + '<br/>Payment Mode: ' + fieldPayMode + '<br/>Total Amount: Rs. ' + fieldTotalAmt + '<br/>Status: ' + fieldState + '</p><p>Thank you,<br/>Network Services Team</p>'
    );

    ensureNotification(
      'Network Request Approved',
      'network_request.approved',
      'Network Request Approved: ' + fieldShortDesc,
      '<p>Dear ' + fieldReqFor + ',</p><p>Good news! Your network request has been approved. The Network Engineering team is now processing your request.</p><p><b>Status:</b> ' + fieldState + '</p><p>Thank you,<br/>Network Services Team</p>'
    );

    ensureNotification(
      'Network Request Rejected',
      'network_request.rejected',
      'Network Request Rejected: ' + fieldShortDesc,
      '<p>Dear ' + fieldReqFor + ',</p><p>Your network request has been reviewed and rejected.</p><p><b>Work Notes:</b> ' + fieldNotes + '</p><p>Thank you,<br/>Network Services Team</p>'
    );

    gs.print('--- PHASE_4_COMPLETED ---');
  `;

  const output = await client.runScript(script);
  console.log('Output:\n', output);
}

main().catch(console.error);
