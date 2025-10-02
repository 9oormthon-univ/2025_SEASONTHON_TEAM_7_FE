import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLayout } from '@/services/hooks/useLayout';
import { INTEREST_CATEGORIES } from '@/interfaces/interests';
import { getAllMembers } from '@/services/home/memberService';
import { onboardService } from '@/services/onboard/onboardService';
import { tokenService } from '@/services/auth/tokenService';
import type { UserCardData } from '@/interfaces/user';
import UserCard from './_components/UserCard';
import UserCardSkeleton from './_components/UserCardSkeleton';

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setLayoutConfig } = useLayout();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 액세스토큰 및 온보딩 체크
  useEffect(() => {
    const accessToken = tokenService.getAccessToken();
    const isOnboarded = onboardService.isOnboarded();
    if (!accessToken) {
      navigate('/login');
      return;
    }
    if (!isOnboarded) {
      navigate('/splash');
      return;
    }
  }, [navigate]);

  // 레이아웃 설정
  useEffect(() => {
    setLayoutConfig({
      type: 'home',
      showHeader: true,
      showBottomBar: true,
      onNotification: () => console.log('알림 혹은 다른 로직 추후 구현'),
    });
  }, [setLayoutConfig]);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
    // console.log('액세스 토큰 받음:', accessToken);
    sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken);
      // console.log('리프레시 토큰도 저장됨:', refreshToken);
    }
    // URL에서 토큰 파라미터 제거
    window.history.replaceState({}, document.title, window.location.pathname);
    // console.log('토큰이 sessionStorage에 저장되었습니다.');
    }
  }, [searchParams]);

  // 멤버 목록 조회
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const membersData = await getAllMembers();
        setUsers(membersData);
      } catch (err) {
        console.error('멤버 목록 조회 실패:', err);
        setError(err instanceof Error ? err.message : '멤버 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // 관심사 클릭 핸들러
  const handleInterestClick = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        // 이미 선택된 경우 제거
        return prev.filter(id => id !== interestId);
      } else {
        // 선택되지 않은 경우 추가
        return [...prev, interestId];
      }
    });
  };

  // 유저 카드 클릭 핸들러
  const handleUserCardClick = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      navigate('/chat-request', { state: user });
    }
  };

  // 관심사에 따른 유저 필터링 및 정렬
  const filteredUsers = users
    .filter(user => {
      // 아무것도 선택되지 않았으면 모든 유저 표시
      if (selectedInterests.length === 0) {
        return true;
      }
      
      // 유저의 해시태그 중 하나라도 선택된 관심사와 일치하면 true
      // selectedInterests는 이미 id 형태('#영화')이므로 직접 비교
      const isMatch = user.hashtags.some(hashtag => 
        selectedInterests.includes(hashtag)
      );
      
      return isMatch;
    })
    .sort((a, b) => {
      // 1. isActive 기준으로 먼저 정렬 (true가 위로)
      if (a.isActive !== b.isActive) {
        return b.isActive ? 1 : -1; // true가 false보다 위에 오도록
      }
      
      // 2. isActive가 같은 경우
      if (a.isActive && b.isActive) {
        // 둘 다 active인 경우: 관심사 매칭 개수 기준 정렬
        if (selectedInterests.length > 0) {
          const aMatches = a.hashtags.filter(hashtag => selectedInterests.includes(hashtag)).length;
          const bMatches = b.hashtags.filter(hashtag => selectedInterests.includes(hashtag)).length;
          return bMatches - aMatches;
        }
        return 0;
      } else {
        // 둘 다 inactive인 경우: lastActiveAt 기준 최신순 정렬
        return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
      }
    });
  
  return (
    <div className="wrapper">
      <div className="home-container">
        <div className="home-title">어떤 이야기로 차 한잔 하시겠어요?</div>
        <div className="home-interests">
          {INTEREST_CATEGORIES.map((interest) => (
            <span 
              key={interest.id} 
              className={`home-interest-item ${selectedInterests.includes(interest.id) ? 'active' : ''}`}
              onClick={() => handleInterestClick(interest.id)}
            >
              {interest.label}
            </span>
          ))}
        </div>
        
        {/* 유저 카드 그리드 */}
        <div className="user-cards-grid">
          {error ? (
            // 에러 발생 시
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
          ) : isLoading ? (
            // 로딩 중: 스켈레톤 UI
            Array.from({ length: 6 }).map((_, index) => (
              <UserCardSkeleton key={index} />
            ))
          ) : filteredUsers.length > 0 ? (
            // 로딩 완료: 필터링된 데이터
            filteredUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onClick={handleUserCardClick}
              />
            ))
          ) : (
            // 필터링 결과가 없을 때
            <div className="no-results">
              <p>선택한 관심사에 해당하는 사용자가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
