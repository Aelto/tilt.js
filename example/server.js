const express = require('express')
const path = require('path')
const app = express()

app.use('/', express.static(__dirname))
app.use('/src', express.static(path.join(__dirname, '../src')))

app.listen(3000)
console.log('server started on port 3000')
