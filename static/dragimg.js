const container = document.getElementById('mapContainer');
const mapWrapper = document.getElementById('mapWrapper');
const overlay = document.getElementById('overlayLayer');
const hotspots = document.querySelectorAll('.hotspot');

let scale = 1;
let pos = { x: 0, y: 0 };
let lastPos = { x: 0, y: 0 };
let isDragging = false;
let lastDistance = null;

function updateTransform() {
  mapWrapper.style.transform = `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${scale})`;
  updateHotspotPositions();
}

// 热点位置同步（相对图片中心 + 缩放坐标换算）
function updateHotspotPositions() {
  const containerRect = container.getBoundingClientRect();
  const img = mapWrapper.querySelector('img');
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const scaledW = imgW * scale;
  const scaledH = imgH * scale;

  const centerX = containerRect.width / 2 + pos.x;
  const centerY = containerRect.height / 2 + pos.y;

  hotspots.forEach(h => {
    const leftPercent = parseFloat(h.dataset.left);
    const topPercent = parseFloat(h.dataset.top);

    const x = centerX + (leftPercent - 50) / 100 * scaledW;
    const y = centerY + (topPercent - 50) / 100 * scaledH;

    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
  });
}

//  缩放以鼠标为中心
container.addEventListener('wheel', function(e) {
  e.preventDefault();

  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const centerX = rect.width / 2 + pos.x;
  const centerY = rect.height / 2 + pos.y;

  const offsetX = mouseX - centerX;
  const offsetY = mouseY - centerY;

  const oldScale = scale;
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale = Math.min(Math.max(0.5, scale + delta), 4);
  const scaleChange = scale / oldScale;

  pos.x -= offsetX * (scaleChange - 1);
  pos.y -= offsetY * (scaleChange - 1);

  updateTransform();
});

//  拖动支持（鼠标 & 触摸）
container.addEventListener('mousedown', e => {
  if (e.target.closest('.popup')) return;
  isDragging = true;
  lastPos = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - lastPos.x;
  const dy = e.clientY - lastPos.y;
  pos.x += dx;
  pos.y += dy;
  lastPos = { x: e.clientX, y: e.clientY };
  updateTransform();
});
window.addEventListener('mouseup', () => {
  isDragging = false;
});

container.addEventListener('touchstart', function(e) {
  if (e.target.closest('.popup')) return;

  if (e.touches.length === 1) {
    lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    lastDistance = getTouchDistance(e);
  }
});

container.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 1) {
    const dx = e.touches[0].clientX - lastPos.x;
    const dy = e.touches[0].clientY - lastPos.y;
    pos.x += dx;
    pos.y += dy;
    lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    updateTransform();
  } else if (e.touches.length === 2) {
    const newDist = getTouchDistance(e);
    const delta = newDist - lastDistance;
    const oldScale = scale;
    scale = Math.min(Math.max(0.5, scale + delta * 0.005), 4);
    const scaleChange = scale / oldScale;

    const mid = getTouchMidpoint(e);
    const rect = container.getBoundingClientRect();
    const midX = mid.x - rect.left;
    const midY = mid.y - rect.top;
    const centerX = rect.width / 2 + pos.x;
    const centerY = rect.height / 2 + pos.y;
    const offsetX = midX - centerX;
    const offsetY = midY - centerY;

    pos.x -= offsetX * (scaleChange - 1);
    pos.y -= offsetY * (scaleChange - 1);
    lastDistance = newDist;
    updateTransform();
  }
}, { passive: false });

function getTouchDistance(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchMidpoint(e) {
  const x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
  const y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
  return { x, y };
}

//  marker 点击展示 popup
hotspots.forEach(h => {
  h.addEventListener('click', (e) => {
    // 防止点击 popup 内部重复触发
    if (e.target.closest('.popup')) return;

    const isActive = h.classList.contains('active');

    // 全部关闭
    hotspots.forEach(o => o.classList.remove('active'));

    // 如果之前没激活，就激活它
    if (!isActive) {
      h.classList.add('active');
    }
  });
});


updateTransform();
