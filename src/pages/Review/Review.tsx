import ratingIcon from "@/assets/Chat/ratingIcon.svg";
import ratingDisabledIcon from "@/assets/Chat/ratingDisabledIcon.svg";
import { useEffect, useState } from "react";
import { useLayout } from "@/services/hooks/useLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { ChangeChatStatus, EvaluateScore } from "@/services/chat/chatService";

const Review = () => {
  const title = "오늘의 대화는 얼마나 따뜻했나요?";
  const subTitle = "찻잔 개수로 대화의 온기를 표현해주세요.";
  const [rating, setRating] = useState<number>(1);
  const wordTitle = "한 마디 남기기";
  const [word, setWord] = useState<string>("");
  const wordEx = "ex. 오늘 대화 정말 즐거웠어요. ";
  const buttonTitle = "온기 남기기";

  const { setLayoutConfig } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const otherMemberId = location.state.otherMemberId;
  const chatRoomId = location.state.chatRoomId;

  // 레이아웃 설정
  useEffect(() => {
    setLayoutConfig({
      type: "close",
      showHeader: true,
      showBottomBar: false,
      onClose: () => navigate(-1),
    });
  }, [setLayoutConfig, navigate]);

  const handleClickButton = async () => {
    try {
      const res = await EvaluateScore({
        memberId: otherMemberId,
        rate: rating,
        review: word,
      });
      console.log("EvaluateScore try", res);

      // change chat status
      await ChangeChatStatus({
        coffeeChatId: chatRoomId,
        status: "COMPLETED",
      });

      navigate("/");
    } catch (err: unknown) {
      console.error("evaluate manner score failed", err);
    }
  };

  return (
    <div className="wrapper">
      <div className="review">
        {/* title */}
        <div className="review__title title">{title}</div>
        {/* subTitle */}
        <div className="review__subTitle body">{subTitle}</div>
        {/* rating */}

        <div className="review__rating" role="radiogroup" aria-label="평점">
          {Array.from({ length: 5 }, (_, i) => {
            const score = i + 1;
            const active = i < rating;
            return (
              <button
                key={score}
                type="button"
                onClick={() => setRating(score)}
                aria-pressed={active}
                aria-label={`${score}점`}
              >
                <img
                  src={active ? ratingIcon : ratingDisabledIcon}
                  alt="ratingIcon"
                  className="review__ratingImg"
                />
              </button>
            );
          })}
        </div>
        {/* a word */}
        <div className="label review__wordTitle">{wordTitle}</div>
        {/* a word input */}
        <input
          type="text"
          className="review__word body"
          value={word}
          placeholder={wordEx}
          onChange={(e) => setWord(e.target.value)}
        />

        {/* button */}
        <div className="review__btn label" onClick={() => handleClickButton()}>
          {buttonTitle}
        </div>
      </div>
    </div>
  );
};

export default Review;
