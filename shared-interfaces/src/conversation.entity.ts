import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { MessageEntity } from "./message.entity";
import { UserEntity } from "./user.entity";
import { ModelOptions } from ".";

@Entity()
@Index(['userId', 'createdAt']) 
@Index(['updatedAt']) 
export class ConversationEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "jsonb", nullable: true })
  systemPrompt: string;

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];

  @Column({ type: "jsonb" })
  responses: {
    id: string;
    content: string;
    timestamp: number;
    modelName?: string;
    imageUrl?: string;
    role: "system" | "user" | "assistant";
  }[];

  @Column({ type: "jsonb", nullable: true })
  modelOptions: ModelOptions;

  @Column({ type: "jsonb", nullable: true })
  apiMetrics: {
    total_duration?: number;
    load_duration?: number;
    prompt_eval_duration?: number;
    eval_duration?: number;
    eval_count?: number;
  };

  @Column({ type: "jsonb", nullable: true })
  context: number[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
