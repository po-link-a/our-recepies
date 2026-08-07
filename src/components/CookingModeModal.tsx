import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Recipe } from '../data/recipes';

interface CookingModeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);

  // Screen Wake Lock API
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          setIsWakeLockActive(true);
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => setIsWakeLockActive(false));
      }
    };
  }, []);

  const totalSteps = recipe.directions.length;

  return (
    <div className="cook">
      {/* Header */}
      <div className="cook__head">
        <div>
          <span className="kicker">Режим готовки на кухне</span>
          <h2 className="cook__title">{recipe.title}</h2>
        </div>

        <div className="row">
          {isWakeLockActive && (
            <span className="chip" style={{ backgroundColor: 'var(--sage)' }}>
              Экран не гаснет
            </span>
          )}
          <button onClick={onClose} className="icon-btn" title="Закрыть">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main step */}
      <div className="cook__body">
        <span className="cook__badge">
          Шаг {currentStep + 1} из {totalSteps}
        </span>

        <div className="cook__card">
          <p className="cook__step">{recipe.directions[currentStep]}</p>
        </div>

        <div className="cook__bar">
          <span style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="cook__foot">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="btn btn--ghost btn--sm"
        >
          <ChevronLeft size={16} /> Назад
        </button>

        <span className="cook__count">
          {currentStep + 1} / {totalSteps}
        </span>

        {currentStep < totalSteps - 1 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1))}
            className="btn btn--primary btn--sm"
          >
            Следующий шаг <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={onClose} className="btn btn--green btn--sm">
            <CheckCircle size={16} /> Завершить готовку
          </button>
        )}
      </div>
    </div>
  );
};
