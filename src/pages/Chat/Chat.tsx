import type { MyChatBaseType } from "@/interfaces/chat";
import ChatItem from "./_components/ChatItem";
import { useEffect, useState } from "react";
import { RetrieveMyChat } from "@/services/chat/chatService";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const [myRooms, setMyRooms] = useState<MyChatBaseType[]>([]);

  // Retrieve my chat room
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const res = await RetrieveMyChat();
        setMyRooms(res.data);
        console.log(res.data);
      } catch (e) {
        console.error("내 채팅방 목록 조회 실패:", e);
      }
    };

    fetchChatRooms();
  }, []);

  type ChatNavType = {
    chatRoomId: number;
    otherMemberId: number;
    status: "OPEN" | "CLOSE";
    unreadCount: number;
    otherMemberName: string;
  };

  const handleClickRoom = ({
    chatRoomId,
    otherMemberId,
    otherMemberName,
    status,
    unreadCount,
  }: ChatNavType) => {
    navigate(`${chatRoomId}`, {
      state: { otherMemberId, status, unreadCount, otherMemberName },
    });
  };

  if (myRooms.length == 0) {
    return (
      <div className="wrapper label noRooms">아직 생성된 채팅방이 없어요.</div>
    );
  }

  return (
    <div className="wrapper">
      {/* chatroom */}
      {myRooms.map((item, idx) => (
        <ChatItem
          key={idx}
          item={item}
          bgColor={idx % 2 === 0 ? "even" : "odd"}
          onClick={() =>
            handleClickRoom({
              chatRoomId: item.chatRoomId,
              otherMemberId: item.otherMemberId,
              status: item.status,
              unreadCount: item.unreadCount,
              otherMemberName: item.otherMemberName,
            })
          }
        />
      ))}
    </div>
  );
};

export default Chat;
