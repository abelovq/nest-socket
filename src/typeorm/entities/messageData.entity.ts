import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class MessageData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ default: 'image' })
  type: 'image' | 'video';

  @ManyToOne(() => Message, (message) => message.data, {
    // Make sure that when you delete or update a user, it will affect the
    // corresponding `AddressEntity`
    cascade: true,
    // Make sure when you use `preload`, `AddressEntity` of the user will also
    // return (This means whenever you use any kind of `find` operations on
    // `UserEntity`, it would load this entity as well)
    eager: true,
  })
  message: Message;
}
