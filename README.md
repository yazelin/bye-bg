# 瀏覽器去背 bye-bg

商品照、頭像拖進來,幾秒去背——AI 模型直接在你的瀏覽器裡跑,**圖片不會上傳到任何伺服器**。

**線上使用:https://yazelin.github.io/bye-bg/**

免費、免註冊、免排隊。背景可選透明、白底(蝦皮、momo 商品主圖規格)或自訂色,下載 PNG。

## 為什麼不用線上去背服務就好

| | 一般線上去背 | BiRefNet demo | 這個工具 |
|--|--|--|--|
| 圖片去哪 | 上傳到服務商 | 上傳 HF Space | 不離開你的裝置 |
| 等待 | 看服務 | GPU 排隊 60 秒起 | 首次載 4.6MB 模型,之後秒級 |
| 費用/浮水印 | 高解析常要付費 | 免費 | 免費,無浮水印 |
| 精度 | 高 | 最高 | 中——主體明確的圖效果好,髮絲細節有限 |

誠實說:要頂級精度(髮絲、半透明)請用 [BiRefNet 線上 demo](https://huggingface.co/spaces/ZhengPeng7/BiRefNet_demo);這個工具賣的是快、私密、零上傳。

## 技術

- 推論:[ONNX Runtime Web](https://onnxruntime.ai/) 1.27.0(MIT),WASM 單執行緒
- 模型:[U2Net-p](https://github.com/xuebinqin/U-2-Net)(Apache-2.0,4.6MB,ONNX 檔取自 [rembg](https://github.com/danielgatis/rembg) release)
- 載入策略:jsDelivr CDN 主載(GitHub Pages 路由對大檔太慢),repo 內 `vendor/`、`model/` 副本 fallback
- 前處理 320×320 正規化;輸出 min/max 正規化後平滑放大回原尺寸當 alpha;長邊 >3000 先縮圖省記憶體
- 零框架、零 build、單檔 index.html

## 開發

```bash
python3 -m http.server 8005
NODE_PATH=$(npm root -g) node verify/check.cjs http://localhost:8005/
```

驗證 fixture(`verify/fixtures/animal.jpg`)取自 rembg 專案範例,僅供測試。

## 更多工具

這是[行銷工具箱](https://yazelin.github.io/marketing-toolbox/)的自製工具之一——免費、免註冊、開瀏覽器就能用的行銷小工具書籤站。

## 關於作者

林亞澤(Yaze Lin)——工業自動化 SI 轉 AI 應用。

- Blog:https://yazelin.github.io/
- Facebook:https://www.facebook.com/yaze.lin.gm
- Buy Me a Coffee:https://buymeacoffee.com/yazelin

## License

MIT © 2026 林亞澤 (Yaze Lin)(模型 Apache-2.0、ONNX Runtime MIT,各自依原授權)
