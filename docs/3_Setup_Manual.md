# Setup & Administration Manual: Automated Network Request Management

This manual provides the step-by-step instructions for administrators and evaluators to verify, configure, and operate the Automated Network Request Management solution on the ServiceNow PDI (`https://dev382110.service-now.com`).

---

## 1. Prerequisites & Access Details
* **Instance URL:** `https://dev382110.service-now.com`
* **Service Portal:** `https://dev382110.service-now.com/sp`
* **Admin Username:** `admin`
* **Password:** `R!BUOg71gmf!`

---

## 2. Navigating to Components in ServiceNow

### A. Accessing the Custom Table
1. Open the ServiceNow Application Navigator (Filter navigator on top left).
2. Type `u_network_database.list` and press **Enter**.
3. You will see all generated network requests (e.g. `NET0001001`, `NET0001002`).
4. Click into any record:
   - Notice the form fields: Requested For, Opened on behalf of, Type of Connection, Mode of Payment, State, Assignment Group.
   - Scroll to the bottom to view the **Approval Request** related list!

### B. Accessing the Service Catalog Item
1. In the Filter Navigator, search for `Maintain Items` (under **Service Catalog**).
2. Search for `Network Request`.
3. Open the record:
   - Notice the Category: `Network`.
   - In the **Variables** related list, observe the 7 item-level variables.
   - In the **Variable Sets** related list, observe `Requester Information`.
   - In the **Catalog UI Policies** related list, observe `Show Existing ID for Existing Connection`.

### C. Testing in the Service Portal (`/sp`)
1. Open a new browser tab and navigate to:
   ```
   https://dev382110.service-now.com/sp
   ```
2. In the central search bar, type `Network Request` and click on the item.
3. Observe the form:
   - **Requester Information** is automatically populated with your user profile (name, email, phone).
   - Click the **Type of Connection** dropdown:
     - When set to **New**: The "Enter your Existing ID" field is hidden.
     - When switched to **Existing**: The "Enter your Existing ID" field dynamically appears and is mandatory!
4. Fill in:
   - **Requested For:** `Kasturi Sandeep`
   - **Mobile Number:** `+91 9876543210`
   - **Type of Connection:** `Existing`
   - **Enter your Existing ID:** `NET-1092`
   - **Total Amount:** `500`
   - **Mode of Payment:** `UPI`
   - **Address:** `Floor 2, North Wing, IT Hub`
5. Click **Order Now** / **Submit**.

---

## 3. Approving the Request & Verifying Lifecycle
1. Once submitted, navigate back to `u_network_database.list`.
2. Open the newly created record:
   - State will be: **Awaiting Approval**.
   - Assignment Group will be: **Network Team**.
3. Scroll to the **Approval Request** related list at the bottom of the form.
4. Right-click on the approval row (State: `Requested`) and select **Approve**.
5. Refresh the form:
   - State automatically changes to: **In Progress**!
   - In the **Work Notes** journal, notice the audit entry:
     `Approval granted by System Administrator. Fulfillment task in progress.`

---

## 4. Troubleshooting & Operational Diagnostics
* **System Logs:**
  - Navigate to **System Logs > System Log > All** and filter for `Process Network Request` to view execution traces.
* **Email Logs:**
  - Navigate to **System Logs > Emails** to view outgoing notifications (`Network Request Submitted`, `Network Request Approved`).
