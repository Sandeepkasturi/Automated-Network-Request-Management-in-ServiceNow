# Technical Blueprint: Automated Network Request Management

## 1. System Architecture & Metadata Artifacts

The application combines ServiceNow's Service Catalog engine with a custom backend record architecture and event-driven automation.

```text
┌────────────────────────────────────────────────────────┐
│             Service Portal UI (/sp)                    │
│   Catalog Item: "Network Request"                      │
│   Category: "Network"  | Catalog: "Service Catalog"    │
└──────────────────────────┬─────────────────────────────┘
                           │ Catalog Submission
                           ▼
┌────────────────────────────────────────────────────────┐
│             ServiceNow Service Catalog Engine          │
│   1. sc_request (REQ)                                  │
│   2. sc_req_item (RITM) with attached variables       │
│   3. Catalog UI Policy: Show Existing ID               │
└──────────────────────────┬─────────────────────────────┘
                           │ Trigger (Business Rule / Flow)
                           ▼
┌────────────────────────────────────────────────────────┐
│           Custom Table: u_network_database             │
│   - u_number (Prefix: NET0001001)                      │
│   - u_type_of_connection (New / Existing)              │
│   - u_existing_id, u_total_amount, u_mode_of_payment   │
│   - u_state (New, Awaiting Approval, In Progress, ...) │
│   - u_assignment_group (Network Team)                  │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
   Relationship│                           │Approval
   "Approval Request"                      │State Sync
               ▼                           ▼
┌──────────────────────────┐    ┌────────────────────────┐
│  sysapproval_approver    │    │ Notifications & Events │
│  (State: requested/      │───>│ - network_request.     │
│          approved/       │    │     submitted/approved │
│          rejected)       │    │ - sysevent_email_action│
└──────────────────────────┘    └────────────────────────┘
```

---

## 2. Data Model (`u_network_database`)

| Field Element | Label | Type | Max Length | Reference / Choices | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `u_number` | Number | String | 40 | Display: True | Auto-numbered with prefix `NET` via `sys_number` counter |
| `u_opened_on_behalf_of` | Opened on behalf of | Reference | 32 | `sys_user` | Requesting employee profile |
| `u_requested_for` | Requested For | String | 100 | - | Name of recipient |
| `u_user_name` | User Name | String | 100 | - | Username of requester |
| `u_email_id` | Email ID | String | 100 | - | Contact email |
| `u_phone_number` | Phone Number | String | 40 | - | Landline / office extension |
| `u_mobile_number` | Mobile Number | String | 40 | - | Mobile contact |
| `u_type_of_connection` | Type of Connection | String | 40 | Choices: `New`, `Existing` | Classification of service |
| `u_existing_id` | Existing ID | String | 100 | - | Required if connection is `Existing` |
| `u_total_amount` | Total Amount | String | 40 | - | Fee associated with request |
| `u_mode_of_payment` | Mode of Payment | String | 40 | Choices: `UPI`, `CARD` | Payment gateway / mode |
| `u_address` | Address | String | 500 | - | Destination address |
| `u_state` | State | String | 40 | `New`, `Awaiting Approval`, `In Progress`, `Completed`, `Rejected` | Lifecycle tracking |
| `u_assignment_group` | Assignment Group | Reference | 32 | `sys_user_group` (`Network Team`) | Responsible queue |
| `u_assigned_to` | Assigned to | Reference | 32 | `sys_user` | Engineer assigned |
| `u_work_notes` | Work Notes | Journal Input | 4000 | - | Internal audit history |

---

## 3. Relationships (`sys_relationship`)
* **Name:** `Approval Request`
* **Applies to Table:** `u_network_database`
* **Queries from Table:** `sysapproval_approver`
* **Query Condition Script:**
```javascript
(function refineQuery(current, parent) {
    current.addQuery('sysapproval', parent.sys_id);
})(current, parent);
```
* **Form Related List:** Added as related list `Approval Request` to default view of `u_network_database`.

---

## 4. Service Catalog Artifacts
* **Category:** `Network` (`fa8cd0b73b8b0b10fa7eedc643e45a21`) under `Service Catalog` (`e0d08b13c3330100c8b837659bba8fb4`).
* **Catalog Item:** `Network Request` (`909c98bf3bcb0b10fa7eedc643e45ac1`).
* **Variable Set:** `Requester Information` (`requester_information`).
* **Catalog UI Policy:** `Show Existing ID for Existing Connection`
  * Condition: `type_of_connection = Existing`
  * Action: `existing_id` Visible = `true`, Mandatory = `true`. Reverse if false = `true`.

---

## 5. Automation Rules & Notification Matrix

### Business Rule: Process Network Request Submission
* **Table:** `sc_req_item`
* **Trigger:** After Insert when `cat_item = Network Request`
* **Logic:**
  1. Instantiates record in `u_network_database`.
  2. Copies all catalog variables to mapped database fields.
  3. Sets state to `Awaiting Approval`.
  4. Creates `sysapproval_approver` entry targeting the network record.
  5. Fires event `network_request.submitted`.

### Business Rule: Sync Network Request Approval State
* **Table:** `sysapproval_approver`
* **Trigger:** After Update when `source_table = u_network_database` and state changes to `approved` or `rejected`.
* **Logic:**
  1. Retrieves target `u_network_database` record via `current.sysapproval`.
  2. If `approved`: updates state to `In Progress`, writes work notes with approver name, and triggers `network_request.approved`.
  3. If `rejected`: updates state to `Rejected`, writes rejection reason, and triggers `network_request.rejected`.
