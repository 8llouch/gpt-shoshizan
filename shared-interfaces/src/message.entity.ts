import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';

@Entity('message')
@Index(['conversation', 'createdAt'])
@Index(['role']) 
@Index(['createdAt'])
export class MessageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column({ type: "varchar" })
  timestamp: string;

  @Column({ nullable: true })
  modelName?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  role: "system" | "user" | "assistant";

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
  conversation: ConversationEntity;

  @CreateDateColumn()
  createdAt: Date;
}
