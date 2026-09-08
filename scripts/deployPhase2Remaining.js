const { SNClient } = require('./snClient');

async function main() {
  const client = new SNClient('dev382110');
  console.log('Deploying Relationship, Groups, and Form Layout for Phase 2...');

  const script = `
    var tableName = 'u_network_database';

    // 1. Create Relationship 'Approval Request'
    var relGr = new GlideRecord('sys_relationship');
    relGr.addQuery('name', 'Approval Request');
    relGr.addQuery('basic_apply_to', tableName);
    relGr.query();
    if (!relGr.next()) {
      relGr.initialize();
      relGr.name = 'Approval Request';
      relGr.basic_apply_to = tableName;
      relGr.basic_query_from = 'sysapproval_approver';
      relGr.active = true;
      relGr.query_with = "(function refineQuery(current, parent) {\\n    current.addQuery('sysapproval', parent.sys_id);\\n})(current, parent);";
      var relId = relGr.insert();
      gs.print('Created Relationship: Approval Request (sys_id: ' + relId + ')');
    } else {
      gs.print('Relationship already exists (sys_id: ' + relGr.getUniqueValue() + ')');
    }

    // 2. Create User Groups
    function ensureGroup(name, desc) {
      var grp = new GlideRecord('sys_user_group');
      grp.addQuery('name', name);
      grp.query();
      if (!grp.next()) {
        grp.initialize();
        grp.name = name;
        grp.description = desc;
        grp.active = true;
        var gid = grp.insert();
        gs.print('Created User Group: ' + name + ' (sys_id: ' + gid + ')');
        return gid;
      } else {
        gs.print('User Group exists: ' + name + ' (sys_id: ' + grp.getUniqueValue() + ')');
        return grp.getUniqueValue();
      }
    }

    var netTeamId = ensureGroup('Network Team', 'Network engineering and fulfillment team responsible for resolving network requests');
    var netApproverId = ensureGroup('Network Approvers', 'Network managers and security officers authorizing network changes');
    var netRequesterId = ensureGroup('Network Requesters', 'End-users authorized to submit network requests');

    // Add admin to Network Approvers and Network Team for testing
    var adminUser = new GlideRecord('sys_user');
    adminUser.addQuery('user_name', 'admin');
    adminUser.query();
    if (adminUser.next()) {
      var adminId = adminUser.getUniqueValue();
      
      function addToGroup(groupId) {
        var gm = new GlideRecord('sys_user_grmember');
        gm.addQuery('group', groupId);
        gm.addQuery('user', adminId);
        gm.query();
        if (!gm.next()) {
          gm.initialize();
          gm.group = groupId;
          gm.user = adminId;
          gm.insert();
        }
      }
      addToGroup(netTeamId);
      addToGroup(netApproverId);
      gs.print('Ensured admin user is member of Network Team and Network Approvers');
    }

    // 3. Configure Related List on Form for u_network_database
    var relListEntry = 'REL:' + relGr.getUniqueValue();
    var rl = new GlideRecord('sys_ui_related_list');
    rl.addQuery('name', tableName);
    rl.addQuery('view', 'Default view');
    rl.query();
    var rlId;
    if (!rl.next()) {
      rl.initialize();
      rl.name = tableName;
      rl.view = 'Default view';
      rlId = rl.insert();
    } else {
      rlId = rl.getUniqueValue();
    }

    var rle = new GlideRecord('sys_ui_related_list_entry');
    rle.addQuery('list_id', rlId);
    rle.addQuery('related_list', relListEntry);
    rle.query();
    if (!rle.next()) {
      rle.initialize();
      rle.list_id = rlId;
      rle.related_list = relListEntry;
      rle.position = 1;
      rle.insert();
      gs.print('Added Approval Request related list to form layout');
    }

    gs.print('--- PHASE_2_COMPLETED ---');
  `;

  const output = await client.runScript(script);
  console.log('Output:\n', output);
}

main().catch(console.error);
