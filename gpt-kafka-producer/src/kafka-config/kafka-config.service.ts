import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Kafka, Producer, Message } from 'kafkajs';

@Injectable()
export class KafkaConfigService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConfigService.name);
  private producer: Producer;

  constructor(@Inject('KAFKA_CLIENT') private readonly kafka: Kafka) {
    this.producer = this.kafka.producer();
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

  async sendMessage(topic: string, message: any, ctx: string): Promise<any> {
    this.logger.log(`Context: ${ctx} Sending message to topic ${topic}`);
    try {
      const kafkaMessage: Message = {
        value: JSON.stringify(message),
      };
      const result = await this.producer.send({
        topic,
        messages: [kafkaMessage],
      });
      this.logger.log(`Message sent successfully to topic ${topic}:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }
}
