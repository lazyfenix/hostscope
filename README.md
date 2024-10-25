<div align="center">
  <img alt="HostScope-Banner" src="https://cdn.discordapp.com/attachments/1224721230825783386/1299263994804047883/banner.png?ex=671c9163&is=671b3fe3&hm=64baec3fbd1a2d57becd4042b0d5b25d52202500c6b9295445bf3395845307de&" />
</div>

<p align="center">A service monitoring tool for checking the status of various services.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hostscope">
    <img alt="version" src="https://img.shields.io/npm/v/hostscope" />
  </a>

  <a href="https://www.npmjs.com/package/hostscope">
    <img alt="license" src="https://img.shields.io/npm/l/hostscope" />
  </a>
</p>

<h1>Getting Started</h1>
<h2>Installation</h2>

<h4>Using NPM:</h4>


```
npm install hostscope
```


<h4>Using YARN:</h4>


```
yarn add hostscope
```

<h2>Usage</h2>

<h4>Monitor Options</h4>

<details>

  <summary>View all of the available options.</summary>


  <br />


- `name`

- `host`

- `method`

- `port`


</details>

<details>

  <summary>View all of the available methods.</summary>


  <br />


- `TCP`

- `UDP`

- `GET`

- `PING`


</details>

<br />

<h4>Import and usage example</h4>    

```js

// Import hostscope
const HostScope = require('hostscope').default;

// Initialize the HostScope instance
const hostScope = new HostScope();

// Add a service to test (TCP example)
hostScope.addService('Google', { host: 'google.com', method: 'TCP', port: 8080 });

// Check the status of the services
(async () => {
    console.log('Checking Google TCP status:');
    await hostScope.getStatus('Google');  // Checking Google

})();

```

<h4>Output example</h4>

```

Checking Google TCP status:
{
  "Google": {
    "host": "google.com",
    "port": 80,
    "method": "tcp",
    "status": "Online",
    "latency": "150 ms"
  }
}
```
<h2>Do you have any issues?</h2>

<p>

  > If you have any issues don't hesitate to report it via  <a href="https://github.com/lazyfenix/hostscope/issues">GitHub Issues</a>.

</p>

<p>

> This package was made by @lazyfenix.</p>