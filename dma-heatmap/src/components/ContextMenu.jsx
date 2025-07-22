import React from 'react';
import copyToClipboard from 'copy-to-clipboard';

function handleCopy(info) {
  const objects = info.objects ? info.objects : [info.object];
  // make csv style data
  const headers = ['dma', 'numeric_value'];
  const contents = objects.map(data => {
    const dma = data.dma ?? data.dmaId ?? '';
    const value = data.numeric_value ?? data.value ?? '';
    return [dma, value].join(',');
  });

  const text = [headers.join(','), ...contents].join('\n');
  copyToClipboard(text);
}

export function renderContextMenu(info) {
  if (!info) return null;
  const { x, y } = info;

  return (
    <ul className="contextMenu" style={{position: 'fixed', left: x, top: y}}>
      <li onClick={() => handleCopy(info)}>Copy data</li>
    </ul>
  )
}