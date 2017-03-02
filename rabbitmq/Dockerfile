FROM rabbitmq:3-management

RUN \
  apt-get update -y && \
  apt-get install -y wget

# NOTE: https://github.com/rabbitmq/rabbitmq-delayed-message-exchange
RUN \
  wget -P "/usr/lib/rabbitmq/lib/rabbitmq_server-${RABBITMQ_VERSION}/plugins/" https://bintray.com/rabbitmq/community-plugins/download_file?file_path=rabbitmq_delayed_message_exchange-0.0.1.ez

RUN \
  rabbitmq-plugins enable rabbitmq_delayed_message_exchange
