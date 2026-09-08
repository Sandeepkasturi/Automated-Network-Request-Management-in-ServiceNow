const path = require('path');

let authModule;
try {
  authModule = require(path.join(
    process.env.APPDATA,
    'npm/node_modules/@servicenow/sdk/node_modules/@servicenow/sdk-cli/dist/auth'
  ));
} catch (e) {
  console.error('Failed to load SDK auth module:', e.message);
}

class SNClient {
  constructor(alias = 'dev382110') {
    this.alias = alias;
    this.session = null;
    this.creds = null;
  }

  async init() {
    if (!this.session) {
      this.creds = await authModule.getCredentials(this.alias);
      this.session = await authModule.getSessionToken(this.creds);
    }
    return this;
  }

  get instanceUrl() {
    return this.creds.instanceUrl;
  }

  get cookie() {
    return this.session.cookie.getCookieStringSync(this.creds.instanceUrl);
  }

  get userToken() {
    return this.session.userToken || '';
  }

  async runScript(script) {
    await this.init();
    const res = await fetch(`${this.instanceUrl}/sys.scripts.do`, {
      method: 'POST',
      headers: {
        'Cookie': this.cookie,
        'X-UserToken': this.userToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        script: script,
        runscript: 'Run script'
      }).toString()
    });

    const html = await res.text();
    // Parse output inside <PRE> or between markers
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (preMatch) {
      return preMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }
    return html;
  }

  async tableApi(table, method = 'GET', body = null, queryParams = '') {
    await this.init();
    const url = `${this.instanceUrl}/api/now/table/${table}${queryParams ? '?' + queryParams : ''}`;
    const opts = {
      method,
      headers: {
        'Cookie': this.cookie,
        'X-UserToken': this.userToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    return res.json();
  }
}

module.exports = { SNClient };
