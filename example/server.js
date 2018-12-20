const express = require('express')
const path = require('path')
const app = express()

app.use('/', express.static(__dirname))
app.use('/dist', express.static(path.join(__dirname, '../dist')))
app.use('/src', express.static(path.join(__dirname, '../src')))

app.listen(3000)
console.log('server started on http://localhost:3000/')
