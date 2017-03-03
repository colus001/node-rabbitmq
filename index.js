const express = require('express')
const bodyParser = require('body-parser')

const queueService = require('./services/queue')

const port = process.env.PORT || 5678
const env = process.env.NODE_ENV || 'development'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/messages', (req, res) => {
  const { message, reservedAt } = req.body
  const queueMessage = {
    message,
    reservedAt,
  }

  queueService(queueMessage)
    .add()
    .then(result => res.json(result))
    .catch(error => console.error(error))
})

require('./consumer').bind().then(() => {
  app.listen(port, () => console.log(`Node.js api server listening from ${port} in ${env}`))
})
