import { Status } from 'src/users/types';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  status: Status;

  @Column({ default: null })
  socketId: string;

  @ManyToMany(() => Conversation, (conversation) => conversation.users)
  conversations: Conversation[];

  @OneToMany(() => Message, (message) => message.user, { cascade: true })
  messages: Message[];

  @Column('simple-json', { nullable: true })
  friends: number[];
}
