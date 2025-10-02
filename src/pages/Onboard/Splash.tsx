import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLayout } from '@/services/hooks/useLayout';
// import { tokenService } from '@/services/auth/tokenService';
import ChzSvg from '@/assets/Onboard/chz.svg';

const Splash = () => {
  const navigate = useNavigate();
  const { setLayoutConfig } = useLayout();

  // 레이아웃 설정 (헤더, 바텀바 숨김)
  useEffect(() => {
    setLayoutConfig({
      type: 'close',
      showHeader: false,
      showBottomBar: false,
      onClose: () => navigate('/onboard/1'),
    });
  }, [setLayoutConfig, navigate]);

  // 액세스토큰 체크 후 리다이렉트
  useEffect(() => {
    // const accessToken = tokenService.getAccessToken();
    
    // if (accessToken) {
    //   // 액세스토큰이 있으면 바로 홈으로
    //   navigate('/');
    //   return;
    // }
    
    // 액세스토큰이 없으면 2초 후 온보딩 1로 이동
    const timer = setTimeout(() => {
      navigate('/onboard/1');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <img src={ChzSvg} alt="차한잔 로고" className="splash-image" />
      </div>
    </div>
  );
};

export default Splash;
