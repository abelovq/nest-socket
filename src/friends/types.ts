import { User } from 'src/users/types';

export type Friend = User;
export type AddToFriendsDto = {
  id: number;
};

export type RemoveFromFriendsDto = AddToFriendsDto;

export type AddToFriendsDetails = {
  id: number;
};

export type RemoveFromFriendsDetails = AddToFriendsDetails;

export type GetAllFriendsOfCurrUserDto = {
  id: number;
};
