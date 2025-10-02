import type { ReponseBaseType, TimeStamp } from "./common";

export type ChatBaseType = {
  chatRoomId: number;
  member1Id: number;
  member1Name: string;
  member2Id: number;
  member2Name: string;
  createdAt: TimeStamp;
};

export type ChatRequestType = {
  opponentId: number;
};

export type ChatResponseType = ReponseBaseType & {
  data: ChatBaseType;
};

export type MessageBaseType = {
  messageId: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: string;
  contentType: string;
  createdAt: TimeStamp;
};

export type MessageResponseType = ReponseBaseType & {
  data: MessageBaseType[];
};

export type MyChatBaseType = {
  chatRoomId: number;
  otherMemberId: number;
  otherMemberName: string;
  lastMessage: string;
  lastMessageAt: TimeStamp;
  unreadCount: number;
  status: "OPEN" | "CLOSE";
};

export type MyChatResponseType = ReponseBaseType & {
  data: MyChatBaseType[];
};

export type EvaluateRequestType = {
  memberId: number;
  rate: number;
  review: string;
};

export type EvaluateBaseType = {
  id: number;
  rate: number;
  review: string;
};

export type EvaluateResponseType = ReponseBaseType & {
  data: EvaluateBaseType;
};

export interface RenderMsgProps {
  sender: string;
  text: string;
  at?: string;
}

export type ApplyChatRequestType = {
  receiverId: number;
};

export type ApplyChatResponseType = ReponseBaseType & {};

export type ChangeChatStatusRequestType = {
  coffeeChatId: number;
  status: "REQUESTED" | "ACCEPTED" | "DECLINED" | "COMPLETED";
};

export type ChangeChatStatusResponseType = ReponseBaseType & {};
