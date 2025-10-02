import React, { useEffect, useState } from 'react';
import { useLayout } from '@/services/hooks/useLayout';
import SignupCompleteIcon from '@/assets/Login/signup-complete.svg';

interface SignupCompleteProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onBack: () => void;
}

const SignupComplete: React.FC<SignupCompleteProps> = ({
  onSubmit,
  onBack
}) => {
  const { setLayoutConfig } = useLayout();
  const [isIconLoaded, setIsIconLoaded] = useState(false);
  
  useEffect(() => {
    setLayoutConfig({
      type: 'back-only',
      title: '',
      showHeader: false,
      showBottomBar: false,
      onBack: onBack,
    });
  }, [setLayoutConfig, onBack]);

  return (
    <>
      <div className="extra-info-form">
        <div className="complete-title">
          프로필 설정 완료
        </div>
        <div className="signup-complete-icon-container">
          {!isIconLoaded && <div className="signup-complete-skeleton"></div>}
          <img 
            src={SignupCompleteIcon} 
            alt="signup-complete" 
            onLoad={() => setIsIconLoaded(true)}
            style={{ display: isIconLoaded ? 'block' : 'none' }}
          />
        </div>
        <button 
          type="button" 
          className="btn btn-primary extra-info-btn submit-btn"
          onClick={onSubmit}
        >
          시작하기
        </button>
      </div>
    </>
  );
};

export default SignupComplete;
