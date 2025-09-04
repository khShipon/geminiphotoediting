
export const exportAsImage = (svgElement: SVGSVGElement, format: 'png' | 'jpeg') => {
  // 1. Clone the SVG to avoid altering the displayed version.
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

  // 2. Remove any background classes and explicit styles to ensure true transparency for export.
  svgClone.classList.remove('bg-transparent', 'bg-black');
  svgClone.style.backgroundColor = '';

  // 3. Serialize the cleaned clone.
  const svgString = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // For JPEG, which doesn't support transparency, we must draw a white background first.
      if (format === 'jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType);
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `design.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  };
  img.onerror = (e) => {
    console.error("Failed to load SVG image for export", e);
    URL.revokeObjectURL(url);
  };
  img.src = url;
};
