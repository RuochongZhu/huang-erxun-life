// Visuals follow the strongest sufficiently observed choice dimension, exactly
// like the first half of the report title. Luck, career outcomes and balances
// do not take part in portrait selection.
const variants = [
  {
    "id": "trait-00-low",
    "dim": 0,
    "direction": "low",
    "src": "./assets/portraits/trait-00-low.webp",
    "alt": "黄二勋抱紧巨大的安全垫，弯腿探头的几何风格画像"
  },
  {
    "id": "trait-00-high",
    "dim": 0,
    "direction": "high",
    "src": "./assets/portraits/trait-00-high.webp",
    "alt": "黄二勋拿着计划卷张嘴大笑，跃步向前的几何风格画像"
  },
  {
    "id": "trait-01-low",
    "dim": 1,
    "direction": "low",
    "src": "./assets/portraits/trait-01-low.webp",
    "alt": "黄二勋捧着大碗，鼓着脸满足地笑的几何风格画像"
  },
  {
    "id": "trait-01-high",
    "dim": 1,
    "direction": "high",
    "src": "./assets/portraits/trait-01-high.webp",
    "alt": "黄二勋踮起脚用大望远镜向远处看的几何风格画像"
  },
  {
    "id": "trait-02-low",
    "dim": 2,
    "direction": "low",
    "src": "./assets/portraits/trait-02-low.webp",
    "alt": "黄二勋鼓着脸吹向大折扇，单脚站立的几何风格画像"
  },
  {
    "id": "trait-02-high",
    "dim": 2,
    "direction": "high",
    "src": "./assets/portraits/trait-02-high.webp",
    "alt": "黄二勋张大嘴追着风车，身体被风吹歪的几何风格画像"
  },
  {
    "id": "trait-03-low",
    "dim": 3,
    "direction": "low",
    "src": "./assets/portraits/trait-03-low.webp",
    "alt": "黄二勋困得打哈欠，仍提着灯守候的几何风格画像"
  },
  {
    "id": "trait-03-high",
    "dim": 3,
    "direction": "high",
    "src": "./assets/portraits/trait-03-high.webp",
    "alt": "黄二勋套着救生圈，眨眼指向新方向的几何风格画像"
  },
  {
    "id": "trait-04-low",
    "dim": 4,
    "direction": "low",
    "src": "./assets/portraits/trait-04-low.webp",
    "alt": "黄二勋吐舌头用大橡皮修改笔记的几何风格画像"
  },
  {
    "id": "trait-04-high",
    "dim": 4,
    "direction": "high",
    "src": "./assets/portraits/trait-04-high.webp",
    "alt": "黄二勋抱臂握扳手，鼓脸抬起下巴的几何风格画像"
  },
  {
    "id": "trait-05-low",
    "dim": 5,
    "direction": "low",
    "src": "./assets/portraits/trait-05-low.webp",
    "alt": "黄二勋背着巨大的背包，低头核对指南针的几何风格画像"
  },
  {
    "id": "trait-05-high",
    "dim": 5,
    "direction": "high",
    "src": "./assets/portraits/trait-05-high.webp",
    "alt": "黄二勋打电话大笑，张开另一只手比画的几何风格画像"
  },
  {
    "id": "trait-06-low",
    "dim": 6,
    "direction": "low",
    "src": "./assets/portraits/trait-06-low.webp",
    "alt": "黄二勋蹲着打开盒子，瞪大眼张着嘴的几何风格画像"
  },
  {
    "id": "trait-06-high",
    "dim": 6,
    "direction": "high",
    "src": "./assets/portraits/trait-06-high.webp",
    "alt": "黄二勋放大镜放大一只眼，俯身检查图纸的几何风格画像"
  },
  {
    "id": "trait-07-low",
    "dim": 7,
    "direction": "low",
    "src": "./assets/portraits/trait-07-low.webp",
    "alt": "黄二勋单脚转身，吐舌头修改路线图的几何风格画像"
  },
  {
    "id": "trait-07-high",
    "dim": 7,
    "direction": "high",
    "src": "./assets/portraits/trait-07-high.webp",
    "alt": "黄二勋站得笔直拿着清单敬礼的几何风格画像"
  },
  {
    "id": "trait-08-low",
    "dim": 8,
    "direction": "low",
    "src": "./assets/portraits/trait-08-low.webp",
    "alt": "黄二勋笑着递出大钥匙，一手搭在脑后的几何风格画像"
  },
  {
    "id": "trait-08-high",
    "dim": 8,
    "direction": "high",
    "src": "./assets/portraits/trait-08-high.webp",
    "alt": "黄二勋鼓着脸紧握方向盘，双脚撑开的几何风格画像"
  },
  {
    "id": "trait-09-low",
    "dim": 9,
    "direction": "low",
    "src": "./assets/portraits/trait-09-low.webp",
    "alt": "黄二勋护住三张任务卡，另一只手示意暂停的几何风格画像"
  },
  {
    "id": "trait-09-high",
    "dim": 9,
    "direction": "high",
    "src": "./assets/portraits/trait-09-high.webp",
    "alt": "黄二勋被长长的日程表绕住，瞪眼露出笑容的几何风格画像"
  },
  {
    "id": "trait-10-low",
    "dim": 10,
    "direction": "low",
    "src": "./assets/portraits/trait-10-low.webp",
    "alt": "黄二勋眯起一只眼，用大尺子对齐文件的几何风格画像"
  },
  {
    "id": "trait-10-high",
    "dim": 10,
    "direction": "high",
    "src": "./assets/portraits/trait-10-high.webp",
    "alt": "黄二勋端着两杯茶大笑，抬腿热情招呼的几何风格画像"
  },
  {
    "id": "trait-11-low",
    "dim": 11,
    "direction": "low",
    "src": "./assets/portraits/trait-11-low.webp",
    "alt": "黄二勋坐在矮凳上，从电脑后探头偷笑的几何风格画像"
  },
  {
    "id": "trait-11-high",
    "dim": 11,
    "direction": "high",
    "src": "./assets/portraits/trait-11-high.webp",
    "alt": "黄二勋举着话筒大笑，抬腿张手主持的几何风格画像"
  },
  {
    "id": "trait-12-low",
    "dim": 12,
    "direction": "low",
    "src": "./assets/portraits/trait-12-low.webp",
    "alt": "黄二勋提着包跳起，挥手告别的几何风格画像"
  },
  {
    "id": "trait-12-high",
    "dim": 12,
    "direction": "high",
    "src": "./assets/portraits/trait-12-high.webp",
    "alt": "黄二勋抬腿托着电脑，另一只手高举咖啡的几何风格画像"
  },
  {
    "id": "trait-13-low",
    "dim": 13,
    "direction": "low",
    "src": "./assets/portraits/trait-13-low.webp",
    "alt": "黄二勋咧嘴奔跑，脸上带一滴汗的几何风格画像"
  },
  {
    "id": "trait-13-high",
    "dim": 13,
    "direction": "high",
    "src": "./assets/portraits/trait-13-high.webp",
    "alt": "黄二勋抱着大枕头，闭眼打盹的几何风格画像"
  },
  {
    "id": "trait-14-low",
    "dim": 14,
    "direction": "low",
    "src": "./assets/portraits/trait-14-low.webp",
    "alt": "黄二勋一手托日程本，一手抬起核对腕表的几何风格画像"
  },
  {
    "id": "trait-14-high",
    "dim": 14,
    "direction": "high",
    "src": "./assets/portraits/trait-14-high.webp",
    "alt": "黄二勋举着饭盒与钥匙，笑得眯眼跳起的几何风格画像"
  },
  {
    "id": "trait-15-low",
    "dim": 15,
    "direction": "low",
    "src": "./assets/portraits/trait-15-low.webp",
    "alt": "黄二勋拿着铅笔和笔记，扭着眉眼思考的几何风格画像"
  },
  {
    "id": "trait-15-high",
    "dim": 15,
    "direction": "high",
    "src": "./assets/portraits/trait-15-high.webp",
    "alt": "黄二勋展开一把空白卡片，挑眉笑着邀请下一局的几何风格画像"
  }
];
export const DEFAULT_PERSONALITY_ART = Object.freeze({
  id: 'observing', src: new URL('./assets/jensen-guide.webp', import.meta.url).href,
  alt: '银发、戴眼镜、穿黑色皮夹克的黄二勋',
});
export const PERSONALITY_ART = Object.freeze(Object.fromEntries(variants.map(art => [art.id,
  Object.freeze({ ...art, src: new URL(art.src, import.meta.url).href })])));

export function getPersonalityArt(report) {
  const strongest = (report?.dimensions ?? []).filter(d => d.confidence === '充分' && Number.isFinite(d.score))
    .sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50) || a.id - b.id);
  if (strongest.length < 2 || strongest[0].score === 50) return DEFAULT_PERSONALITY_ART;
  const first = strongest[0];
  const id = 'trait-' + String(first.id).padStart(2, '0') + '-' + (first.score > 50 ? 'high' : 'low');
  return PERSONALITY_ART[id] ?? DEFAULT_PERSONALITY_ART;
}
