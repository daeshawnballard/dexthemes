/**
 * DeepSeek Harness collection.
 *
 * The first palette mirrors DeepSeek Harness's published semantic defaults.
 * The remaining palettes are unofficial color tributes based on public company
 * identities. Their evidence links explain the documented DeepSeek integration
 * or deployment that motivated inclusion; they do not establish partnership or
 * endorsement. No company logos, fonts, or other brand assets are bundled.
 */

function pairedTheme({ id, name, summary, sourceLabel, evidenceUrl, unofficial = true, dark, light }) {
  return Object.freeze({
    id,
    name,
    summary,
    category: 'deepseek',
    subgroup: 'ecosystem',
    sourceLabel,
    evidenceUrl,
    unofficial,
    dark: Object.freeze({ contrast: 64, ...dark }),
    light: Object.freeze({ contrast: 46, ...light }),
  });
}

export const DEEPSEEK_HARNESS_THEMES = Object.freeze([
  pairedTheme({
    id: 'deepseek-default',
    name: 'DeepSeek',
    summary: 'DeepSeek Harness’s default light and dark palette, matched to its published semantic tokens.',
    sourceLabel: 'DeepSeek Harness semantic theme tokens',
    evidenceUrl: 'https://github.com/deepseek-ai/deepseek-harness/blob/main/packages/client/ui-theme/src/styles/design-platform.css',
    unofficial: false,
    dark: {
      surface: '#151517', ink: '#F9FAFB', accent: '#5686FE', sidebar: '#1B1B1C', codeBg: '#0F0F0F',
      diffAdded: '#22C55E', diffRemoved: '#F25A5A', skill: '#679EFE',
    },
    light: {
      surface: '#FFFFFF', ink: '#0F1115', accent: '#4176E6', sidebar: '#F9FAFB', codeBg: '#F9FAFB',
      diffAdded: '#22C55E', diffRemoved: '#EC1313', skill: '#4176E6',
    },
  }),
  pairedTheme({
    id: 'deepseek-huawei',
    name: 'Huawei',
    summary: 'Unofficial crimson palette nod to Huawei Ascend’s documented DeepSeek inference support.',
    sourceLabel: 'Recommended Ascend inference support',
    evidenceUrl: 'https://github.com/deepseek-ai/DeepSeek-V3#68-recommended-inference-functionality-with-huawei-ascend-npus',
    dark: {
      surface: '#130C10', ink: '#FFF3F5', accent: '#E51A3C', sidebar: '#0D080B', codeBg: '#090609',
      diffAdded: '#35C97A', diffRemoved: '#FF526D', skill: '#F2B84B',
    },
    light: {
      surface: '#FFF7F8', ink: '#261317', accent: '#CF0A2C', sidebar: '#F8E9EC', codeBg: '#FCEFF1',
      diffAdded: '#16834B', diffRemoved: '#B80727', skill: '#9B6100',
    },
  }),
  pairedTheme({
    id: 'deepseek-tencent',
    name: 'Tencent',
    summary: 'Unofficial blue-cyan palette nod to Tencent Cloud’s documented DeepSeek integrations.',
    sourceLabel: 'Tencent Cloud integration documentation',
    evidenceUrl: 'https://cloud.tencent.com/document/product/679/116187',
    dark: {
      surface: '#07131F', ink: '#EAF7FF', accent: '#00A4FF', sidebar: '#050E17', codeBg: '#030A11',
      diffAdded: '#2FD69A', diffRemoved: '#FF647C', skill: '#5CC8FF',
    },
    light: {
      surface: '#F3FAFF', ink: '#102538', accent: '#006EFF', sidebar: '#E7F4FC', codeBg: '#ECF7FD',
      diffAdded: '#087C55', diffRemoved: '#C92E49', skill: '#0052D9',
    },
  }),
  pairedTheme({
    id: 'deepseek-alibaba',
    name: 'Alibaba',
    summary: 'Unofficial warm-orange palette nod to Alibaba Cloud’s documented DeepSeek model service.',
    sourceLabel: 'Alibaba Cloud Model Studio support',
    evidenceUrl: 'https://www.alibabacloud.com/help/en/model-studio/deepseek-api',
    dark: {
      surface: '#17100B', ink: '#FFF6ED', accent: '#FF6A00', sidebar: '#100B08', codeBg: '#0C0806',
      diffAdded: '#39C77F', diffRemoved: '#FF5D55', skill: '#FFB347',
    },
    light: {
      surface: '#FFF9F4', ink: '#2B1A10', accent: '#D95300', sidebar: '#F9EEE5', codeBg: '#FCF2E9',
      diffAdded: '#187D4E', diffRemoved: '#B9332C', skill: '#9C5600',
    },
  }),
  pairedTheme({
    id: 'deepseek-ant-group',
    name: 'Ant Group',
    summary: 'Unofficial electric-blue palette nod to agentUniverse’s documented DeepSeek support.',
    sourceLabel: 'agentUniverse integration listed by DeepSeek',
    evidenceUrl: 'https://github.com/deepseek-ai/awesome-deepseek-integration#rag-frameworks',
    dark: {
      surface: '#091321', ink: '#EEF6FF', accent: '#1677FF', sidebar: '#060D17', codeBg: '#040A12',
      diffAdded: '#33D49D', diffRemoved: '#FF6482', skill: '#6FB1FF',
    },
    light: {
      surface: '#F4F8FF', ink: '#13243A', accent: '#0958D9', sidebar: '#EAF1FC', codeBg: '#EDF4FE',
      diffAdded: '#087F59', diffRemoved: '#C62F50', skill: '#004FBA',
    },
  }),
  pairedTheme({
    id: 'deepseek-bytedance',
    name: 'ByteDance',
    summary: 'Unofficial cyan-red palette nod to Volcano Engine’s documented DeepSeek model service.',
    sourceLabel: 'Volcano Engine model integration',
    evidenceUrl: 'https://developer.volcengine.com/articles/7487815637083914252',
    dark: {
      surface: '#0A1018', ink: '#F2F7FC', accent: '#2F88FF', sidebar: '#070B11', codeBg: '#04070B',
      diffAdded: '#2FD0A2', diffRemoved: '#FE2C55', skill: '#25D4E9',
    },
    light: {
      surface: '#F7FAFD', ink: '#162331', accent: '#1769E0', sidebar: '#EBF1F6', codeBg: '#F0F5F9',
      diffAdded: '#087F5E', diffRemoved: '#C5143B', skill: '#087F96',
    },
  }),
  pairedTheme({
    id: 'deepseek-baidu',
    name: 'Baidu',
    summary: 'Unofficial indigo palette nod to Baidu AI Gateway’s documented DeepSeek routing.',
    sourceLabel: 'Baidu AI Gateway model routing',
    evidenceUrl: 'https://cloud.baidu.com/product/aigw.html',
    dark: {
      surface: '#0E0E21', ink: '#F2F1FF', accent: '#6262FF', sidebar: '#090918', codeBg: '#060611',
      diffAdded: '#39CE8A', diffRemoved: '#FF5B74', skill: '#8E8CFF',
    },
    light: {
      surface: '#F7F7FF', ink: '#1E1E3A', accent: '#2932E1', sidebar: '#ECECFA', codeBg: '#F0F0FC',
      diffAdded: '#157D51', diffRemoved: '#C72B45', skill: '#3C43B8',
    },
  }),
  pairedTheme({
    id: 'deepseek-siliconflow',
    name: 'SiliconFlow',
    summary: 'Unofficial neon-mint palette nod to SiliconFlow’s documented DeepSeek inference service.',
    sourceLabel: 'DeepSeek inference on Huawei Ascend',
    evidenceUrl: 'https://siliconflow.cn/news/q6wyoxhvpn06vlh1xsrbov7x',
    dark: {
      surface: '#071410', ink: '#ECFFF8', accent: '#21D99A', sidebar: '#050E0B', codeBg: '#030A08',
      diffAdded: '#31E2A3', diffRemoved: '#FF6577', skill: '#6BE6C0',
    },
    light: {
      surface: '#F2FCF8', ink: '#123027', accent: '#087C59', sidebar: '#E7F5EF', codeBg: '#EBF8F3',
      diffAdded: '#087A55', diffRemoved: '#C73349', skill: '#006B52',
    },
  }),
  pairedTheme({
    id: 'deepseek-jd-cloud',
    name: 'JD.com',
    summary: 'Unofficial red-and-ink palette nod to JD Cloud’s documented DeepSeek deployment path.',
    sourceLabel: 'JD Cloud deployment documentation',
    evidenceUrl: 'https://docs.jdcloud.com/cn/gcs/deploy-deepseek',
    dark: {
      surface: '#151011', ink: '#FFF4F4', accent: '#E1251B', sidebar: '#0E0B0B', codeBg: '#0A0808',
      diffAdded: '#36C67B', diffRemoved: '#FF5A52', skill: '#F1A441',
    },
    light: {
      surface: '#FFF8F7', ink: '#291718', accent: '#C81623', sidebar: '#F7EBEA', codeBg: '#FBEFEE',
      diffAdded: '#187E4D', diffRemoved: '#AE1020', skill: '#965C00',
    },
  }),
  pairedTheme({
    id: 'deepseek-china-telecom',
    name: 'China Telecom',
    summary: 'Unofficial sky-blue palette nod to China Telecom’s documented DeepSeek deployments.',
    sourceLabel: 'China Telecom DeepSeek deployment report',
    evidenceUrl: 'https://www.chinatelecom-h.com/en/ir/report/annual2024/annual2024_07.pdf',
    dark: {
      surface: '#09131C', ink: '#EDF8FF', accent: '#1B8DCE', sidebar: '#060D13', codeBg: '#04090D',
      diffAdded: '#31CB8B', diffRemoved: '#F66470', skill: '#65BCEB',
    },
    light: {
      surface: '#F4FAFD', ink: '#163044', accent: '#0066A6', sidebar: '#E8F3F8', codeBg: '#EDF6FA',
      diffAdded: '#117B52', diffRemoved: '#BE3040', skill: '#00588F',
    },
  }),
  pairedTheme({
    id: 'deepseek-china-mobile',
    name: 'China Mobile',
    summary: 'Unofficial blue-green palette nod to China Mobile’s documented DeepSeek AI ecosystem.',
    sourceLabel: 'China Mobile AI ecosystem disclosure',
    evidenceUrl: 'https://www.chinamobileltd.com/en/ir/webcasts/pre250320.pdf',
    dark: {
      surface: '#071719', ink: '#ECFCFD', accent: '#00A8A8', sidebar: '#050F11', codeBg: '#030B0C',
      diffAdded: '#36D296', diffRemoved: '#FF6874', skill: '#42C8E8',
    },
    light: {
      surface: '#F2FBFB', ink: '#143336', accent: '#008B86', sidebar: '#E5F5F5', codeBg: '#EAF8F8',
      diffAdded: '#0B7B52', diffRemoved: '#BF3440', skill: '#00759A',
    },
  }),
  pairedTheme({
    id: 'deepseek-honor',
    name: 'HONOR',
    summary: 'Unofficial violet-cyan palette nod to HONOR’s documented DeepSeek integrations in MagicOS.',
    sourceLabel: 'HONOR MagicOS product integration',
    evidenceUrl: 'https://club.honor.com/cn/thread-29284638-1-1.html',
    dark: {
      surface: '#0D1020', ink: '#F4F4FF', accent: '#7A6CFF', sidebar: '#080B17', codeBg: '#060812',
      diffAdded: '#36D3A0', diffRemoved: '#FF6687', skill: '#42D8E8',
    },
    light: {
      surface: '#F7F7FF', ink: '#20223C', accent: '#5146C8', sidebar: '#ECECF8', codeBg: '#F0F0FC',
      diffAdded: '#0E7D59', diffRemoved: '#C42F52', skill: '#087D91',
    },
  }),
  pairedTheme({
    id: 'deepseek-lenovo',
    name: 'Lenovo',
    summary: 'Unofficial red-and-carbon palette nod to Lenovo’s documented enterprise DeepSeek deployments.',
    sourceLabel: 'Lenovo enterprise deployment case study',
    evidenceUrl: 'https://www.lenovo.com/content/dam/lenovo/iso/customer-references-coe/global/en/case-studies/huatai-insurance/Huatai%20Insurance%20final%20case%20study.pdf',
    dark: {
      surface: '#121212', ink: '#F6F6F6', accent: '#E2231A', sidebar: '#0B0B0B', codeBg: '#080808',
      diffAdded: '#3AC77C', diffRemoved: '#FF5B52', skill: '#F1AD45',
    },
    light: {
      surface: '#FAFAFA', ink: '#242424', accent: '#C51D16', sidebar: '#EEEEEE', codeBg: '#F2F2F2',
      diffAdded: '#197D4E', diffRemoved: '#AA1813', skill: '#925A00',
    },
  }),
]);
