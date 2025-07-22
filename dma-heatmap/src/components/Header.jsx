import React from 'react';

export default function Header({ index, setIndex, count, kpiLabels = [], startColor = '#d4f9d0', endColor = '#27e7b8', minValue, maxValue }) {
  const goLeft = () => setIndex(i => (i - 1 + count) % count);
  const goRight = () => setIndex(i => (i + 1) % count);
  const currentLabel = kpiLabels.length > 0 ? kpiLabels[index] : '';
  const isSingle = count <= 1;
  return (
    <header className="header">
      {/* Left: Title and Carousel buttons */}
      <div className="header-left">
        <h1 className="header-title">DMA Heatmap</h1>
        <div className="header-carousel">
          <button
            onClick={goLeft}
            disabled={isSingle}
            className="header-btn"
            aria-label="Previous"
          >
            &#8592;
          </button>
          <span className="header-label">{currentLabel}</span>
          <button
            onClick={goRight}
            disabled={isSingle}
            className="header-btn"
            aria-label="Next"
          >
            &#8594;
          </button>
        </div>
      </div>
      {/* Right: Gradient Bar */}
      <div className="header-gradient-bar">
        {minValue !== undefined && (
          <span className="header-min">{minValue}</span>
        )}
        <div
          className="header-gradient"
          style={{ background: `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)` }}
        />
        {maxValue !== undefined && (
          <span className="header-max">{maxValue}</span>
        )}
      </div>
    </header>
  );
}
