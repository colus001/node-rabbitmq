const moment = require('moment')

const Producer = require('../producer')
const { EXCHANGES, QUEUES } = require('../rabbitmq')

const getDelayHeader = reservedAt => (reservedAt
  ? {
    headers: {
      'x-delay': moment(reservedAt).diff(moment()),
    },
  }
  : {}
)

const queueService = ({ message, reservedAt }) => {
  const exchange = reservedAt ? EXCHANGES.DELAYED : EXCHANGES.DIRECT
  const queue = QUEUES.MESSAGE

  return {
    add() {
      return Producer
        .publish(exchange, queue, message, getDelayHeader(reservedAt))
        .then(() => {
          console.log('Queue added:', message)
          return {
            exchange,
            queue,
          }
        })
    },
  }
}

module.exports = queueService
