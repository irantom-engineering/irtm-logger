# irtm-logger

irtm-logger saves all related data from each endpoint (request &amp; response) in all micro-services 

## Installation

Using npm:
```shell
$ npm install irtm-logger
```
Note: add `--save` if you are using npm < 5.0.0

In Node.js save any endpoint action by having `objectId`, `objectType`, endpoint request (`req`) & response (`res`):
```js

// Load irtm-logger
const Logs = require('irtm-logger')

// save endpoint action
Logs.send(objectId, objectType, req, res)

```

