# Project Demo Video Script & Walkthrough: Automated Network Request Management

This script outlines the video demonstration presentation (3 to 5 minutes) for the **Automated Network Request Management in ServiceNow** project.

---

## Video Outline & Timing

| Scene | Duration | Visual Display | Narration / Action Script |
| :--- | :--- | :--- | :--- |
| **Scene 1: Introduction** | 0:00 - 0:45 | Title Slide / Skillwallet Overview | "Hello everyone, my name is Kasturi Sandeep. Today I will demonstrate our project: Automated Network Request Management in ServiceNow. Network changes often suffer from manual bottlenecks, lack of audit trails, and slow fulfillment. Our solution automates request intake through the Service Portal, provides dynamic form validation, routes approvals automatically, and syncs execution states in real-time." |
| **Scene 2: Service Portal Submission** | 0:45 - 1:45 | Service Portal (`/sp`) -> "Network Request" item | "Here on the Service Portal, an employee navigates to the Service Catalog and selects 'Network Request'. Notice how the 'Requester Information' variable set auto-populates the logged-in user's details without manual entry. Now, watch what happens when I toggle 'Type of Connection': selecting 'Existing' dynamically triggers our Catalog UI Policy to reveal the mandatory 'Enter your Existing ID' field. Let's fill out the connection type, payment mode as UPI, address, and click 'Order Now'." |
| **Scene 3: Backend Record & Approval Relationship** | 1:45 - 2:45 | Native UI: `u_network_database.list` | "Immediately upon submission, our platform automation triggers. Navigating to our custom table `u_network_database`, we see record `NET0001002` created. Notice the auto-generated number, assigned to the 'Network Team', and state set to 'Awaiting Approval'. Scrolling down, observe the 'Approval Request' related list created via `sys_relationship`, linking this record directly to `sysapproval_approver`." |
| **Scene 4: Approval Lifecycle & Auto-Sync** | 2:45 - 3:45 | Approval row action -> Form refresh | "As the designated approver, I review the justification and approve the request directly from the related list. Upon clicking 'Approve', our synchronization business rule instantly executes. Notice the state automatically transitions from 'Awaiting Approval' to 'In Progress', and an audit entry is stamped in the Work Notes: 'Approval granted by System Administrator. Fulfillment task in progress.' In addition, notifications have been queued in the system email engine." |
| **Scene 5: Conclusion & Scalability** | 3:45 - 4:30 | Technical Blueprint diagram / Summary slide | "To conclude, this project demonstrates clean data architecture, modular variable sets, client-side UI policies, and automated approval orchestration without cumbersome technical debt. For future scalability, this system can integrate directly with network provisioning APIs (such as Cisco DNA or Ansible) to automatically provision VLANs and IP addresses. Thank you!" |

---

## Demonstration Checklist Before Recording
- [x] Open Service Portal: `https://dev382110.service-now.com/sp`
- [x] Pre-filter list view: `https://dev382110.service-now.com/u_network_database_list.do`
- [x] Verify approval list view: `https://dev382110.service-now.com/sysapproval_approver_list.do`
- [x] Verify microphone and screen recording resolution (1080p recommended).
