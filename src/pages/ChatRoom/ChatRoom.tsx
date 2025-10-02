import type { RenderMsgProps } from "@/interfaces/chat";
import { RetrieveSpecificChat } from "@/services/chat/chatService";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import sendIcon from "@/assets/Chat/sendIcon.svg";
import { createStompClient, type IncomingChatMsg } from "@/utils";
import type { Client } from "@stomp/stompjs";
import { useLayout } from "@/services/hooks/useLayout";
import { getMyProfile } from "@/services/home/memberService";
import formatTime from "../Chat/_utils/formatTime";

const ChatRoom = () => {
  const { setLayoutConfig } = useLayout();
  const location = useLocation();
  const otherMemberId = location.state.otherMemberId;
  const otherMemberName = location.state.otherMemberName;
  const isClosed = location.state.status == "CLOSED";
  const unreadCount = location.state.unreadCount;
  const [moreClick, setMoreClick] = useState<Boolean>(false);
  const navigate = useNavigate();
  const instruction = "채팅종료까지 남은 시간";
  const clientRef = useRef<Client | null>(null);
  const [msg, setMsg] = useState("");
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const [messages, setMessages] = useState<RenderMsgProps[]>([]);
  const [myName, setMyName] = useState<string>("");
  const socketEndpoint = "/ws-connect";
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);

  useEffect(() => {
    if (isClosed) return;
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isClosed]);

  // 형식화된 시간 반환 (MM:SS)
  const formatTimeLeft = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // initial header & bottom setting
  useEffect(() => {
    setLayoutConfig({
      type: "back-more",
      showHeader: true,
      title: otherMemberName,
      showBottomBar: false,
      onBack: () => {
        hanldleClickBack();
      },
      onMore: () => {
        handleClickMore();
      },
    });
  }, [setLayoutConfig]);

  const hanldleClickBack = () => {
    console.log("onBack clicked");
    navigate(-1);
  };

  const handleClickMore = () => {
    console.log("onMore clicked");
    setMoreClick((prev) => !prev);
  };

  const init = async () => {
    if (!chatRoomId) return;
    try {
      // 1. load past message
      const res = await RetrieveSpecificChat(Number(chatRoomId));
      const formatted = (res.data ?? []).map((m: any) => ({
        sender: m.senderName,
        text: m.content,
        at: formatTime(m.createdAt),
      }));
      setMessages(formatted);

      // 2. get my profile
      const myProfile = await getMyProfile();
      if (myProfile) {
        setMyName(myProfile.nickname);
      }

      // 3. connect STOMP
      const client = createStompClient(
        socketEndpoint,
        Number(chatRoomId),
        (serverMsg: IncomingChatMsg) => {
          setMessages((prev) => {
            if (
              prev.some(
                (m) => m.at === serverMsg.sentAt && m.text === serverMsg.content
              )
            ) {
              return prev;
            }
            return [
              ...prev,
              {
                sender: serverMsg.senderName,
                text: serverMsg.content,
                at: serverMsg.sentAt,
              },
            ];
          });
        }
      );

      clientRef.current = client;
    } catch (err: unknown) {
      console.error("failed to initialize room", err);
    }
  };

  // start initial setting
  useEffect(() => {
    init();
  }, [chatRoomId]);

  // handle click send btn
  const handleSendMessage = () => {
    if (!msg.trim() || !clientRef.current || !chatRoomId) return;

    const payload = {
      chatRoomId: chatRoomId,
      content: msg,
      contentType: "TEXT",
      messageType: "CHAT",
    };

    clientRef.current.publish({
      destination: "/pub/chat.send",
      body: JSON.stringify(payload),
    });

    setMsg("");
  };

  const handleClickQuit = (otherMemberId: number) => {
    console.log("quit btn is clicked");
    navigate("/review", { state: { otherMemberId, chatRoomId } });
  };

  const handleClickReport = () => {
    console.log("report btn is clicked");
  };

  return (
    <div className="wrapper">
      {/* more modal */}
      {moreClick && (
        <div className="moreBox body">
          <div
            className="moreBox__top"
            onClick={() => handleClickQuit(otherMemberId)}
          >
            대화 종료하기
          </div>
          <div className="moreBox__bottom" onClick={() => handleClickReport()}>
            신고하기
          </div>
        </div>
      )}
      <div className="chatRoom">
        {/* instruction */}
        <div className="chatRoom__instruction caption1">
          {instruction}
          <span className="chatRoom__timer">
            {isClosed ? "00:00" : formatTimeLeft(timeLeft)}
          </span>
        </div>
        {/* chatting */}
        <div className="chatRoom__list">
          {messages.map((chat, idx) => {
            const isMyMsg = chat.sender === myName;
            const isUnread =
              unreadCount > 0 && idx >= messages.length - unreadCount;

            return (
              <div
                key={idx}
                className={`chatRoom__bubble ${isMyMsg ? "my" : "your"} ${
                  isUnread ? "unread" : ""
                }`}
              >
                {/* 이름은 왼쪽 또는 오른쪽에 표시 */}
                <div className={`chatRoom__name label`}>
                  {isMyMsg ? "나" : chat.sender}
                </div>

                {/* 메시지 내용 */}
                <div
                  className={isMyMsg ? "chatRoom__myMsg" : "chatRoom__yourMsg"}
                >
                  <div
                    className={
                      isMyMsg
                        ? "chatRoom__myContent body"
                        : "chatRoom__yourContent body"
                    }
                  >
                    {chat.text}

                    {/* 읽지 않은 메시지 표시 */}
                    {isUnread && (
                      <div
                        className={`${
                          isMyMsg
                            ? "chatRoom__unReadRight"
                            : "chatRoom__unReadLeft"
                        } caption2`}
                      >
                        1
                      </div>
                    )}
                  </div>

                  {/* 메시지 시간 */}
                  {chat?.at && (
                    <div
                      className={`${
                        isMyMsg ? "chatRoom__timeRight" : "chatRoom__timeLeft"
                      } caption2`}
                    >
                      {chat.at}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isClosed && (
          <div className={`chatRoom__closed caption1`}>
            {otherMemberName} 님이 대화를 종료하셨어요.
          </div>
        )}

        {/* input */}
        <div className="chatRoom__inputBox">
          {isClosed ? (
            <textarea
              rows={3}
              disabled
              className="chatRoom__input body"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="종료된 채팅입니다."
            />
          ) : (
            <textarea
              rows={3}
              className="chatRoom__input body"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="보낼 메시지를 입력하세요"
            />
          )}

          <button>
            <img src={sendIcon} alt="sendIcon" onClick={handleSendMessage} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
