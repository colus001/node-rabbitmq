import moment from 'moment'

import Producer from '../producer'

import { EXCHANGES, QUEUES } from '../rabbitmq'

const QUEUE_TYPES = {
  TEST_DIRECT: 'test-direct',
  TEST_DELAYED: 'test-delayed',
}

const getDelayHeader = reservedAt => (reservedAt
  ? {
    headers: {
      'x-delay': moment(reservedAt).diff(moment()),
    },
  }
  : {}
)

const getIdentifiers = (type) => {
  switch (type) {
    case QUEUE_TYPES.TEST_DIRECT:
      return {
        exchange: EXCHANGES.DIRECT,
        queue: QUEUES.MESSAGE,
      }
    case QUEUE_TYPES.TEST_DELAYED:
      return {
        exchange: EXCHANGES.DELAYED,
        queue: QUEUES.MESSAGE,
        isDelayed: true,
      }
    default:
      return {}
  }
}

const queueService = (type, message) => {
  const { exchange, queue, isDelayed } = getIdentifiers(type)

  return {
    add() {
      if (!isDelayed) return Producer.publish(exchange, queue, message)

      return Producer
        .publish(exchange, queue, message, getDelayHeader(message.reservedAt))
        .then(() => {
          console.log('Queue added:', message)
          return message
        })
    },
  }
}

exports.QUEUE_TYPES = QUEUE_TYPES

export default queueService
