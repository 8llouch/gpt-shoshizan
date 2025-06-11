import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
import { ModelOptions } from ".";

@Entity()
export class ConversationEntity {
  @PrimaryColumn()
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
