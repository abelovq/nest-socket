export type Status = 'offline' | 'online';

export type User = {
  email: string;
  name: string;
  id: number;
  status: Status;
  password: string;
};

export interface IUsersService {
  findUserByEmail(email: string): Promise<User | null>;
}

export type findUserByIdDetails = {
  id: number;
  order?: 'ASC' | 'DESC';
};
