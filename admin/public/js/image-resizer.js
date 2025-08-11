// 画像リサイザー共通機能
class ImageResizer {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;
    this.currentField = null;

    // 切り抜き関連の状態
    this.cropStartX = 0;
    this.cropStartY = 0;
    this.cropWidth = 0;
    this.cropHeight = 0;
    this.isCropDragging = false;
    this.isCropResizing = false;
    this.cropResizeHandle = null;
    this.startCropX = 0;
    this.startCropY = 0;
    
    // アスペクト比（16:9、4:3、1:1、3:4、9:16）
    this.aspectRatios = [
      { name: '横長 (16:9)', ratio: 16/9 },
      { name: '標準 (4:3)', ratio: 4/3 },
      { name: '正方形 (1:1)', ratio: 1 },
      { name: '縦長 (3:4)', ratio: 3/4 },
      { name: 'ポートレート (9:16)', ratio: 9/16 }
    ];
    this.currentAspectRatio = 1; // デフォルトは正方形
    
    // モーダル関連
    this.modal = null;
    this.originalImage = null;
    this.croppedImage = null;
  }

  // 画像アップロード処理
  handleImageUpload(input, fieldName) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      // プレビューを表示
      const preview = document.getElementById(fieldName + '-preview');
      if (preview) {
        // 既存の×ボタンを削除
        const removeButtons = preview.querySelectorAll('.remove-icon-btn');
        removeButtons.forEach(btn => btn.remove());
        
        // no-imageを非表示にして、プレビューを表示
        preview.innerHTML = `
          <img src="${e.target.result}" alt="プレビュー" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;">
        `;
      }
      
      // 元の画像を保存
      this.originalImage = e.target.result;
      
      // 切り抜きモーダルを表示
      this.showCropModal(fieldName, e.target.result);
    };
    reader.readAsDataURL(file);
  }

  // 切り抜きモーダルを表示
  showCropModal(fieldName, imageSrc) {
    // 既存のモーダルがあれば削除
    if (this.modal) {
      document.body.removeChild(this.modal);
    }

    // プレビューから×ボタンを確実に削除
    const preview = document.getElementById(fieldName + '-preview');
    if (preview) {
      const removeButtons = preview.querySelectorAll('.remove-icon-btn');
      removeButtons.forEach(btn => btn.remove());
    }

    // モーダルを作成
    this.modal = document.createElement('div');
    this.modal.className = 'crop-modal';
    this.modal.innerHTML = `
      <div class="crop-modal-content">
        <div class="crop-modal-header">
          <h3>画像の切り抜き</h3>
          <button type="button" class="close-btn" onclick="imageResizer.closeCropModal()">&times;</button>
        </div>
        <div class="crop-modal-body">
          <div class="crop-controls-top">
            ${this.createAspectRatioSelector(fieldName)}
          </div>
          <div class="canvas-wrapper">
            <canvas id="cropCanvas"></canvas>
            ${this.createCropHandles(fieldName)}
          </div>
          <div class="crop-controls-bottom">
            <button type="button" class="btn-small blue" onclick="imageResizer.cropImage('${fieldName}')">切り抜き実行</button>
            <button type="button" class="btn-small red" onclick="imageResizer.closeCropModal()">キャンセル</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    
    // デバッグ情報
    console.log('Modal created with handles:', this.createCropHandles(fieldName));

    // 画像を読み込んでCanvasに描画
    const img = new Image();
    img.onload = () => {
      this.initializeCropCanvas(img);
    };
    img.src = imageSrc;
  }

  // 切り抜き用Canvasを初期化
  initializeCropCanvas(img) {
    const canvas = document.getElementById('cropCanvas');
    if (!canvas) return;

    // Canvasサイズを固定（最大800x800）
    const maxSize = 800;
    let newWidth, newHeight;
    
    if (img.naturalWidth > img.naturalHeight) {
      newWidth = Math.min(img.naturalWidth, maxSize);
      newHeight = (img.naturalHeight * newWidth) / img.naturalWidth;
    } else {
      newHeight = Math.min(img.naturalHeight, maxSize);
      newWidth = (img.naturalWidth * newHeight) / img.naturalHeight;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.display = 'block';

    // 画像を描画
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // 切り抜き領域を初期化
    this.initializeCropArea('crop', newWidth, newHeight);
    
    // デバッグ情報
    console.log('Canvas initialized:', { width: newWidth, height: newHeight });
    console.log('Crop area:', { 
      startX: this.cropStartX, 
      startY: this.cropStartY, 
      width: this.cropWidth, 
      height: this.cropHeight 
    });
  }

  // 切り抜きモーダルを閉じる
  closeCropModal() {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
    }
  }

  // 切り抜き領域初期化
  initializeCropArea(fieldName, width, height) {
    // 現在のアスペクト比に基づいて切り抜き領域を設定
    if (this.currentAspectRatio >= 1) {
      // 横長または正方形
      this.cropHeight = Math.min(width / this.currentAspectRatio, height);
      this.cropWidth = this.cropHeight * this.currentAspectRatio;
    } else {
      // 縦長
      this.cropWidth = Math.min(height * this.currentAspectRatio, width);
      this.cropHeight = this.cropWidth / this.currentAspectRatio;
    }

    // 中央に配置
    this.cropStartX = (width - this.cropWidth) / 2;
    this.cropStartY = (height - this.cropHeight) / 2;

    this.updateCropArea(fieldName);
  }

  // 切り抜き領域更新
  updateCropArea(fieldName) {
    const canvas = document.getElementById('cropCanvas');
    const ctx = canvas.getContext('2d');
    
    // 元の画像を再描画
    const img = new Image();
    img.onload = () => {
      // Canvasをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 画像を描画
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // 切り抜き領域を描画
      this.drawCropArea(ctx, fieldName);
      // 切り抜きハンドルを更新
      this.updateCropHandles(fieldName);
    };
    img.src = this.originalImage;
  }

  // 切り抜き領域を描画
  drawCropArea(ctx, fieldName) {
    const canvas = document.getElementById('cropCanvas');

    // 半透明のオーバーレイ（切り抜き領域以外）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // 上部
    ctx.fillRect(0, 0, canvas.width, this.cropStartY);
    // 下部
    ctx.fillRect(0, this.cropStartY + this.cropHeight, canvas.width, canvas.height - (this.cropStartY + this.cropHeight));
    // 左部
    ctx.fillRect(0, this.cropStartY, this.cropStartX, this.cropHeight);
    // 右部
    ctx.fillRect(this.cropStartX + this.cropWidth, this.cropStartY, canvas.width - (this.cropStartX + this.cropWidth), this.cropHeight);

    // 切り抜き境界線
    ctx.strokeStyle = '#26a69a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(this.cropStartX, this.cropStartY, this.cropWidth, this.cropHeight);
    ctx.setLineDash([]);

    // 切り抜き領域のサイズ表示
    ctx.fillStyle = '#26a69a';
    ctx.font = '14px Arial';
    ctx.fillText(`${Math.round(this.cropWidth)} × ${Math.round(this.cropHeight)}`,
                  this.cropStartX + 10, this.cropStartY + 25);
  }

  // 切り抜きハンドル更新
  updateCropHandles(fieldName) {
    const canvas = document.getElementById('cropCanvas');
    if (!canvas) return;
    
    console.log('Updating crop handles for field:', fieldName);
    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
    console.log('Crop area:', { 
      startX: this.cropStartX, 
      startY: this.cropStartY, 
      width: this.cropWidth, 
      height: this.cropHeight 
    });
    
    // 移動ハンドル（中央）
    const moveHandle = document.getElementById('cropHandleMove');
    if (moveHandle) {
      const centerX = this.cropStartX + (this.cropWidth / 2) - 15;
      const centerY = this.cropStartY + (this.cropHeight / 2) - 15;
      moveHandle.style.left = centerX + 'px';
      moveHandle.style.top = centerY + 'px';
      console.log('Move handle positioned at:', { x: centerX, y: centerY });
    } else {
      console.log('Move handle not found');
    }
    
    // 四隅のハンドル
    const handles = [
      { id: 'NW', x: this.cropStartX - 10, y: this.cropStartY - 10 },
      { id: 'NE', x: this.cropStartX + this.cropWidth - 10, y: this.cropStartY - 10 },
      { id: 'SW', x: this.cropStartX - 10, y: this.cropStartY + this.cropHeight - 10 },
      { id: 'SE', x: this.cropStartX + this.cropWidth - 10, y: this.cropStartY + this.cropHeight - 10 }
    ];
    
    handles.forEach(handle => {
      const element = document.getElementById('cropHandle' + handle.id);
      if (element) {
        element.style.left = handle.x + 'px';
        element.style.top = handle.y + 'px';
        console.log(`${handle.id} handle positioned at:`, { x: handle.x, y: handle.y });
      } else {
        console.log(`${handle.id} handle not found`);
      }
    });
  }

  // アスペクト比変更
  changeAspectRatio(fieldName, ratio) {
    this.currentAspectRatio = parseFloat(ratio);
    const canvas = document.getElementById('cropCanvas');
    if (canvas) {
      this.initializeCropArea('crop', canvas.width, canvas.height);
    }
  }

  // 切り抜き領域のドラッグ開始
  onCropMouseDown(e, fieldName, handleType) {
    e.preventDefault();
    e.stopPropagation();
    
    this.isCropDragging = true;
    this.currentField = fieldName;
    
    if (handleType === 'move') {
      // 領域全体の移動
      this.isCropResizing = false;
      this.cropResizeHandle = null;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.cropStartX = this.cropStartX;
      this.cropStartY = this.cropStartY;
    } else {
      // 特定のハンドルでのリサイズ
      this.isCropResizing = true;
      this.cropResizeHandle = handleType;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startWidth = this.cropWidth;
      this.startHeight = this.cropHeight;
      this.startCropX = this.cropStartX;
      this.startCropY = this.cropStartY;
    }
    
    document.addEventListener('mousemove', this.onCropMouseMove.bind(this));
    document.addEventListener('mouseup', this.onCropMouseUp.bind(this));
  }

  // 切り抜き領域のドラッグ中
  onCropMouseMove(e) {
    if (!this.isCropDragging || !this.currentField) return;
    
    e.preventDefault();
    
    if (this.isCropResizing) {
      // ハンドルでのリサイズ（アスペクト比を保持）
      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;
      
      let newWidth, newHeight;
      
      switch(this.cropResizeHandle) {
        case 'nw': // 左上
          newWidth = Math.max(50, this.startWidth - deltaX);
          newHeight = newWidth / this.currentAspectRatio;
          this.cropStartX = Math.max(0, this.startCropX + deltaX);
          this.cropStartY = Math.max(0, this.startCropY + deltaY);
          break;
        case 'ne': // 右上
          newWidth = Math.max(50, this.startWidth + deltaX);
          newHeight = newWidth / this.currentAspectRatio;
          this.cropStartY = Math.max(0, this.startCropY + deltaY);
          break;
        case 'sw': // 左下
          newWidth = Math.max(50, this.startWidth - deltaX);
          newHeight = newWidth / this.currentAspectRatio;
          this.cropStartX = Math.max(0, this.startCropX + deltaX);
          break;
        case 'se': // 右下
          newWidth = Math.max(50, this.startWidth + deltaX);
          newHeight = newWidth / this.currentAspectRatio;
          break;
      }
      
      this.cropWidth = newWidth;
      this.cropHeight = newHeight;
    } else {
      // 領域全体の移動
      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;
      
      const canvas = document.getElementById('cropCanvas');
      if (!canvas) return;
      
      const maxX = canvas.width - this.cropWidth;
      const maxY = canvas.height - this.cropHeight;
      
      this.cropStartX = Math.max(0, Math.min(maxX, this.cropStartX + deltaX));
      this.cropStartY = Math.max(0, Math.min(maxY, this.cropStartY + deltaY));
      
      // 開始位置を更新
      this.startX = e.clientX;
      this.startY = e.clientY;
    }
    
    this.updateCropArea(this.currentField);
  }

  // 切り抜き領域のドラッグ終了
  onCropMouseUp() {
    this.isCropDragging = false;
    this.isCropResizing = false;
    this.cropResizeHandle = null;
    this.currentField = null;

    document.removeEventListener('mousemove', this.onCropMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onCropMouseUp.bind(this));
  }

  // 切り抜き実行
  cropImage(fieldName) {
    const canvas = document.getElementById('cropCanvas');
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');

    // 切り抜き用のCanvasを作成
    cropCanvas.width = this.cropWidth;
    cropCanvas.height = this.cropHeight;

    // 切り抜き領域を描画
    cropCtx.drawImage(canvas,
                      this.cropStartX, this.cropStartY, this.cropWidth, this.cropHeight,
                      0, 0, this.cropWidth, this.cropHeight);

    // 切り抜き後の画像を保存
    this.croppedImage = cropCanvas.toDataURL('image/png');

    // 元の画面に結果を反映
    this.updateOriginalField(fieldName);
    
    // ファイル入力を更新（切り抜き後の画像を反映）
    this.updateFileInput(fieldName);
    
    // モーダルを閉じる
    this.closeCropModal();
  }

  // 元のフィールドを更新
  updateOriginalField(fieldName) {
    if (!this.croppedImage) return;
    
    // プレビューを更新
    const preview = document.getElementById(fieldName + '-preview');
    if (preview) {
      preview.innerHTML = `
        <img src="${this.croppedImage}" alt="切り抜き後の画像" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;">
        <button type="button" class="remove-icon-btn" onclick="event.stopPropagation(); resetIcon()">
          <i class="material-icons">close</i>
        </button>
      `;
      
      // 装備編集画面の場合、クリック不可にする
      if (fieldName === 'icon') {
        preview.classList.remove('clickable-preview');
        preview.onclick = null;
      }
    }
  }

  // ファイル入力を更新
  updateFileInput(fieldName) {
    // DataURLをBlobに変換
    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const fileInput = document.querySelector(`input[name="${fieldName}"]`);
        const dt = new DataTransfer();
        dt.items.add(new File([blob], 'cropped_' + fieldName + '.png', { type: 'image/png' }));
        fileInput.files = dt.files;
      });
  }

  // 画像をリセット
  resetImage(fieldName) {
    // ファイル入力をクリア
    const fileInput = document.querySelector(`input[name="${fieldName}"]`);
    if (fileInput) {
      fileInput.value = '';
      // DataTransferを使用してファイル入力を確実にクリア
      const dt = new DataTransfer();
      fileInput.files = dt.files;
    }
    
    // プレビューをno-imageプレースホルダーにリセット
    const preview = document.getElementById(fieldName + '-preview');
    if (preview) {
      preview.innerHTML = `
        <div class="no-image">
          <i class="material-icons">image</i>
          <span>画像が選択されていません</span>
        </div>
      `;
    }
    
    // 内部状態をリセット
    this.originalImage = null;
    this.croppedImage = null;
  }

  // 切り抜きハンドルHTML生成
  createCropHandles(fieldName) {
    return `
      <div id="cropHandleMove" class="crop-handle crop-handle-move" 
           onmousedown="imageResizer.onCropMouseDown(event, '${fieldName}', 'move')" 
           title="ドラッグで移動">
        <i class="material-icons">open_with</i>
      </div>
      <div id="cropHandleNW" class="crop-handle crop-handle-nw" 
           onmousedown="imageResizer.onCropMouseDown(event, '${fieldName}', 'nw')" 
           title="左上でリサイズ"></div>
      <div id="cropHandleNE" class="crop-handle crop-handle-ne" 
           onmousedown="imageResizer.onCropMouseDown(event, '${fieldName}', 'ne')" 
           title="右上でリサイズ"></div>
      <div id="cropHandleSW" class="crop-handle crop-handle-sw" 
           onmousedown="imageResizer.onCropMouseDown(event, '${fieldName}', 'sw')" 
           title="左下でリサイズ"></div>
      <div id="cropHandleSE" class="crop-handle crop-handle-se" 
           onmousedown="imageResizer.onCropMouseDown(event, '${fieldName}', 'se')" 
           title="右下でリサイズ"></div>
    `;
  }

  // アスペクト比選択HTML生成
  createAspectRatioSelector(fieldName) {
    return `
      <div class="aspect-ratio-selector">
        <label>アスペクト比:</label>
        <select onchange="imageResizer.changeAspectRatio('${fieldName}', this.value)">
          ${this.aspectRatios.map(ratio => 
            `<option value="${ratio.ratio}" ${ratio.ratio === this.currentAspectRatio ? 'selected' : ''}>
              ${ratio.name}
            </option>`
          ).join('')}
        </select>
      </div>
    `;
  }

  // プレビューHTML生成
  createPreviewHTML(fieldName) {
    return `
      <div id="${fieldName}-preview" class="image-preview-container" style="display: none;">
        <div class="cropped-preview">
          <p>画像をアップロードすると切り抜きモーダルが表示されます</p>
        </div>
      </div>
    `;
  }
}

// グローバルインスタンス
const imageResizer = new ImageResizer();

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
  // Materializeの初期化
  if (typeof M !== 'undefined') {
    M.FormSelect.init(document.querySelectorAll('select'));
    M.textareaAutoResize(document.querySelectorAll('.materialize-textarea'));
  }
}); 