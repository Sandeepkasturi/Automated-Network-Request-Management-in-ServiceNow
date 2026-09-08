# Automated Network Request Management in ServiceNow

[![ServiceNow](https://img.shields.io/badge/ServiceNow-PDI%20dev382110-388E3C?logo=servicenow)](https://dev382110.service-now.com)
[![Status](https://img.shields.io/badge/Implementation-100%25%20Verified-0288D1)]()
[![Documentation](https://img.shields.io/badge/Documentation-5%20Phases%20Complete-7B1FA2)]()

A complete, enterprise-grade, automated network request management system developed on **ServiceNow PDI `dev382110.service-now.com`** for the **ServiceNow Global Certification / Skillwallet Program**.

---

## 🚀 Live System Links (Instance `dev382110`)

* **Service Portal Submission:** [https://dev382110.service-now.com/sp?id=sc_cat_item&sys_id=909c98bf3bcb0b10fa7eedc643e45ac1](https://dev382110.service-now.com/sp?id=sc_cat_item&sys_id=909c98bf3bcb0b10fa7eedc643e45ac1)
* **Custom Network Database Table:** [https://dev382110.service-now.com/u_network_database_list.do](https://dev382110.service-now.com/u_network_database_list.do)
* **Catalog Item Maintain Items:** [https://dev382110.service-now.com/sc_cat_item.do?sys_id=909c98bf3bcb0b10fa7eedc643e45ac1](https://dev382110.service-now.com/sc_cat_item.do?sys_id=909c98bf3bcb0b10fa7eedc643e45ac1)
* **Approvals Engine:** [https://dev382110.service-now.com/sysapproval_approver_list.do](https://dev382110.service-now.com/sysapproval_approver_list.do)

---

## 📁 Project Documentation Package

1. [**Functional Overview**](file:///d:/Servicenow%20project/docs/1_Functional_Overview.md): Business objectives, scope, stakeholder mapping, and lifecycle diagram.
2. [**Technical Blueprint**](file:///d:/Servicenow%20project/docs/2_Technical_Blueprint.md): Full data dictionary, table schemas, relationships, and rule matrix.
3. [**Setup Manual**](file:///d:/Servicenow%20project/docs/3_Setup_Manual.md): Step-by-step navigation, testing, and administration instructions.
4. [**Project Demo Script**](file:///d:/Servicenow%20project/docs/4_Project_Demo_Script.md): 3-5 minute video walkthrough script and scene guide.
5. [**Skillwallet Submission Checklist**](file:///d:/Servicenow%20project/docs/5_Skillwallet_Submission_Checklist.md): Detailed task-by-task checklist mapped to all 5 Skillwallet project phases.

---

## ⚙️ Automation & Verification Scripts

The [`scripts/`](file:///d:/Servicenow%20project/scripts) directory contains the automation engine used to provision and verify the solution:

* [`scripts/snClient.js`](file:///d:/Servicenow%20project/scripts/snClient.js): Authenticated ServiceNow REST API and script client.
* [`scripts/createColumns.js`](file:///d:/Servicenow%20project/scripts/createColumns.js): Table schema, field types, choices, and numbering.
* [`scripts/deployPhase2Remaining.js`](file:///d:/Servicenow%20project/scripts/deployPhase2Remaining.js): Groups, relationships, and related lists.
* [`scripts/deployPhase3Catalog.js`](file:///d:/Servicenow%20project/scripts/deployPhase3Catalog.js): Service catalog item, variables, variable sets, and UI policies.
* [`scripts/deployPhase4Automation.js`](file:///d:/Servicenow%20project/scripts/deployPhase4Automation.js): Business rules, notifications, and event registry.
* [`scripts/ensureNumbering.js`](file:///d:/Servicenow%20project/scripts/ensureNumbering.js): Automated numbering engine for `u_network_database`.
* [`scripts/verifyEndToEnd.js`](file:///d:/Servicenow%20project/scripts/verifyEndToEnd.js): End-to-end integration simulation test.

To re-run the end-to-end test at any time:
```powershell
node scripts/verifyEndToEnd.js
```
