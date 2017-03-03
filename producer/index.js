const { createChannel, EXCHANGES } = require('../rabbitmq')

const A_SECOND = 1000

const publish = (exchange, routingKey, message, options = {}) => {
  const content = new Buffer(JSON.stringify(message))

  return createChannel()
    .then(channel => channel.publish(exchange, routingKey, content, options))
}

const delayOptions = {
  headers: {
    'x-delay': A_SECOND * 5,
  },
}

const emit = () => {
  Promise.all([
    publish(EXCHANGES.DELAYED, '', { type: 'x-delayed-message' }, delayOptions),
    publish(EXCHANGES.DIRECT, '', { type: 'direct' }),
  ])
  .then(() => console.info('RabbitMQ: Test messages emitted!'))
  .catch(e => console.error(e))
}

module.exports = {
  publish,
  emit,
}
