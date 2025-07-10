import {
  Injectable,
  OnModuleInit,
  Logger,
  Inject,
  OnModuleDestroy,
} from '@nestjs/common';
import { Kafka, Producer, Message } from 'kafkajs';

@Injectable()
export class KafkaConfigService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConfigService.name);
  private producer: Producer;

  constructor(@Inject('KAFKA_CLIENT') private readonly kafka: Kafka) {
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false, // Disable auto topic creation
      idempotent: true, // Enable idempotence for exactly-once delivery
      maxInFlightRequests: 1, // Limit to one in-flight request per partition
      retry: {
        retries: 5, // Number of retries for failed messages
        initialRetryTime: 100, // Initial retry time in milliseconds
        maxRetryTime: 30000, // Maximum retry time in milliseconds
      },
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to Kafka...');
    try {
      await this.producer.connect();
      this.logger.log('Successfully connected to Kafka');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka:', error);
      throw error;
    }
  }

  async sendMessage(
    topic: string,
    message: any,
    key: string,
    ctx: string,
  ): Promise<any> {
    this.logger.log(
      `Context: ${ctx} Sending message to topic ${topic} with conversation key ${key}`,
    );
    try {
      const kafkaMessage: Message = {
        key: key,
        value: JSON.stringify(message),
      };
      const result = await this.producer.send({
        topic,
        messages: [kafkaMessage],
        acks: -1, // Wait for all in-sync replicas to acknowledge
        timeout: 30000, // Set a timeout for the send operation
        compression: 1, // Use gzip compression for the message
      });
      this.logger.log(`Message sent successfully to topic ${topic}:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Kafka...');
    try {
      await this.producer.disconnect();
      this.logger.log('Successfully disconnected from Kafka');
    } catch (error) {
      this.logger.error('Failed to disconnect from Kafka:', error);
    }
  }
}
