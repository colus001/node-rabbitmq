const Promise = require('bluebird')
const amqp = require('amqplib')

const RABBITMQ_URI = 'amqp://colus001:12345678@localhost:25672'

const QUEUES = {
  MESSAGE: 'message',
}

const EXCHANGES = {
  DIRECT: 'direct',
  DELAYED: 'delayed',
}

let channel = null
const createChannel = () => {
  if (channel) return Promise.resolve(channel)

  return amqp
    .connect(RABBITMQ_URI)
    .then(connection => connection.createChannel())
    .then(ch => (channel = ch || true) && channel)
}

module.exports = {
  QUEUES,
  EXCHANGES,
  createChannel,
}
