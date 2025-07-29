import * as React from 'react';
import {
  client,
  useConfig,
  useElementData,
} from "@sigmacomputing/plugin";

import './App.css';
import Map from './components/Map';
import Header from './components/Header';
import Carousel from './components/Carousel';
// import AttentionArcLogo from './assets/ATTENTION_ARC_LOGO.svg';

// Initialize the editor panel inside of the sigma editor
// This allows the user to select columns via native sigma tools to populate graph. 
// Think of it like Sigma is serving the backend for the graph based on the user's selection. 
client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "dma", type: "column", source: "source", allowMultiple: false, allowedTypes: ['number', 'integer', 'string'] },
  { name: "numeric_value", type: "column", source: "source", allowMultiple: false, allowedTypes: ['number', 'integer'] },
  { name: "numeric_value2", type: "column", source: "source", allowMultiple: false, allowedTypes: ['number', 'integer'] },
  { name: "numeric_value3", type: "column", source: "source", allowMultiple: false, allowedTypes: ['number', 'integer'] },
]);

// This is the main app component that renders the map and traffics data to the map from the sigma data.
function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);

  // Debug: Show user's public IP
  const [userIp, setUserIp] = React.useState(null);
  React.useEffect(() => {
    fetch('https://api64.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Error fetching IP'));
  }, []);

  // List of possible numeric columns
  const numericColumns = [
    { key: 'numeric_value', label: 'KPI 1', color: '#d4f9d0' }, // light green
    { key: 'numeric_value2', label: 'KPI 2', color: '#8F94FE' }, // purple
    { key: 'numeric_value3', label: 'KPI 3', color: '#27e7b8' }, // teal
  ];

  // Find which columns have at least some non-null data
  const availableKpiColumns = React.useMemo(() => {
    if (!sigmaData) return [];
    return numericColumns.filter(col => {
      const colName = config[col.key];
      return colName && sigmaData[colName] && sigmaData[colName].some(v => v != null);
    });
  }, [sigmaData, config.numeric_value, config.numeric_value2, config.numeric_value3]);

  // Build sigmaData array for the map: [{ dma, numeric_value, numeric_value2, numeric_value3 }]
  const mapSigmaData = React.useMemo(() => {
    const dmaCol = config.dma;
    if (!dmaCol || !sigmaData?.[dmaCol]) return [];
    const arr = [];
    for (let i = 0; i < sigmaData[dmaCol].length; i++) {
      const row = { dma: sigmaData[dmaCol][i] };
      numericColumns.forEach(col => {
        const colName = config[col.key];
        if (colName && sigmaData[colName]) {
          row[col.key] = sigmaData[colName][i];
        }
      });
      arr.push(row);
    }
    return arr;
  }, [config.dma, config.numeric_value, config.numeric_value2, config.numeric_value3, sigmaData]);

  // Helper to get display name from Sigma column key
  const getDisplayName = (colKey) => {
    if (colKey === 'dma') return 'DMA';
    const colName = config[colKey];
    if (!colName) return colKey;
    if (colName.includes('/')) {
      const parts = colName.split('/');
      return parts[parts.length - 1];
    }
    return 'Calculated Field';
  };

  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const carouselCount = availableKpiColumns.length;

  // Build array of KPI display names for the carousel
  const kpiLabels = availableKpiColumns.map(col => getDisplayName(col.key));

  // Compute current KPI color range for the header
  const currentKpi = availableKpiColumns[carouselIndex];
  let headerStartColor = '#d4f9d0';
  let headerEndColor = '#27e7b8';
  let minValue = undefined;
  let maxValue = undefined;
  if (currentKpi) {
    headerStartColor = currentKpi.key === 'numeric_value' ? '#d4f9d0' : '#ffffff';
    headerEndColor = currentKpi.key === 'numeric_value' ? '#27e7b8' : currentKpi.color;
    const colName = config[currentKpi.key];
    if (colName && sigmaData && sigmaData[colName]) {
      const values = sigmaData[colName].filter(v => v != null && !isNaN(v));
      if (values.length > 0) {
        minValue = Math.min(...values);
        maxValue = Math.max(...values);
      }
    }
  }

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header index={carouselIndex} setIndex={setCarouselIndex} count={carouselCount} kpiLabels={kpiLabels} startColor={headerStartColor} endColor={headerEndColor} minValue={minValue} maxValue={maxValue} />
      <div style={{ flex: 1, minHeight: 0, padding: 0, overflow: 'auto', width: '100%' }}>
        {carouselCount === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>[No Numeric KPI Available]</div>
        )}
        {carouselCount > 0 && (
          <Carousel index={carouselIndex} setIndex={setCarouselIndex} count={carouselCount}>
            {availableKpiColumns.map((col, idx) => {
              // For KPI 1, use company green to deep green
              let startColor = col.key === 'numeric_value' ? '#d4f9d0' : '#ffffff';
              let endColor = col.key === 'numeric_value' ? '#27e7b8' : col.color;
              const displayName = getDisplayName(col.key);
              return (
                <div key={col.key} className="map-container">
                  <div className="map-container-label">{displayName}</div>
                  <div className="map-container-map">
                    <Map 
                      sigmaData={mapSigmaData} 
                      config={config} 
                      selectedKpi={col.key}
                      colorRange={{ startColor, endColor }}
                      kpiLabel={displayName}
                    />
                  </div>
                  {/* Color gradient key */}
                  <div style={{ margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 240, height: 18, background: `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)`, borderRadius: 6, border: '1px solid #eee' }} />
                    <div style={{ width: 240, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginTop: 2 }}>
                      <span>Min</span>
                      <span>Max</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </Carousel>
        )}
      </div>
    </div>
  );
}

export default App;