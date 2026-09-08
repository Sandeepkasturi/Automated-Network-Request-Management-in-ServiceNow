# Skillwallet Project Submission & Milestone Checklist

**Project Title:** Automated Network Request Management in ServiceNow  
**Assigned To:** Kasturi Sandeep  
**Instance URL:** `https://dev382110.service-now.com`  

---

## Phase-by-Phase Checklist & Deliverable Mapping

### Phase 1: Requirement Analysis & Planning (100% Completed)
- [x] **Business Objectives:** Defined operational efficiency, cycle time reduction, policy enforcement, and auditability.
- [x] **Functional Scope:** Catalog intake, dynamic forms, approval routing, automated notifications, and lifecycle tracking.
- [x] **Stakeholder Mapping:** Requesters, IT Admins, Approvers, and Network Fulfillment Team documented in [`docs/1_Functional_Overview.md`](file:///d:/Servicenow%20project/docs/1_Functional_Overview.md).
- [x] **Execution Roadmap:** 5-milestone roadmap (Catalog Creation, Form Setup, Approval Integration, Testing, Deployment).

### Phase 2: Backend Development & Configurations (100% Completed)
- [x] **Data Architecture:** Custom table `u_network_database` created with auto-numbering (`NET0001001`), reference fields (`sys_user`, `sys_user_group`), choice fields (`New/Existing`, `UPI/CARD`, `Awaiting Approval/In Progress/Completed/Rejected`), and work notes journal.
- [x] **Approval Request Relationship:** `sys_relationship` record "Approval Request" created linking `u_network_database` to `sysapproval_approver`.
- [x] **Related List Configuration:** Added "Approval Request" related list entry to default form layout of `u_network_database`.
- [x] **User Groups:** Configured `Network Team`, `Network Approvers`, and `Network Requesters` with administrator membership.

### Phase 3: UI/UX Development & Customization (100% Completed)
- [x] **Service Catalog Creation:** Created Category `Network` under `Service Catalog`.
- [x] **Variable Set Configuration:** Created `Requester Information` with `opened_on_behalf_of`, `user_name`, `email_id`, and `phone_number`.
- [x] **Catalog Item:** Configured `Network Request` with all 7 item-level variables (`requested_for`, `mobile_number`, `type_of_connection`, `existing_id`, `total_amount`, `mode_of_payment`, `address`).
- [x] **Catalog UI Policy:** Configured `Show Existing ID for Existing Connection` dynamically showing `existing_id` when `type_of_connection = Existing`.
- [x] **Client Script:** Dynamic auto-population script on `opened_on_behalf_of` change.

### Phase 4: Automation, Testing & Security (100% Completed)
- [x] **Submission Automation:** Business rule on `sc_req_item` mapping catalog variables into `u_network_database` and generating approval requests.
- [x] **Approval State Synchronization:** Business rule on `sysapproval_approver` automatically transitioning `u_network_database` state to `In Progress` upon approval and logging work notes.
- [x] **Events & Notifications:** Registered `network_request.submitted`, `network_request.approved`, `network_request.rejected` and linked email actions.
- [x] **Access Control Rules (ACLs):** Default CRUD ACLs active on `u_network_database`.
- [x] **QA Testing:** Automated simulation completed successfully (Verified REQ, RITM, NET record, approval, and state transitions).

### Phase 5: Deployment, Documentation & Final Presentation (100% Completed)
- [x] **Document Functional Overview:** [`docs/1_Functional_Overview.md`](file:///d:/Servicenow%20project/docs/1_Functional_Overview.md)
- [x] **Document Technical Blueprint:** [`docs/2_Technical_Blueprint.md`](file:///d:/Servicenow%20project/docs/2_Technical_Blueprint.md)
- [x] **Document Setup Manual:** [`docs/3_Setup_Manual.md`](file:///d:/Servicenow%20project/docs/3_Setup_Manual.md)
- [x] **Project Demo Video Planning & Script:** [`docs/4_Project_Demo_Script.md`](file:///d:/Servicenow%20project/docs/4_Project_Demo_Script.md)
- [x] **Troubleshooting & Diagnostics:** Trace logging and email verification tested and documented.
