const Promise = require('bluebird')

const { createChannel, EXCHANGES, QUEUES } = require('../rabbitmq')

const NUMBER_OF_SIMULTANEOUS_CONSUMERS = 10
const A_MINUTE = 1000 * 60
const AN_HOUR = A_MINUTE * 60

const directExchangeOptions = {
  durable: true,
  noAck: false,
}

const delayedExchangeOptions = {
  durable: true,
  arguments: {
    'x-delayed-type': 'direct',
  },
}

const queueOptions = {
  durable: true,
  exclusive: true,
  messageTtl: AN_HOUR,
}

const consume = (Consumer, channel, queue) => {
  // Define how many messages are consumed simultaneously
  channel.prefetch(NUMBER_OF_SIMULTANEOUS_CONSUMERS)

  channel.consume(queue, (message) => {
    return Consumer
      .consume(message.content.toString())
      .then(() => channel.ack(message))
      .catch(() => channel.nack(message, false, !message.fields.redelivered))
  })
}

const getConsumer = (queue) => {
  switch (queue) {
    case QUEUES.MESSAGE:
      return {
        consume: message => new Promise((resolve, reject) => {
          if (!message) reject('MESSAGE_NOT_DELIVERED')
          console.info('Consuming message:', message)
          resolve(message)
        }),
      }
    default:
      return null
  }
}

const bind = () => {
  let channel = null

  return createChannel()
    .then(ch => (channel = ch))
    .then(() => [
      // Assert Exchanges for delivery
      channel.assertExchange(EXCHANGES.DIRECT, 'direct', directExchangeOptions).then(e => e.exchange),
      channel.assertExchange(EXCHANGES.DELAYED, 'x-delayed-message', delayedExchangeOptions).then(e => e.exchange),
      // Asser Queue for consumer
      channel.assertQueue(QUEUES.MESSAGE, queueOptions).then(q => q.queue),
    ])
    .spread((directExchange, delayedExchange, queue) => [
      channel.bindQueue(queue, directExchange, QUEUES.MESSAGE).then(() => queue),
      channel.bindQueue(queue, delayedExchange, QUEUES.MESSAGE).then(() => queue),
    ])
    .then(queues => Promise.map(queues, (queue) => {
      const Consumer = getConsumer(queue)
      if (!Consumer) console.error(`CONSUMER_NOT_FOUND: ${queue}`)
      return Consumer && consume(Consumer, channel, queue)
    }))
    .then(() => console.info('RabbitMQ: All consumer bound complete.'))
}

module.exports = {
  bind,
}
