export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
}

export enum Services {
  AUTH = 'AUTH_SERVICE',
  USERS = 'USERS_SERVICE',
  CONVERSATION = 'CONVERSATION_SERVICE',
  MESSAGES = 'MESSAGES_SERVICE',
  FRIENDS = 'FRIENDS_SERVICE',
  MESSAGEDATA = 'MESSAGEDATA_SERVICE',
}

export enum Role {
  User = 'user',
  Admin = 'admin',
}

export type SaveEntity = {
  entity: any;
  updatedFields: any;
  id: number;
};

export enum Events {
  LOGIN_NEW_PARTICIPANT = 'LOGIN_NEW_PARTICIPANT',
  JOIN_NEW_PARTICIPANT = 'JOIN_NEW_PARTICIPANT',
  LOGIN_NEW_PARTICIPANTS = 'LOGIN_NEW_PARTICIPANTS',
  JOIN_NEW_PARTICIPANTS = 'JOIN_NEW_PARTICIPANTS',
  LOGOUT = 'LOGOUT',
  RECONNECT = 'RECONNECT',
  RECEIVE_PRIVATE_MESSAGE = 'RECEIVE_PRIVATE_MESSAGE',
  SEND_PRIVATE_MESSAGE = 'SEND_PRIVATE_MESSAGE',
  SEND_PRIVATE_MESSAGES = 'SEND_PRIVATE_MESSAGES',
  TYPING = 'TYPING',
  WHO_TYPING = 'WHO_TYPING',
  STOP_TYPING = 'STOP_TYPING',
  READ_MESSAGE = 'READ_MESSAGE',
  READ_MESSAGE_DONE = 'READ_MESSAGE_DONE',
  EDIT_MESSAGE = 'EDIT_MESSAGE',
  EDIT_MESSAGE_DONE = 'EDIT_MESSAGE_DONE',
}
