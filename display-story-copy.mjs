// Presentation only. Replay records and the underlying research stay unchanged.
export function cleanStoryCopy(value) {
  return String(value ?? '')
    .replace(/圣克拉拉市内的虚构会面地点/g, '圣克拉拉市内')
    .replace(/本幕会面与工作场所为虚构，不设真实私人地址。/g, '')
    .replace(/这条平行人生中的孩子是虚构家人。/g, '')
    .replace(/这是2028年的虚构未来。/g, '')
    .replace(/在黄二勋这条虚构人生里，/g, '')
    .replace(/在这条(?:虚构|平行|假设的)人生里，?/g, '')
    .replace(/在这条平行经历里，/g, '')
    .replace(/(?:在)?这条剧情里，/g, '')
    .replace(/两个成年人同意交往/g, '你们决定交往')
    .replace(/你从毕业后就进入了 LSI Logic 这条平行道路。/g, '你毕业后就进入了 LSI Logic。')
    .replace(/陈立文作为这条虚构路线的工程同伴加入讨论。/g, '陈立文以工程同伴的身份加入讨论。')
    .replace(/ · 黄二勋的平行人生/g, '')
    .replace(/假设人生/g, '人生回望')
    .replace(/虚构未来/g, '未来的日子')
    .replace(/平行人生/g, '人生');
}
