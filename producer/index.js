const { createChannel } = require('../rabbitmq')

const publish = (exchange, routingKey, message, options = {}) => {
  const content = new Buffer(JSON.stringify(message))

  return createChannel()
    .then(channel => channel.publish(exchange, routingKey, content, options))
}

module.exports = {
  publish,
}
