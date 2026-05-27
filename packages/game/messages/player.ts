export type MoveMessage = {
  type: 'move';
  direction: 'left' | 'right';
};

export type JumpMessage = {
  type: 'jump';
};

export type StopMessage = {
  type: 'stop';
};

export type PlayerActorMessage = MoveMessage | JumpMessage | StopMessage;
