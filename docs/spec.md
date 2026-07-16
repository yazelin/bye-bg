# bye-bg 瀏覽器去背 — spec

2026-07-17。行銷工具箱替換計畫第 5 案。定位:**新增自製並存**,不硬替換——BiRefNet HF demo 精度更高,誠實保留當「高精度」選項;本工具賣「快、私密、免排隊」。

## 定位

商品照/頭像拖進來,幾秒去背,圖完全不離開瀏覽器。可選透明/白底/自訂色(蝦皮、momo 商品圖要白底)。

## 技術

- onnxruntime-web 1.27.0(MIT,vendor + jsDelivr npm pin 雙路)
- U2Net-p 模型(Apache-2.0,4.6MB,來源 danielgatis/rembg release;vendor 進 repo,jsDelivr gh 主載+本地 fallback)
- 前處理:320×320、均值/標準差正規化;後處理:輸出 min/max 正規化 → 放大回原尺寸當 alpha
- 模型懶載入(選第一張圖才下載),下載進度顯示;wasm 單執行緒(Pages 無 COOP/COEP)
- 授權紅線:不用 imgly 套件(AGPL)、不用 RMBG-1.4(非商用)

## 功能

拖放/選檔/貼上圖片 → 去背 → 原圖/結果對照(棋盤格底)→ 背景:透明/白/自訂色 → 下載 PNG。
誠實標註:輕量模型,髮絲等細節有限;需要頂級精度附 BiRefNet demo 連結。隱私:圖不上傳。

## 慣例

單檔 index.html、深淺色、RWD、OG/favicon、footer 三件套(promo-footer skill 含 BMC 效果)、MIT 林亞澤、正體中文。

## 不做(v1)

批次多圖、髮絲精修、筆刷手動修補、WebGPU 加速、PWA。

## 驗收

- verify/check.cjs:上傳實照 fixture → 結果 canvas 透明比例落在 5%~95% 且不透明區存在;切白底後無透明像素;手機無橫捲。
- toolbox:素材製作類新增「瀏覽器去背」(自製),BiRefNet 保留;vetting 記錄並存理由。
