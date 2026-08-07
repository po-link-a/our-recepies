import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Sun, CheckCircle, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-[#FAF6EE] flex flex-col justify-between p-4 sm:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-300 pb-4">
        <div>
          <span className="font-hand text-lg text-[#D93A2B] font-bold block">
            Режим готовки на кухне
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 truncate max-w-xl">
            {recipe.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {isWakeLockActive && (
            <span className="hidden sm:flex items-center gap-1 text-xs bg-[#E2E9D8] text-emerald-800 px-3 py-1 rounded-full font-medium">
              <Sun className="w-3.5 h-3.5" /> Экран не гаснет
            </span>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors"
            title="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Step Display */}
      <div className="my-auto py-8 max-w-3xl mx-auto w-full text-center">
        <div className="inline-block bg-[#F4CBB2] text-stone-900 font-serif font-bold text-sm px-4 py-1 rounded-full mb-6 shadow-xs">
          Шаг {currentStep + 1} из {totalSteps}
        </div>

        <div className="paper-card p-8 sm:p-12 shadow-xl border-2 border-stone-800/10 min-h-[250px] flex items-center justify-center">
          <p className="font-serif text-2xl sm:text-3xl sm:leading-relaxed text-stone-900 font-medium">
            {recipe.directions[currentStep]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 h-3 rounded-full mt-8 overflow-hidden">
          <div
            className="bg-[#D93A2B] h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-stone-300 pt-4 flex items-center justify-between max-w-3xl mx-auto w-full gap-4">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> Назад
        </button>

        <span className="text-sm font-bold text-stone-500 font-mono">
          {currentStep + 1} / {totalSteps}
        </span>

        {currentStep < totalSteps - 1 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1))}
            className="btn-primary flex items-center gap-2"
          >
            Следующий шаг <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="btn-primary bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Завершить готовку
          </button>
        )}
      </div>
    </div>
  );
};
