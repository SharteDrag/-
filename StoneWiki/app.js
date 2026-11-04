'use strict';
// 攻略データベース本体。データは data.js (build_wiki.py が生成) の window.WIKI_DATA。
const D = window.WIKI_DATA;
const G = '../Graphics/';
const $app = document.getElementById('app');

// =====================================================================
// 定数・日本語表記
// =====================================================================
const TYPE_JA = {
  NORMAL: 'ノーマル', FIRE: 'ほのお', WATER: 'みず', GRASS: 'くさ', ELECTRIC: 'でんき',
  ICE: 'こおり', FIGHTING: 'かくとう', POISON: 'どく', GROUND: 'じめん', FLYING: 'ひこう',
  PSYCHIC: 'エスパー', BUG: 'むし', ROCK: 'いわ', GHOST: 'ゴースト', DRAGON: 'ドラゴン',
  DARK: 'あく', STEEL: 'はがね', FAIRY: 'フェアリー', QMARKS: '？？？', STELLAR: 'ステラ',
};
const TYPE_COLOR = {
  NORMAL: '#9fa19f', FIRE: '#e62829', WATER: '#2980ef', GRASS: '#3fa129', ELECTRIC: '#e0ad00',
  ICE: '#3dc7ef', FIGHTING: '#ff8000', POISON: '#9141cb', GROUND: '#915121', FLYING: '#81b9ef',
  PSYCHIC: '#ef4179', BUG: '#91a119', ROCK: '#afa981', GHOST: '#704170', DRAGON: '#5060e1',
  DARK: '#624d4e', STEEL: '#60a1b8', FAIRY: '#ef70ef', QMARKS: '#68a090', STELLAR: '#40b5a5',
};
const CAT_JA = { Physical: '物理', Special: '特殊', Status: '変化' };
// PBS の並び (HP, こうげき, ぼうぎょ, すばやさ, とくこう, とくぼう) → 表示順
const STAT_LABEL = ['HP', 'こうげき', 'ぼうぎょ', 'とくこう', 'とくぼう', 'すばやさ'];
const PBS_TO_DISP = [0, 1, 2, 4, 5, 3];
const STAT_ID_JA = {
  HP: 'HP', ATTACK: 'こうげき', DEFENSE: 'ぼうぎょ', SPECIAL_ATTACK: 'とくこう',
  SPECIAL_DEFENSE: 'とくぼう', SPEED: 'すばやさ',
};
const EGG_JA = {
  Monster: 'かいじゅう', Water1: 'すいちゅう1', Water2: 'すいちゅう2', Water3: 'すいちゅう3',
  Bug: 'むし', Flying: 'ひこう', Field: 'りくじょう', Fairy: 'ようせい', Grass: 'しょくぶつ',
  Humanlike: 'ひとがた', Mineral: 'こうぶつ', Amorphous: 'ふていけい', Ditto: 'メタモン',
  Dragon: 'ドラゴン', Undiscovered: 'タマゴみはっけん',
};
const GROWTH_JA = {
  Fast: '80万', Medium: '100万', Parabolic: '105万', Slow: '125万', Erratic: '60万', Fluctuating: '164万',
};
const GENDER_JA = {
  AlwaysMale: '♂のみ', AlwaysFemale: '♀のみ', Genderless: '性別不明',
  FemaleOneEighth: '♂87.5% / ♀12.5%', Female25Percent: '♂75% / ♀25%',
  Female50Percent: '♂50% / ♀50%', Female75Percent: '♂25% / ♀75%',
  FemaleSevenEighths: '♂12.5% / ♀87.5%',
};
const ENC_JA = {
  Land: 'くさむら', LandMorning: 'くさむら（朝）', LandDay: 'くさむら（昼）', LandNight: 'くさむら（夜）',
  Cave: 'どうくつ', CaveMorning: 'どうくつ（朝）', CaveDay: 'どうくつ（昼）', CaveNight: 'どうくつ（夜）',
  Water: 'なみのり', WaterMorning: 'なみのり（朝）', WaterDay: 'なみのり（昼）', WaterNight: 'なみのり（夜）',
  OldRod: 'ボロのつりざお', GoodRod: 'いいつりざお', SuperRod: 'すごいつりざお',
  RockSmash: 'いわくだき', HeadbuttLow: 'ずつき（低）', HeadbuttHigh: 'ずつき（高）',
  BugContest: 'むしとりたいかい', PokeRadar: 'ポケトレ',
};
const POCKET_JA = {
  1: 'どうぐ', 2: 'かいふく', 3: 'ボール', 4: 'わざマシン', 5: 'きのみ',
  6: 'メール', 7: 'せんとう', 8: 'たいせつなもの', 9: 'Zクリスタル',
};
const TARGET_JA = {
  User: '自分', NearOther: '隣の1体', Other: '1体（離れていても可）', NearFoe: '隣の相手1体',
  RandomNearFoe: 'ランダムな相手1体', AllNearFoes: '相手全体', AllNearOthers: '自分以外の全員',
  NearAlly: '隣の味方1体', UserOrNearAlly: '自分か隣の味方', UserAndAllies: '自分と味方全員',
  AllAllies: '味方全員（自分以外）', AllBattlers: '場の全員', FoeSide: '相手の場',
  UserSide: '自分の場', BothSides: '両方の場', None: '—',
};
const FLAG_JA = {
  Contact: '接触', CanProtect: 'まもる有効', CanMirrorMove: 'オウムがえし可', Sound: '音',
  Punching: 'パンチ', Biting: 'かみつき', Pulse: '波動', Bomb: '弾', Dance: 'おどり',
  Slicing: '切る', Wind: '風', Powder: '粉', HighCriticalHitRate: '急所率↑',
  ThawsUser: 'こおり解除', CannotMetronome: 'ゆびをふる不可', TramplesMinimize: 'ちいさくなる特効',
};
// 「全ポケモン」に含める全国図鑑の上限 (これより後は独自ポケモン)
const NATIONAL_MAX = 1025;
// プラグイン由来のデータ (dump_plugins.rb)。Ruby が無い環境で生成すると null
const AV = D.avenue;
const OB = D.outbreak;
const OB_METHOD_JA = { land: 'くさむら', cave: 'どうくつ', water: 'なみのり', fishing: 'つり', contest: 'むしとりたいかい' };

const REAL_TYPES = Object.keys(D.types).filter(t => !D.types[t].pseudo && t !== 'STELLAR');
const REGION = D.region || '';
const DEX_NAME = REGION ? REGION.replace(/ちほう$|地方$/, '') + 'ずかん' : '地方図鑑';

document.getElementById('site-title').textContent = (REGION ? REGION + ' ' : '') + '攻略データベース';
document.title = (REGION ? REGION + ' ' : '') + '攻略データベース';

// =====================================================================
// 小物
// =====================================================================
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = encodeURIComponent;
// カタカナ→ひらがな・小文字化して検索をゆるくする
const norm = s => String(s ?? '').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s+/g, '');
const matches = (q, ...fields) => { const n = norm(q); return !n || fields.some(f => norm(f).includes(n)); };
const uniq = a => [...new Set(a)];
const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

window.fb = img => {
  const list = (img.dataset.fb || '').split('|').filter(Boolean);
  if (!list.length) { img.onerror = null; img.style.visibility = 'hidden'; return; }
  img.src = list.shift();
  img.dataset.fb = list.join('|');
};
// 1ファイル版 (build_mobile.py) では画像が window.WIKI_IMAGES に埋め込まれている
const IMGS = window.WIKI_IMAGES || null;
const BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const imgTag = (paths, attrs) => {
  paths = uniq(paths);
  if (IMGS) {
    const hit = paths.find(p => IMGS[p.slice(G.length)]);
    return `<img ${attrs || ''} src="${hit ? IMGS[hit.slice(G.length)] : BLANK_IMG}" alt="">`;
  }
  return `<img ${attrs || ''} src="${esc(paths[0])}" data-fb="${esc(paths.slice(1).join('|'))}" onerror="fb(this)" alt="">`;
};

const sp = id => D.species[id];
const withForm = (s, f) => (f && D.species[`${s}_${f}`] ? `${s}_${f}` : s);
const resolveSp = ref => {
  if (D.species[ref]) return ref;
  const m = /^(.*)_(\d+)$/.exec(ref);
  return m && D.species[m[1]] ? m[1] : ref;
};
const pkName = id => { const s = sp(id); return s ? s.n : id; };
const pkFull = id => { const s = sp(id); return s ? s.n + (s.f && s.fn ? `（${s.fn}）` : '') : id; };
const typeName = t => TYPE_JA[t] || (D.types[t] && D.types[t].id) || t;
const typeBadge = t => `<span class="type" style="--c:${TYPE_COLOR[t] || '#888'}">${esc(typeName(t))}</span>`;
const catBadge = c => `<span class="cat cat-${c}">${CAT_JA[c] || c}</span>`;
const moveName = m => (D.moves[m] ? D.moves[m].n : m);
const abilName = a => (D.abilities[a] ? D.abilities[a].n : a);
const itemName = i => (D.items[i] ? D.items[i].n : i);
const moveLink = m => (D.moves[m] ? `<a href="#/move/${m}">${esc(D.moves[m].n)}</a>` : esc(m));
const abilLink = a => (D.abilities[a] ? `<a href="#/ability/${a}">${esc(D.abilities[a].n)}</a>` : esc(a));
const mapName = id => (D.maps[id] && D.maps[id].n) || ENC_MAP_COMMENT[id] || `マップ${id}`;
const mapLink = id => `<a href="#/map/${id}">${esc(mapName(id))}</a>`;

const pkIcon = (id, lg) => {
  const s = sp(id), base = s ? s.sp : id;
  return `<span class="ico${lg ? ' lg' : ''}">${imgTag([`${G}Pokemon/Icons/${id}.png`, `${G}Pokemon/Icons/${base}.png`, `${G}Pokemon/Icons/000.png`], 'loading="lazy"')}</span>`;
};
const pkFront = (id, shiny, attrs) => {
  const s = sp(id), base = s ? s.sp : id, dir = shiny ? 'Front shiny' : 'Front';
  return imgTag([`${G}Pokemon/${dir}/${id}.png`, `${G}Pokemon/${dir}/${base}.png`, `${G}Pokemon/Front/${base}.png`, `${G}Pokemon/Front/000.png`], attrs);
};
const pkLink = (id, label) => `<a class="pk" href="#/pokemon/${id}">${pkIcon(id)}<span>${esc(label || pkFull(id))}</span></a>`;
const itemIconPaths = id => {
  const it = D.items[id], p = [`${G}Items/${id}.png`];
  if (it && it.mv && D.moves[it.mv]) p.push(`${G}Items/machine_${D.moves[it.mv].t}.png`);
  p.push(`${G}Items/000.png`);
  return p;
};
const itemIcon = id => imgTag(itemIconPaths(id), 'class="itemico" loading="lazy"');
const itemLink = i => (D.items[i] ? `<a href="#/item/${i}" class="nowrap">${itemIcon(i)}${esc(D.items[i].n)}</a>` : esc(i));

const eff = (atk, def) => {
  const t = D.types[def];
  if (!t) return 1;
  if (t.imm.includes(atk)) return 0;
  if (t.weak.includes(atk)) return 2;
  if (t.res.includes(atk)) return 0.5;
  return 1;
};
const mulLabel = m => ({ 4: '×4', 2: '×2', 1: '×1', 0.5: '×½', 0.25: '×¼', 0: '×0' }[m] || `×${m}`);
const mulClass = m => ({ 4: 'mul-4', 2: 'mul-2', 0.5: 'mul-05', 0.25: 'mul-025', 0: 'mul-0' }[m] || '');

const statColor = v => (v >= 150 ? '#18a3a3' : v >= 120 ? '#3fae4f' : v >= 90 ? '#9cc33b' : v >= 60 ? '#e3b52b' : v >= 30 ? '#ec8a2e' : '#e0473a');
const dispStats = bs => PBS_TO_DISP.map(i => (bs || [])[i] || 0);
const calcStat = (base, iv, ev, lv, mul, isHP) => {
  if (isHP) return base === 1 ? 1 : Math.floor((2 * base + iv + Math.floor(ev / 4)) * lv / 100) + lv + 10;
  return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * lv / 100) + 5) * mul);
};

function evoText(method, param) {
  const lv = `Lv.${param}`;
  switch (method) {
    case 'Level': return lv;
    case 'LevelMale': return `${lv}（♂）`;
    case 'LevelFemale': return `${lv}（♀）`;
    case 'LevelDay': return `${lv}（昼）`;
    case 'LevelNight': return `${lv}（夜）`;
    case 'LevelMorning': return `${lv}（朝）`;
    case 'LevelEvening': return `${lv}（夕方）`;
    case 'LevelRain': return `${lv}（雨の時）`;
    case 'LevelDarkInParty': return `${lv}（手持ちにあくタイプ）`;
    case 'LevelWalk': return `${param}歩あるいてレベルアップ`;
    case 'LevelRecoilDamage': return `反動ダメージを${param}受けてレベルアップ`;
    case 'LevelUseMoveCount': return `${moveName(param)}を20回使ってレベルアップ`;
    case 'LevelWithPartner': return `${lv}（通信プレイ中）`;
    case 'AttackGreater': return `${lv}（こうげき＞ぼうぎょ）`;
    case 'DefenseGreater': return `${lv}（こうげき＜ぼうぎょ）`;
    case 'AtkDefEqual': return `${lv}（こうげき＝ぼうぎょ）`;
    case 'Silcoon': case 'Cascoon': return `${lv}（個体で分岐）`;
    case 'Ninjask': return lv;
    case 'Shedinja': return '手持ちに空き＋ボール';
    case 'Happiness': return 'なつき度';
    case 'HappinessDay': return 'なつき度（昼）';
    case 'HappinessNight': return 'なつき度（夜）';
    case 'HappinessMoveType': return `${typeName(param)}わざを覚えてなつき度`;
    case 'Item': return `${itemName(param)}を使う`;
    case 'ItemMale': return `${itemName(param)}を使う（♂）`;
    case 'ItemFemale': return `${itemName(param)}を使う（♀）`;
    case 'ItemDay': return `${itemName(param)}を使う（昼）`;
    case 'ItemNight': return `${itemName(param)}を使う（夜）`;
    case 'Trade': return '通信交換';
    case 'TradeItem': return `${itemName(param)}を持たせて通信交換`;
    case 'TradeSpecies': return `${pkName(param)}と通信交換`;
    case 'HoldItem': return `${itemName(param)}を持たせてレベルアップ`;
    case 'DayHoldItem': return `${itemName(param)}を持たせて昼にレベルアップ`;
    case 'NightHoldItem': return `${itemName(param)}を持たせて夜にレベルアップ`;
    case 'HasMove': return `${moveName(param)}を覚えてレベルアップ`;
    case 'HasMoveType': return `${typeName(param)}わざを覚えてレベルアップ`;
    case 'HasInParty': return `${pkName(param)}を手持ちに入れてレベルアップ`;
    case 'Beauty': return `うつくしさ${param}以上`;
    case 'BattleDealCriticalHit': return `1回のバトルで急所に${param}回当てる`;
    case 'LocationFlag': return '特定の場所でレベルアップ';
    case 'Location': return `${mapName(param)}でレベルアップ`;
    case 'Event': return '特殊条件';
    case 'None': return '—';
    default: return `${method}${param ? ' ' + param : ''}`;
  }
}

// =====================================================================
// 逆引きインデックス
// =====================================================================
const ENC_MAP_COMMENT = {};
const IDX = {
  natNo: {}, dexNo: {}, dexList: [], learners: {}, abil: {}, held: {}, tm: {}, mega: {},
  enc: {}, prevo: {}, encMaps: [], av: {},
};
(function buildIndex() {
  let n = 0;
  for (const id of D.order) {
    const s = sp(id);
    if (!s.f) IDX.natNo[id] = ++n;
  }
  for (const id of D.order) { const s = sp(id); if (s.f) IDX.natNo[id] = IDX.natNo[s.sp]; }

  (D.dex[0] || []).forEach((ref, i) => {
    const id = resolveSp(ref);
    if (!D.species[id] || IDX.dexNo[id]) return;
    IDX.dexNo[id] = i + 1;
    IDX.dexList.push(id);
  });

  const same = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);
  const push = (o, k, v) => (o[k] || (o[k] = [])).push(v);
  for (const id of D.order) {
    const s = sp(id), base = s.f ? sp(s.sp) : null;
    if (!base || !same(s.lm, base.lm)) (s.lm || []).forEach(([lv, m]) => push(IDX.learners, m, { id, how: 'lv', lv }));
    if (!base || !same(s.tm, base.tm)) (s.tm || []).forEach(m => push(IDX.learners, m, { id, how: 'tm' }));
    if (!base || !same(s.em, base.em)) (s.em || []).forEach(m => push(IDX.learners, m, { id, how: 'egg' }));
    if (!base || !same(s.ab, base.ab) || !same(s.ha, base.ha)) {
      (s.ab || []).forEach(a => push(IDX.abil, a, { id, hidden: false }));
      (s.ha || []).forEach(a => { if (!(s.ab || []).includes(a)) push(IDX.abil, a, { id, hidden: true }); });
    }
    if (!base || !same([s.wic, s.wiu, s.wir], [base.wic, base.wiu, base.wir])) {
      if (s.wic) push(IDX.held, s.wic, { id, r: 50 });
      if (s.wiu) push(IDX.held, s.wiu, { id, r: 5 });
      if (s.wir) push(IDX.held, s.wir, { id, r: 1 });
    }
    if (s.mega) IDX.mega[s.mega] = id;
    if (!base || !same(s.evo, base.evo)) {
      (s.evo || []).forEach(([to, method, param]) => {
        if (!to) return;
        const tid = withForm(to, s.f);
        if (!D.species[tid]) return;
        const list = IDX.prevo[tid] || (IDX.prevo[tid] = []);
        if (!list.some(x => x.from === id && x.method === method && x.param === param)) list.push({ from: id, method, param });
      });
    }
  }
  for (const [id, it] of Object.entries(D.items)) if (it.mv && !IDX.tm[it.mv]) IDX.tm[it.mv] = id;

  // 野生の出現
  const byMap = {};
  for (const e of D.encounters) {
    if (e.c && !ENC_MAP_COMMENT[e.map]) ENC_MAP_COMMENT[e.map] = e.c;
    if (!byMap[e.map]) { byMap[e.map] = { map: e.map, entries: [] }; IDX.encMaps.push(byMap[e.map]); }
    byMap[e.map].entries.push(e);
    for (const [type, data] of Object.entries(e.e)) {
      const total = data.list.reduce((a, x) => a + x[0], 0) || 1;
      const agg = {};
      for (const [w, ref, lo, hi] of data.list) {
        const id = resolveSp(ref);
        const k = id;
        if (!agg[k]) agg[k] = { id, ref, w: 0, lo, hi };
        agg[k].w += w; agg[k].lo = Math.min(agg[k].lo, lo); agg[k].hi = Math.max(agg[k].hi, hi);
      }
      for (const a of Object.values(agg)) push(IDX.enc, a.id, { map: e.map, ver: e.ver, type, pct: a.w * 100 / total, lo: a.lo, hi: a.hi });
    }
  }
  // 大量発生 (002_Outbreak.rb の OUTBREAK_SPECIES)
  ((OB && OB.list) || []).forEach(([map, ref, lo, hi, methods]) => {
    const id = resolveSp(ref);
    let g = byMap[map];
    if (!g) { g = byMap[map] = { map, entries: [] }; IDX.encMaps.push(g); }
    (g.outbreaks || (g.outbreaks = [])).push({ id, lo, hi, methods: methods || [] });
    push(IDX.enc, id, { map, ver: 0, type: 'Outbreak', methods: methods || [], pct: OB.chance, lo, hi });
  });
})();
const obMethods = ms => ms.map(m => OB_METHOD_JA[m] || m).join('・');
const obNote = () => (OB ? `${OB.switch > 0 ? '殿堂入り後、' : ''}${OB.time}時間ごとに 下の${OB.list.length}か所から1つ（各1/${OB.list.length}）が選ばれ、その場所で出る野生ポケモンの ${OB.chance}% が入れ替わります。` : '');


// =====================================================================
// 汎用リスト (検索・絞り込み・並べ替え)
// =====================================================================
const STATE = {};
function renderList(cfg, query) {
  const st = STATE[cfg.id] || (STATE[cfg.id] = Object.assign({ sort: null, dir: 1 }, cfg.defaults || {}));
  if (query) Object.assign(st, query);
  $app.innerHTML = `
    <h1>${cfg.title}</h1>
    ${cfg.intro || ''}
    <div class="controls">${cfg.controls(st)}</div>
    <div class="count"></div>
    <div class="tbl-wrap"><table class="list"><thead><tr>${cfg.cols.map((c, i) =>
      `<th data-i="${i}" class="${c.num ? 'num ' : ''}${c.val ? 'sortable' : ''}">${c.label}</th>`).join('')}</tr></thead><tbody></tbody></table></div>`;
  const tbody = $app.querySelector('table.list tbody');
  const count = $app.querySelector('.count');
  const ths = [...$app.querySelectorAll('table.list th')];
  const update = () => {
    let rows = cfg.rows(st).filter(r => cfg.filter(r, st));
    if (st.sort != null && cfg.cols[st.sort] && cfg.cols[st.sort].val) {
      const g = cfg.cols[st.sort].val;
      rows = rows.map((r, i) => [r, i]).sort((a, b) => cmp(g(a[0], st), g(b[0], st)) * st.dir || a[1] - b[1]).map(x => x[0]);
    }
    tbody.innerHTML = rows.map(r => `<tr>${cfg.cols.map(c => `<td class="${c.cls || ''}${c.num ? ' num' : ''}">${c.html(r, st)}</td>`).join('')}</tr>`).join('')
      || `<tr><td colspan="${cfg.cols.length}" class="muted">該当なし</td></tr>`;
    count.textContent = `${rows.length} 件`;
    ths.forEach((th, i) => th.classList.toggle('sorted-asc', st.sort === i && st.dir === 1));
    ths.forEach((th, i) => th.classList.toggle('sorted-desc', st.sort === i && st.dir === -1));
  };
  let timer = null;
  $app.querySelectorAll('[data-f]').forEach(el => {
    if (el.tagName === 'BUTTON') {
      el.classList.toggle('on', String(st[el.dataset.f]) === el.dataset.v);
      el.addEventListener('click', () => {
        st[el.dataset.f] = el.dataset.v;
        $app.querySelectorAll(`button[data-f="${el.dataset.f}"]`).forEach(b => b.classList.toggle('on', b === el));
        update();
      });
    } else {
      el.value = st[el.dataset.f] ?? '';
      el.addEventListener('input', () => {
        st[el.dataset.f] = el.value;
        clearTimeout(timer);
        timer = setTimeout(update, el.tagName === 'INPUT' ? 120 : 0);
      });
    }
  });
  ths.forEach((th, i) => th.addEventListener('click', () => {
    const c = cfg.cols[i];
    if (!c.val) return;
    if (st.sort === i) st.dir *= -1; else { st.sort = i; st.dir = c.num ? -1 : 1; }
    update();
  }));
  update();
}
const typeSelect = (f, label) => `<select data-f="${f}"><option value="">${label}</option>${REAL_TYPES.map(t => `<option value="${t}">${typeName(t)}</option>`).join('')}</select>`;
const seg = (f, opts) => `<span class="seg">${opts.map(([v, l]) => `<button data-f="${f}" data-v="${v}">${l}</button>`).join('')}</span>`;

// =====================================================================
// ページ: ホーム
// =====================================================================
function pageHome() {
  const baseCount = D.order.filter(id => !sp(id).f).length;
  const cards = [
    ['#/pokemon', 'ポケモン', `${IDX.dexList.length ? DEX_NAME + ' ' + IDX.dexList.length + '匹 / ' : ''}全${baseCount}種`, '種族値・タイプ相性・覚えるわざ・進化・出現場所'],
    ['#/moves', 'わざ', `${Object.keys(D.moves).length}件`, '威力・命中・効果・覚えるポケモン'],
    ['#/abilities', 'とくせい', `${Object.keys(D.abilities).length}件`, '効果と持っているポケモン'],
    ['#/items', 'どうぐ', `${Object.keys(D.items).length}件`, '効果・値段・野生の持ち物'],
    ['#/maps', '出現場所', `${IDX.encMaps.length}マップ`, `野生ポケモンの出現率・レベル${OB && OB.list.length ? '・大量発生' : ''}`],
    ...(AV ? [['#/avenue', AV.name, `${Object.keys(AV.shop_types).length}店`, 'お店の品ぞろえ・くじ・鑑定・おみやげ']] : []),
  ];
  $app.innerHTML = `
    <div class="hero">
      <h1>${esc(REGION)} 攻略データベース</h1>
      <input id="hero-search" type="search" placeholder="なまえで検索（ひらがな可）">
    </div>
    <div class="cards">${cards.map(c => `<a class="card" href="${c[0]}"><div class="t">${c[1]}</div><div class="n">${c[2]}</div><div class="d">${c[3]}</div></a>`).join('')}</div>`;
  const hs = document.getElementById('hero-search');
  hs.addEventListener('keydown', e => { if (e.key === 'Enter' && hs.value.trim()) location.hash = `#/search/${enc(hs.value.trim())}`; });
  hs.focus();
}

// =====================================================================
// ページ: ポケモン一覧
// =====================================================================
function pagePokemonList(query) {
  const hasDex = IDX.dexList.length > 0;
  renderList({
    id: 'pokemon',
    title: 'ポケモン一覧',
    defaults: { q: '', type: '', scope: hasDex ? 'dex' : 'all' },
    controls: () => `
      <input type="search" data-f="q" placeholder="なまえ・とくせいで絞り込み">
      ${typeSelect('type', 'タイプ: すべて')}
      ${seg('scope', [...(hasDex ? [['dex', DEX_NAME]] : []), ['all', `全ポケモン（No.${NATIONAL_MAX}まで）`], ['forms', 'フォルム含む']])}`,
    rows: st => (st.scope === 'dex' ? IDX.dexList : D.order),
    filter: (id, st) => {
      const s = sp(id);
      if (st.scope === 'dex' && !IDX.dexNo[id]) return false;
      if (st.scope === 'all' && (s.f || IDX.natNo[id] > NATIONAL_MAX)) return false;
      if (st.type && !(s.t || []).includes(st.type)) return false;
      return matches(st.q, s.n, s.fn, id, ...(s.ab || []).map(abilName), ...(s.ha || []).map(abilName));
    },
    cols: [
      { label: 'No.', num: true, val: (id, st) => (st.scope === 'dex' ? IDX.dexNo[id] : IDX.natNo[id] + (sp(id).f || 0) / 100),
        html: (id, st) => String(st.scope === 'dex' ? IDX.dexNo[id] : IDX.natNo[id]).padStart(3, '0') },
      { label: 'ポケモン', val: id => norm(pkName(id)), html: id => pkLink(id) },
      { label: 'タイプ', val: id => (sp(id).t || []).join(), html: id => uniq(sp(id).t || []).map(typeBadge).join(''), cls: 'nowrap' },
      { label: 'とくせい', html: id => { const s = sp(id); return [...(s.ab || []).map(abilLink), ...(s.ha || []).filter(a => !(s.ab || []).includes(a)).map(a => abilLink(a) + '<span class="ha">夢</span>')].join(' / '); }, cls: 'small' },
      ...STAT_LABEL.map((l, i) => ({ label: l === 'HP' ? 'H' : l[0] === 'こ' ? 'A' : l === 'ぼうぎょ' ? 'B' : l === 'とくこう' ? 'C' : l === 'とくぼう' ? 'D' : 'S', num: true,
        val: id => dispStats(sp(id).bs)[i], html: id => dispStats(sp(id).bs)[i] })),
      { label: '合計', num: true, cls: 'total', val: id => (sp(id).bs || []).reduce((a, b) => a + b, 0), html: id => (sp(id).bs || []).reduce((a, b) => a + b, 0) },
    ],
  }, query);
}

// =====================================================================
// ページ: ポケモン詳細
// =====================================================================
function eggMovesOf(id) {
  let cur = id;
  for (let i = 0; i < 8 && cur; i++) {
    const s = sp(cur);
    if (s && s.em && s.em.length) return { list: s.em, from: cur };
    const pv = IDX.prevo[cur];
    cur = pv && pv.length ? pv[0].from : null;
  }
  return { list: [], from: id };
}
function evoRoot(id) {
  let cur = id;
  for (let i = 0; i < 10 && IDX.prevo[cur] && IDX.prevo[cur].length; i++) cur = IDX.prevo[cur][0].from;
  return cur;
}
function evoKids(id) {
  const s = sp(id);
  const out = [];
  (s.evo || []).forEach(([to, method, param]) => {
    const tid = withForm(to, s.f);
    if (!D.species[tid] || !to) return;
    const text = evoText(method, param);
    const o = out.find(x => x.to === tid);
    if (!o) out.push({ to: tid, texts: [text] });
    else if (!o.texts.includes(text)) o.texts.push(text);
  });
  return out;
}
function evoHTML(id, cur, depth) {
  const kids = depth < 6 ? evoKids(id) : [];
  return `<div class="evo-branch"><div class="evo-mon${id === cur ? ' cur' : ''}"><a href="#/pokemon/${id}">${pkFront(id, false, 'class="mini" loading="lazy"')}<div>${esc(pkFull(id))}</div></a>${uniq(sp(id).t || []).map(typeBadge).join('')}</div>${
    kids.length ? `<div class="evo-kids">${kids.map(k => `<div class="evo-kid"><div class="evo-arrow">${k.texts.map(esc).join('<br>または<br>')}<span>→</span></div>${evoHTML(k.to, cur, depth + 1)}</div>`).join('')}</div>` : ''}</div>`;
}
function defenseHTML(types) {
  types = uniq(types || []);
  const groups = {};
  REAL_TYPES.forEach(a => { const m = types.reduce((acc, d) => acc * eff(a, d), 1); (groups[m] || (groups[m] = [])).push(a); });
  return [4, 2, 0.5, 0.25, 0].filter(m => groups[m]).map(m =>
    `<div class="eff-group"><span class="mul ${mulClass(m)}">${mulLabel(m)}</span><div>${groups[m].map(typeBadge).join('')}</div></div>`).join('')
    || '<p class="muted">弱点・耐性なし</p>';
}
function moveTable(rows, firstLabel) {
  if (!rows.length) return '<p class="muted">なし</p>';
  return `<div class="tbl-wrap"><table><thead><tr><th>${firstLabel}</th><th>わざ</th><th>タイプ</th><th>分類</th><th class="num">威力</th><th class="num">命中</th><th class="num">PP</th><th>説明</th></tr></thead><tbody>${
    rows.map(r => { const m = D.moves[r.m]; return `<tr><td class="nowrap">${r.pre}</td><td class="nowrap">${moveLink(r.m)}</td>${m ? `<td>${typeBadge(m.t)}</td><td>${catBadge(m.c)}</td><td class="num">${m.p > 1 ? m.p : m.p === 1 ? '可変' : '—'}</td><td class="num">${m.a || '—'}</td><td class="num">${m.pp}</td><td class="desc">${esc(m.d)}</td>` : '<td colspan="6" class="muted">データなし</td>'}</tr>`; }).join('')
  }</tbody></table></div>`;
}

function pagePokemon(id) {
  const s = sp(id);
  if (!s) return notFound();
  const forms = D.order.filter(x => sp(x).sp === s.sp);
  const bs = dispStats(s.bs);
  const total = bs.reduce((a, b) => a + b, 0);
  const abil = [...(s.ab || []).map(a => [a, false]), ...(s.ha || []).filter(a => !(s.ab || []).includes(a)).map(a => [a, true])];

  // 進化
  let root = evoRoot(id);
  if (root === id && !evoKids(id).length && s.f) root = evoRoot(s.sp);
  const evoBlock = (root === id && !evoKids(id).length) ? '<p class="muted">進化しない</p>' : `<div class="evo">${evoHTML(root, id, 0)}</div>`;

  // 覚えるわざ
  const lvRows = (s.lm || []).map(([lv, m]) => ({ m, pre: lv === 0 ? '進化時' : `Lv.${lv}` }));
  const tmRows = (s.tm || []).map(m => ({ m, tm: IDX.tm[m] }))
    .sort((a, b) => (a.tm ? 0 : 1) - (b.tm ? 0 : 1) || cmp(a.tm || '', b.tm || '') || cmp(norm(moveName(a.m)), norm(moveName(b.m))))
    .map(r => ({ m: r.m, pre: r.tm ? `<a href="#/item/${r.tm}">${esc(itemName(r.tm))}</a>` : '<span class="muted">おしえ</span>' }));
  const egg = eggMovesOf(id);
  const eggRows = egg.list.map(m => ({ m, pre: 'タマゴ' }));

  // 出現・トレーナー
  const encs = (IDX.enc[id] || []).slice().sort((a, b) => a.map - b.map);
  const held = [['wic', 50], ['wiu', 5], ['wir', 1]].filter(([k]) => s[k]).map(([k, r]) => `${itemLink(s[k])} <span class="muted">(${r}%)</span>`);

  const no = [IDX.dexNo[id] ? `${DEX_NAME} No.${String(IDX.dexNo[id]).padStart(3, '0')}` : '', `全国 No.${String(IDX.natNo[id]).padStart(4, '0')}`].filter(Boolean).join(' / ');
  const lv50 = (i, b) => { const hp = i === 0; return `${calcStat(b, 0, 0, 50, hp ? 1 : 0.9, hp)}–${calcStat(b, 31, 252, 50, hp ? 1 : 1.1, hp)}`; };
  const lv100 = (i, b) => { const hp = i === 0; return `${calcStat(b, 0, 0, 100, hp ? 1 : 0.9, hp)}–${calcStat(b, 31, 252, 100, hp ? 1 : 1.1, hp)}`; };

  $app.innerHTML = `
    <div class="crumb"><a href="#/pokemon">ポケモン一覧</a> › ${esc(pkFull(id))}</div>
    <div class="panel">
      <div class="dex-head">
        <div class="sprite-box">
          <div id="spr">${pkFront(id, false, 'class="sprite"')}</div>
          <button class="btn small" id="shiny-btn">色違い</button>
        </div>
        <div class="info">
          <div class="no">${no}</div>
          <p class="name">${esc(s.n)}${s.f && s.fn ? `<span class="form">${esc(s.fn)}</span>` : ''}</p>
          <div>${uniq(s.t || []).map(typeBadge).join('')}</div>
          ${forms.length > 1 ? `<div class="forms">${forms.map(f => `<a href="#/pokemon/${f}" class="${f === id ? 'on' : ''}">${pkIcon(f)}${esc(sp(f).fn || (sp(f).f ? 'フォルム' + sp(f).f : 'ノーマル'))}</a>`).join('')}</div>` : ''}
          <table class="kv"><tbody>
            <tr><th>分類</th><td>${esc(s.cat || '—')}ポケモン</td></tr>
            <tr><th>たかさ / おもさ</th><td>${s.ht ?? '—'} m / ${s.wt ?? '—'} kg</td></tr>
            <tr><th>とくせい</th><td>${abil.map(([a, h]) => `<div>${abilLink(a)}${h ? '<span class="ha">夢</span>' : ''} <span class="muted small">${esc(D.abilities[a] ? D.abilities[a].d : '')}</span></div>`).join('') || '—'}</td></tr>
            ${s.mega ? `<tr><th>メガストーン</th><td>${itemLink(s.mega)}</td></tr>` : ''}
          </tbody></table>
          ${s.dex ? `<div class="dex-text">${esc(s.dex)}</div>` : ''}
        </div>
      </div>
    </div>

    <div class="grid2">
      <div class="panel">
        <h2>種族値</h2>
        <table><thead><tr><th></th><th class="num">値</th><th></th><th class="num">Lv50</th><th class="num">Lv100</th></tr></thead><tbody>
          ${bs.map((b, i) => `<tr class="stat-row"><td class="stat-name">${STAT_LABEL[i]}</td><td class="num"><b>${b}</b></td><td class="bar-cell"><div class="bar" style="width:${Math.min(100, b / 2)}%;--c:${statColor(b)}"></div></td><td class="num small">${lv50(i, b)}</td><td class="num small">${lv100(i, b)}</td></tr>`).join('')}
          <tr class="stat-row"><td class="stat-name"><b>合計</b></td><td class="num"><b>${total}</b></td><td colspan="3" class="small muted">実数値は 個体値0・努力値0・下降補正 〜 個体値31・努力値252・上昇補正</td></tr>
        </tbody></table>
      </div>
      <div class="panel">
        <h2>ぼうぎょ相性</h2>
        ${defenseHTML(s.t)}
        <p class="small muted">とくせいによる無効化などは含みません。</p>
      </div>
    </div>
    <div style="height:16px"></div>

    <div class="panel"><h2>進化</h2>${evoBlock}</div>

    <div class="grid2">
      <div class="panel"><h2>そだて・タマゴ</h2><table class="kv"><tbody>
        <tr><th>タマゴグループ</th><td>${(s.eg || []).map(g => EGG_JA[g] || g).join('・') || '—'}</td></tr>
        <tr><th>性別</th><td>${GENDER_JA[s.gender] || s.gender || '—'}</td></tr>
        <tr><th>孵化歩数</th><td>${s.hatch ?? '—'}</td></tr>
        <tr><th>成長</th><td>${GROWTH_JA[s.gr] || s.gr || '—'}</td></tr>
        <tr><th>初期なつき度</th><td>${s.hap ?? '—'}</td></tr>
      </tbody></table></div>
      <div class="panel"><h2>バトル・捕獲</h2><table class="kv"><tbody>
        <tr><th>捕捉率</th><td>${s.cr ?? '—'}</td></tr>
        <tr><th>基礎経験値</th><td>${s.exp ?? '—'}</td></tr>
        <tr><th>もらえる努力値</th><td>${(s.ev || []).map(([k, v]) => `${STAT_ID_JA[k] || k} +${v}`).join('、') || '—'}</td></tr>
        <tr><th>野生の持ち物</th><td>${held.join('<br>') || 'なし'}</td></tr>      </tbody></table></div>
    </div>
    <div style="height:16px"></div>

    <div class="panel"><h2>レベルで覚えるわざ</h2>${moveTable(lvRows, 'Lv')}</div>
    <div class="panel"><h2>わざマシン・おしえわざ</h2>${moveTable(tmRows, 'マシン')}</div>
    <div class="panel"><h2>タマゴわざ</h2>${egg.from !== id && egg.list.length ? `<p class="small muted">${pkLink(egg.from)} のタマゴわざを引き継ぎます。</p>` : ''}${moveTable(eggRows, '')}</div>

    <div class="panel"><h2>野生の出現場所</h2>${encs.length ? `<div class="tbl-wrap"><table><thead><tr><th>場所</th><th>方法</th><th class="num">レベル</th><th class="num">出現率</th></tr></thead><tbody>${
      encs.map(e => `<tr><td>${mapLink(e.map)}${e.ver ? ` <span class="tag">版${e.ver}</span>` : ''}</td><td>${e.type === 'Outbreak' ? `<span class="ob">大量発生</span>（${obMethods(e.methods)}）` : ENC_JA[e.type] || e.type}</td><td class="num">${e.lo === e.hi ? e.lo : `${e.lo}–${e.hi}`}</td><td class="num">${e.type === 'Outbreak' ? `発生中 ${e.pct}%` : `${e.pct.toFixed(e.pct < 1 ? 1 : 0)}%`}</td></tr>`).join('')}</tbody></table></div>${encs.some(e => e.type === 'Outbreak') ? `<p class="small muted">大量発生: ${esc(obNote())}</p>` : ''}` : '<p class="muted">野生では出現しません（イベント・交換・進化などで入手）。</p>'}</div>

  `;
  let shiny = false;
  document.getElementById('shiny-btn').addEventListener('click', e => {
    shiny = !shiny;
    document.getElementById('spr').innerHTML = pkFront(id, shiny, 'class="sprite"');
    e.target.textContent = shiny ? 'ふつう' : '色違い';
  });
}

// =====================================================================
// ページ: わざ
// =====================================================================
function pageMoveList(query) {
  renderList({
    id: 'moves',
    title: 'わざ一覧',
    defaults: { q: '', type: '', cat: '' },
    controls: () => `<input type="search" data-f="q" placeholder="わざ名・説明で絞り込み">${typeSelect('type', 'タイプ: すべて')}
      <select data-f="cat"><option value="">分類: すべて</option><option value="Physical">物理</option><option value="Special">特殊</option><option value="Status">変化</option></select>`,
    rows: () => Object.keys(D.moves),
    filter: (m, st) => { const x = D.moves[m]; return (!st.type || x.t === st.type) && (!st.cat || x.c === st.cat) && matches(st.q, x.n, m, x.d); },
    cols: [
      { label: 'わざ', val: m => norm(D.moves[m].n), html: m => moveLink(m), cls: 'nowrap' },
      { label: 'タイプ', val: m => REAL_TYPES.indexOf(D.moves[m].t), html: m => typeBadge(D.moves[m].t) },
      { label: '分類', val: m => D.moves[m].c, html: m => catBadge(D.moves[m].c) },
      { label: '威力', num: true, val: m => D.moves[m].p, html: m => (D.moves[m].p > 1 ? D.moves[m].p : D.moves[m].p === 1 ? '可変' : '—') },
      { label: '命中', num: true, val: m => D.moves[m].a || 999, html: m => D.moves[m].a || '—' },
      { label: 'PP', num: true, val: m => D.moves[m].pp, html: m => D.moves[m].pp },
      { label: '優先', num: true, val: m => D.moves[m].pr, html: m => (D.moves[m].pr ? (D.moves[m].pr > 0 ? '+' : '') + D.moves[m].pr : '') },
      { label: '説明', html: m => esc(D.moves[m].d), cls: 'desc' },
    ],
  }, query);
}

function learnerGrid(list, note) {
  if (!list.length) return '<p class="muted">なし</p>';
  return `<div class="pk-grid">${list.map(l => `<span class="cell">${pkLink(l.id)}${note && note(l) ? `<span class="note">${note(l)}</span>` : ''}</span>`).join('')}</div>`;
}

function pageMove(mid) {
  const m = D.moves[mid];
  if (!m) return notFound();
  const ls = IDX.learners[mid] || [];
  const byNo = (a, b) => IDX.natNo[a.id] - IDX.natNo[b.id] || (sp(a.id).f || 0) - (sp(b.id).f || 0);
  const lv = ls.filter(l => l.how === 'lv').sort(byNo);
  const lvDedup = []; lv.forEach(l => { const e = lvDedup.find(x => x.id === l.id); if (e) e.lvs.push(l.lv); else lvDedup.push({ id: l.id, lvs: [l.lv] }); });
  const tm = uniq(ls.filter(l => l.how === 'tm').sort(byNo).map(l => l.id)).map(id => ({ id }));
  const egg = uniq(ls.filter(l => l.how === 'egg').sort(byNo).map(l => l.id)).map(id => ({ id }));
  $app.innerHTML = `
    <div class="crumb"><a href="#/moves">わざ一覧</a> › ${esc(m.n)}</div>
    <div class="panel">
      <h1>${esc(m.n)} ${typeBadge(m.t)} ${catBadge(m.c)}</h1>
      <p>${esc(m.d)}</p>
      <table class="kv"><tbody>
        <tr><th>威力</th><td>${m.p > 1 ? m.p : m.p === 1 ? '可変' : '—'}</td></tr>
        <tr><th>命中</th><td>${m.a || '必中'}</td></tr>
        <tr><th>PP</th><td>${m.pp}（最大 ${Math.floor(m.pp * 8 / 5)}）</td></tr>
        <tr><th>優先度</th><td>${m.pr > 0 ? '+' : ''}${m.pr}</td></tr>
        <tr><th>範囲</th><td>${TARGET_JA[m.tg] || esc(m.tg)}</td></tr>
        ${m.ec ? `<tr><th>追加効果率</th><td>${m.ec}%</td></tr>` : ''}
        <tr><th>特徴</th><td>${m.fl.map(f => `<span class="tag">${esc(FLAG_JA[f] || f)}</span>`).join('') || '—'}</td></tr>
        ${IDX.tm[mid] ? `<tr><th>わざマシン</th><td>${itemLink(IDX.tm[mid])}</td></tr>` : ''}
        <tr><th>内部コード</th><td class="small muted">${esc(mid)} / ${esc(m.fc || 'None')}</td></tr>
      </tbody></table>
    </div>
    <div class="panel"><h2>レベルで覚える（${lvDedup.length}）</h2>${learnerGrid(lvDedup, l => l.lvs.map(x => (x === 0 ? '進化時' : `Lv.${x}`)).join('/'))}</div>
    <div class="panel"><h2>わざマシン・おしえわざ（${tm.length}）</h2>${learnerGrid(tm)}</div>
    <div class="panel"><h2>タマゴわざ（${egg.length}）</h2>${learnerGrid(egg)}</div>`;
}

// =====================================================================
// ページ: とくせい
// =====================================================================
function pageAbilityList(query) {
  renderList({
    id: 'abilities',
    title: 'とくせい一覧',
    defaults: { q: '' },
    controls: () => '<input type="search" data-f="q" placeholder="とくせい名・説明で絞り込み">',
    rows: () => Object.keys(D.abilities),
    filter: (a, st) => matches(st.q, D.abilities[a].n, a, D.abilities[a].d),
    cols: [
      { label: 'とくせい', val: a => norm(D.abilities[a].n), html: a => abilLink(a), cls: 'nowrap' },
      { label: '説明', html: a => esc(D.abilities[a].d), cls: 'desc' },
      { label: '所持', num: true, val: a => (IDX.abil[a] || []).length, html: a => (IDX.abil[a] || []).length },
    ],
  }, query);
}
function pageAbility(aid) {
  const a = D.abilities[aid];
  if (!a) return notFound();
  const us = (IDX.abil[aid] || []).slice().sort((x, y) => IDX.natNo[x.id] - IDX.natNo[y.id]);
  $app.innerHTML = `
    <div class="crumb"><a href="#/abilities">とくせい一覧</a> › ${esc(a.n)}</div>
    <div class="panel"><h1>${esc(a.n)}</h1><p>${esc(a.d)}</p><p class="small muted">${esc(aid)}</p></div>
    <div class="panel"><h2>通常とくせいで持つ（${us.filter(u => !u.hidden).length}）</h2>${learnerGrid(us.filter(u => !u.hidden))}</div>
    <div class="panel"><h2>夢とくせいで持つ（${us.filter(u => u.hidden).length}）</h2>${learnerGrid(us.filter(u => u.hidden))}</div>`;
}

// =====================================================================
// ページ: どうぐ
// =====================================================================
function pageItemList(query) {
  const pockets = uniq(Object.values(D.items).map(i => i.pk)).sort((a, b) => a - b);
  renderList({
    id: 'items',
    title: 'どうぐ一覧',
    defaults: { q: '', pk: '' },
    controls: () => `<input type="search" data-f="q" placeholder="どうぐ名・説明で絞り込み">
      <select data-f="pk"><option value="">ポケット: すべて</option>${pockets.map(p => `<option value="${p}">${POCKET_JA[p] || 'ポケット' + p}</option>`).join('')}</select>`,
    rows: () => Object.keys(D.items),
    filter: (i, st) => { const x = D.items[i]; return (!st.pk || String(x.pk) === st.pk) && matches(st.q, x.n, i, x.d, x.mv ? moveName(x.mv) : ''); },
    cols: [
      { label: 'どうぐ', val: i => norm(D.items[i].n), html: i => itemLink(i) },
      { label: 'ポケット', val: i => D.items[i].pk, html: i => POCKET_JA[D.items[i].pk] || D.items[i].pk, cls: 'nowrap small' },
      { label: '買値', num: true, val: i => D.items[i].pr, html: i => (D.items[i].pr ? D.items[i].pr.toLocaleString() + '円' : '—') },
      { label: 'BP', num: true, val: i => D.items[i].bp, html: i => D.items[i].bp || '' },
      { label: '説明', html: i => (D.items[i].mv ? `${moveLink(D.items[i].mv)} ` : '') + esc(D.items[i].d), cls: 'desc' },
    ],
  }, query);
}
function pageItem(iid) {
  const it = D.items[iid];
  if (!it) return notFound();
  const holders = (IDX.held[iid] || []).slice().sort((a, b) => IDX.natNo[a.id] - IDX.natNo[b.id]);
  const evoUsers = [];
  for (const id of D.order) (sp(id).evo || []).forEach(([to, method, param]) => { if (param === iid && to) evoUsers.push({ id, to: withForm(to, sp(id).f), method }); });
  const m = it.mv && D.moves[it.mv];
  $app.innerHTML = `
    <div class="crumb"><a href="#/items">どうぐ一覧</a> › ${esc(it.n)}</div>
    <div class="panel">
      <h1>${imgTag(itemIconPaths(iid), 'style="width:48px;height:48px;vertical-align:middle;image-rendering:pixelated"')} ${esc(it.n)}</h1>
      <p>${esc(it.d)}</p>
      ${it.hd ? `<p class="small muted">持たせた時: ${esc(it.hd)}</p>` : ''}
      <table class="kv"><tbody>
        <tr><th>ポケット</th><td>${POCKET_JA[it.pk] || it.pk}</td></tr>
        <tr><th>買値 / 売値</th><td>${it.pr ? it.pr.toLocaleString() + '円' : '—'} / ${it.sp ? it.sp.toLocaleString() + '円' : '—'}</td></tr>
        ${it.bp ? `<tr><th>BP</th><td>${it.bp}</td></tr>` : ''}
        ${m ? `<tr><th>わざ</th><td>${moveLink(it.mv)} ${typeBadge(m.t)} ${catBadge(m.c)} 威力${m.p > 1 ? m.p : '—'} / 命中${m.a || '—'}</td></tr>` : ''}
        ${IDX.mega[iid] ? `<tr><th>メガシンカ</th><td>${pkLink(IDX.mega[iid])}</td></tr>` : ''}
        <tr><th>内部名</th><td class="small muted">${esc(iid)}</td></tr>
      </tbody></table>
    </div>
    ${m ? `<div class="panel"><h2>このわざマシンで覚える（${uniq((IDX.learners[it.mv] || []).filter(l => l.how === 'tm').map(l => l.id)).length}）</h2>${learnerGrid(uniq((IDX.learners[it.mv] || []).filter(l => l.how === 'tm').map(l => l.id)).map(id => ({ id })))}</div>` : ''}
    ${evoUsers.length ? `<div class="panel"><h2>進化に使う</h2><div class="pk-grid">${evoUsers.map(e => `<span class="cell">${pkLink(e.id)} → ${pkLink(e.to)}<span class="note">${esc(evoText(e.method, iid))}</span></span>`).join('')}</div></div>` : ''}
    ${IDX.av[iid] ? `<div class="panel"><h2>${esc(AV.name)}で入手</h2><ul class="src">${IDX.av[iid].map(h => `<li>${h}</li>`).join('')}</ul>${avLockedBadges(iid) ? `<p class="small muted">バッジ${avLockedBadges(iid)}個そろうまでは出ません。</p>` : ''}</div>` : ''}
    <div class="panel"><h2>野生で持っている</h2>${learnerGrid(holders, h => `${h.r}%`)}</div>`;
}

// =====================================================================
// ページ: 出現場所
// =====================================================================
function outbreakTable(list) {
  return `<div class="tbl-wrap"><table><thead><tr><th>場所</th><th>ポケモン</th><th>タイプ</th><th>方法</th><th class="num">レベル</th></tr></thead><tbody>${
    list.map(o => `<tr><td class="nowrap">${mapLink(o.map)}</td><td>${pkLink(o.id)}</td><td class="nowrap">${uniq((sp(o.id) || {}).t || []).map(typeBadge).join('')}</td><td>${obMethods(o.methods)}</td><td class="num">${o.lo === o.hi ? o.lo : `${o.lo}–${o.hi}`}</td></tr>`).join('')
  }</tbody></table></div>`;
}
function pageMapList(query) {
  const obs = IDX.encMaps.flatMap(g => (g.outbreaks || []).map(o => ({ ...o, map: g.map })));
  renderList({
    id: 'maps',
    title: '野生ポケモンの出現場所',
    intro: obs.length ? `<div class="panel"><h2>大量発生</h2><p class="small">${esc(obNote())}</p>${outbreakTable(obs)}</div><h2>通常の出現</h2>` : '',
    defaults: { q: '' },
    controls: () => '<input type="search" data-f="q" placeholder="場所・ポケモン名で絞り込み">',
    rows: () => IDX.encMaps,
    filter: (g, st) => matches(st.q, mapName(g.map), ...g.entries.flatMap(e => Object.values(e.e).flatMap(x => x.list.map(l => pkName(resolveSp(l[1]))))), ...(g.outbreaks || []).map(o => pkName(o.id))),
    cols: [
      { label: '場所', val: g => norm(mapName(g.map)), html: g => mapLink(g.map), cls: 'nowrap' },
      { label: '方法', html: g => uniq(g.entries.flatMap(e => Object.keys(e.e))).map(t => `<span class="tag">${ENC_JA[t] || t}</span>`).join('') + (g.outbreaks ? '<span class="tag ob">大量発生</span>' : '') },
      { label: 'レベル', num: true, val: g => Math.min(...g.entries.flatMap(e => Object.values(e.e).flatMap(x => x.list.map(l => l[2])))),
        html: g => { const all = g.entries.flatMap(e => Object.values(e.e).flatMap(x => x.list)); return all.length ? `${Math.min(...all.map(l => l[2]))}–${Math.max(...all.map(l => l[3]))}` : '—'; } },
      { label: '出現ポケモン', html: g => uniq(g.entries.flatMap(e => Object.values(e.e).flatMap(x => x.list.map(l => resolveSp(l[1]))))).map(id => `<a href="#/pokemon/${id}" title="${esc(pkFull(id))}">${pkIcon(id)}</a>`).join('') },
    ],
  }, query);
}
function pageMap(mapId) {
  mapId = Number(mapId);
  const g = IDX.encMaps.find(x => x.map === mapId);
  if (!g) return notFound();
  const sections = g.entries.map(e => Object.entries(e.e).map(([type, data]) => {
    const total = data.list.reduce((a, x) => a + x[0], 0) || 1;
    const rows = data.list.slice().sort((a, b) => b[0] - a[0]);
    return `<div class="panel"><h2>${ENC_JA[type] || type}${e.ver ? ` <span class="tag">版${e.ver}</span>` : ''} <span class="small muted">エンカウント率 ${data.rate}</span></h2>
      <div class="tbl-wrap"><table><thead><tr><th>ポケモン</th><th>タイプ</th><th class="num">レベル</th><th class="num">出現率</th></tr></thead><tbody>${
        rows.map(([w, ref, lo, hi]) => { const id = resolveSp(ref); return `<tr><td>${pkLink(id)}</td><td class="nowrap">${uniq((sp(id) || {}).t || []).map(typeBadge).join('')}</td><td class="num">${lo === hi ? lo : `${lo}–${hi}`}</td><td class="num">${(w * 100 / total).toFixed(w * 100 / total < 1 ? 1 : 0)}%</td></tr>`; }).join('')
      }</tbody></table></div></div>`;
  }).join('')).join('');
  const ob = g.outbreaks ? `<div class="panel"><h2>大量発生</h2><p class="small">${esc(obNote())}</p>${outbreakTable(g.outbreaks.map(o => ({ ...o, map: mapId })))}</div>` : '';
  $app.innerHTML = `<div class="crumb"><a href="#/maps">出現場所</a> › ${esc(mapName(mapId))}</div><h1>${esc(mapName(mapId))}</h1>${ob}${sections}`;
}

// =====================================================================
// ジョインアベニュー (SecretBasesRemade の設定を再現)
// =====================================================================
const fmtPct = x => (x >= 10 ? x.toFixed(0) : x >= 1 ? x.toFixed(1) : x.toFixed(2)) + '%';
const avStat = s => (AV && AV.stat_labels[s]) || STAT_ID_JA[s] || s;
const avShopName = t => (AV.shop_types[t] || {}).name || t;
const avShopLink = t => `<a href="#/avenue/${t}">${esc(avShopName(t))}</a>`;
// 店員の品ぞろえの種類。STAFF_POOL に出てくるものを優先
function avVariants(type) {
  const fromStaff = uniq(AV.staff.filter(s => s.shop_type === type && s.variant && s.variant !== 'nil').map(s => s.variant));
  const menuKeys = Object.keys(AV.menus[type] || {}).filter(k => k !== 'common');
  return (fromStaff.length ? fromStaff : menuKeys).sort();
}
// ShoppingStreetMethods.menu_for と同じ並べ方 (common + そのバージョン。B2 に無ければ B)
function avMenu(type, v) {
  const m = AV.menus[type] || {};
  const own = (v && (m[v] || m[v[0]])) || [];
  return [...(m.common || []), ...own].slice().sort((a, b) => a.rank - b.rank);
}
function avProductName(p) {
  if (p.name) return p.name;
  if (p.ev) return `${avStat(p.ev[0])}LV${p.ev[1]}`;
  const it = p.items || [];
  if (it.length === 1) return itemName(it[0][0]) + (it[0][1] > 1 ? `×${it[0][1]}` : '');
  return '?';
}
function avEffect(p) {
  const out = [];
  if (p.items) out.push(p.items.map(([i, q]) => itemLink(i) + (q > 1 ? `×${q}` : '')).join('、'));
  if (p.ev) out.push(`${avStat(p.ev[0])}のきそポイント +${p.ev[1]}`);
  if (p.ev_max) out.push(`${avStat(p.ev_max)}のきそポイントを252まで`);
  if (p.all_evs) out.push(`全能力のきそポイント +${p.all_evs}`);
  if (p.ev_reset) out.push('きそポイントを全て0に');
  if (p.ev_down) out.push(`${avStat(p.ev_down[0])}のきそポイント −${p.ev_down[1]}`);
  if (p.happiness) out.push(`なつき度アップ（${p.happiness}回ぶん）`);
  if (p.levels) out.push(`レベル +${p.levels}`);
  if (p.hatch) out.push(`タマゴの残り歩数 −${p.hatch}`);
  if (p.appraise) out.push(`鑑定して道具を1つ（<a href="#/avenue/appraisal">中身と確率</a>）`);
  return out.join(' / ');
}
// ShoppingStreetMethods.appraisal_table と同じ表 (店のランク rank、殿堂入り hof)
function avAppraisal(p, v, rank, hof) {
  const fam = AV.antique.appraisal[p.appraise] || {};
  const own = uniq([v, v && v[0]]).filter(Boolean).flatMap(k => fam[k] || []);
  const table = [...(fam.common || []), ...own].filter(e => (e[2] || 1) <= rank && D.items[e[1]]).map(e => ({ w: e[0], item: e[1] }));
  if (p.junk > 0) table.push({ w: p.junk, item: AV.antique.junk });
  const megas = (hof ? [...AV.antique.mega, ...AV.antique.mega_hof] : AV.antique.mega).filter(i => D.items[i]);
  if (p.mega > 0 && megas.length) table.push({ w: p.mega, mega: true });
  return { table, total: table.reduce((a, e) => a + e.w, 0) || 1, megas };
}
function avLotteryPct(rank) {
  const L = AV.lottery, t = Math.min(1, Math.max(0, (rank - 1) / 9));
  const w = L.weights1.map((x, i) => x + ((L.weights10[i] ?? x) - x) * t).map((x, i) => (D.items[L.prizes[i][0]] ? x : 0));
  const total = w.reduce((a, b) => a + b, 0) || 1;
  return w.map(x => x * 100 / total);
}
// 連続した数をまとめる [21,22,23,25] → "21〜23・25"
const ranges = nums => {
  const out = [];
  nums.forEach(n => { const r = out[out.length - 1]; if (r && n === r[1] + 1) r[1] = n; else out.push([n, n]); });
  return out.map(([a, b]) => (a === b ? `${a}` : `${a}〜${b}`)).join('・');
};

// どうぐ → ジョインアベニューでの入手方法
(function buildAvenueIndex() {
  if (!AV) return;
  const add = (item, html) => (IDX.av[item] || (IDX.av[item] = [])).push(html);
  for (const [type, m] of Object.entries(AV.menus)) {
    for (const [v, list] of Object.entries(m)) {
      for (const p of list) {
        (p.items || []).forEach(([i, q]) => add(i, `${avShopLink(type)}${v === 'common' ? '' : `（${v}）`} ランク${p.rank}〜 「${esc(avProductName(p))}」${q > 1 ? ` ${q}個` : ''} ${p.price.toLocaleString()}円${p.hof ? ' <span class="tag">殿堂入り後</span>' : ''}`));
      }
    }
  }
  const lp1 = avLotteryPct(1), lp10 = avLotteryPct(10);
  AV.lottery.prizes.forEach(([i, q], k) => add(i, `${avShopLink('lottery')} ${k + 1}等${q > 1 ? ` ${q}個` : ''}（ランク1: ${fmtPct(lp1[k])} / ランク10: ${fmtPct(lp10[k])}）`));
  const vs = avVariants('antique');
  for (const p of avMenu('antique', null).filter(x => x.appraise)) {
    for (const hof of [false, true]) {
      const per = {};
      vs.forEach(v => {
        const { table, total, megas } = avAppraisal(p, v, 10, hof);
        table.forEach(e => {
          (e.mega ? megas : [e.item]).forEach(i => {
            const pct = e.w * 100 / total / (e.mega ? megas.length : 1);
            (per[i] || (per[i] = {}))[v] = ((per[i] || {})[v] || 0) + pct;
          });
        });
      });
      for (const [i, byV] of Object.entries(per)) {
        if (hof && !AV.antique.mega_hof.includes(i)) continue;
        const vals = Object.values(byV);
        const summary = vals.length === vs.length && vals.every(x => Math.abs(x - vals[0]) < 1e-9)
          ? fmtPct(vals[0]) : Object.entries(byV).map(([v, x]) => `${v} ${fmtPct(x)}`).join(' / ');
        add(i, `${avShopLink('antique')} 「${esc(p.name)}」を鑑定（ランク${p.rank}〜 ${p.price}円）: ${summary}${hof ? ' <span class="tag">殿堂入り後</span>' : ''}`);
      }
    }
  }
  for (const [rank, list] of Object.entries(AV.souvenirs)) {
    list.forEach(i => add(i, `お客さんのおみやげ（商店街ランク${rank}以上・${AV.souvenir_chance}%でもらえる）`));
  }
  const byItem = {};
  AV.rank_rewards.forEach(([r, [i]]) => (byItem[i] || (byItem[i] = [])).push(r));
  for (const [i, rs] of Object.entries(byItem)) add(i, `商店街ランクアップのおれい（ランク ${ranges(rs)}）`);
})();
const avLockedBadges = item => { if (!AV) return 0; for (const [b, list] of Object.entries(AV.locked)) if (list.includes(item)) return Number(b); return 0; };

function avTabs(key, variants, render) {
  if (variants.length <= 1) return render(variants[0]);
  return `<div class="seg av-tabs" data-tabs="${key}">${variants.map((v, i) => `<button data-v="${v}" class="${i ? '' : 'on'}">${v}</button>`).join('')}</div>${
    variants.map((v, i) => `<div data-tab="${key}" data-v="${v}"${i ? ' hidden' : ''}>${render(v)}</div>`).join('')}`;
}
function avStaffLine(type, v) {
  const names = AV.staff.filter(s => s.shop_type === type && (v == null || s.variant === v)).map(s => s.name);
  return names.length ? `<p class="small muted">この品ぞろえの店員: ${names.map(esc).join('、')}</p>` : '';
}
function avMenuTable(list) {
  if (!list.length) return '<p class="muted">なし</p>';
  return `<div class="tbl-wrap"><table><thead><tr><th class="num">ランク</th><th>品目</th><th class="num">値段</th><th>内容</th><th class="num">1日</th><th>備考</th></tr></thead><tbody>${
    list.map(p => `<tr><td class="num">${p.rank}</td><td class="nowrap">${esc(avProductName(p))}</td><td class="num">${p.price.toLocaleString()}円</td><td>${avEffect(p)}</td><td class="num">${p.stock || 1}</td><td class="small">${[
      p.hof ? `殿堂入り後（商店街ランク${AV.hof_rank}〜）` : '', p.group ? '上のランクの品で置きかわる' : '',
      ...(p.items || []).map(([i]) => avLockedBadges(i)).filter(Boolean).map(b => `バッジ${b}個から`)].filter(Boolean).join('<br>')}</td></tr>`).join('')
  }</tbody></table></div>`;
}
function avAppraisalHTML() {
  const vs = avVariants('antique');
  return avMenu('antique', null).filter(p => p.appraise).map(p => {
    const cols = vs.map(v => avAppraisal(p, v, 10, false));
    const items = uniq(cols.flatMap(c => c.table.filter(e => !e.mega).map(e => e.item)));
    const row = (label, f) => `<tr><td>${label}</td>${cols.map(c => { const x = f(c); return `<td class="num">${x ? fmtPct(x) : '—'}</td>`; }).join('')}</tr>`;
    return `<h3>${esc(p.name)}（ランク${p.rank}〜・${p.price}円）</h3>
      <div class="tbl-wrap"><table><thead><tr><th>出る道具</th>${vs.map(v => `<th class="num">${v}</th>`).join('')}</tr></thead><tbody>
        ${items.map(i => row(itemLink(i), c => { const e = c.table.find(x => x.item === i); return e && e.w * 100 / c.total; })).join('')}
        ${p.mega ? row(`メガストーン（${cols[0].megas.length}種からランダム）`, c => { const e = c.table.find(x => x.mega); return e && e.w * 100 / c.total; }) : ''}
      </tbody></table></div>`;
  }).join('') + `<p class="small muted">お店のランク10の時点の確率。ランク指定のある道具はそのランク未満では出ず、残りで按分されます。バッジで解禁される道具（下の「解禁条件」）も、解禁前は出ません。殿堂入り後は次のメガストーンが加わります: ${AV.antique.mega_hof.map(itemLink).join('、')}</p>
    <p class="small muted">メガストーン: ${AV.antique.mega.map(itemLink).join('、')}</p>`;
}
function avShopSection(type) {
  const info = AV.shop_types[type] || {};
  let body = '';
  if (type === 'lottery') {
    const ps = [1, 5, 10].map(avLotteryPct);
    body = `<div class="tbl-wrap"><table><thead><tr><th>等</th><th>景品</th><th class="num">ランク1</th><th class="num">ランク5</th><th class="num">ランク10</th></tr></thead><tbody>${
      AV.lottery.prizes.map(([i, q], k) => `<tr><td>${k + 1}等</td><td>${itemLink(i)}${q > 1 ? `×${q}` : ''}</td>${ps.map(p => `<td class="num">${fmtPct(p[k])}</td>`).join('')}</tr>`).join('')
    }</tbody></table></div><p class="small muted">無料。1日に引ける回数は 1 + ランク÷${AV.lottery.draws_rank_step}（ランク1: 1回 / ランク5: 2回 / ランク10: 3回）。</p>`;
  } else if (type === 'nursery') {
    const N = AV.nursery;
    body = `<p class="small">出店条件: 商店街ランク${N.street_rank}以上${N.hof ? '・殿堂入り後' : ''}</p><div class="tbl-wrap"><table><thead><tr><th class="num">ランク</th><th>品目（1日の回数）</th></tr></thead><tbody>${
      Object.entries(N.menu).map(([r, list]) => `<tr><td class="num">${r}〜</td><td>${list.map(([lv, n]) => { const [steps, price] = N.hatch[lv]; return `あたためるLV${lv}（歩数−${steps}・${price.toLocaleString()}円）×${n}`; }).join('<br>')}</td></tr>`).join('')
    }</tbody></table></div>`;
  } else if (type === 'decor_shop') {
    body = '<p class="muted">商店街に置く家具を売るお店です（どうぐは手に入りません）。</p>';
  } else {
    const hasVar = Object.keys(AV.menus[type] || {}).some(k => k !== 'common');
    body = hasVar ? avTabs(type, avVariants(type), v => avStaffLine(type, v) + avMenuTable(avMenu(type, v))) : avStaffLine(type, null) + avMenuTable(avMenu(type, null));
  }
  const titles = AV.shop_titles[type];
  return `<div class="panel" id="av-${type}"><h2>${esc(info.name || type)}</h2>
    <p class="small">${esc(info.description || '')}</p>
    ${titles ? `<p class="small muted">店名: ${titles.map(t => esc(t.replace('{1}', '○○'))).join(' → ')}（ランク1〜3 / 4〜7 / 8〜10）</p>` : ''}
    ${body}</div>`;
}
function pageAvenue(arg) {
  if (!AV) {
    $app.innerHTML = '<h1>ジョインアベニュー</h1><p class="muted">データがありません（build_wiki.py の実行時に Ruby が必要です）。</p>';
    return;
  }
  const types = Object.keys(AV.shop_types);
  const rewards = {};
  AV.rank_rewards.forEach(([r, [i, q]]) => { const k = `${i}:${q}`; (rewards[k] || (rewards[k] = { i, q, rs: [] })).rs.push(r); });
  $app.innerHTML = `
    <h1>${esc(AV.name)}</h1>
    <div class="panel">
      <p>お店の品ぞろえは店員ごとの<b>バージョン</b>（B1・B2・W1・W2 / カフェ・びようしつは B・W）で変わります。タブで切り替えられます。値段は基準価格で、商店街ランク1につき全店${AV.discount[0]}%引き（最大${AV.discount[1]}%）になります。</p>
      <div class="toc">${[...types.map(t => [t, avShopName(t)]), ['appraisal', '鑑定の中身'], ['souvenir', 'おみやげ'], ['reward', 'ランク報酬'], ['locked', '解禁条件']].map(([k, l]) => `<a href="#/avenue/${k}">${esc(l)}</a>`).join('')}</div>
    </div>
    ${types.map(avShopSection).join('')}
    <div class="panel" id="av-appraisal"><h2>ふるどうぐや 鑑定の中身</h2>${avAppraisalHTML()}</div>
    <div class="panel" id="av-souvenir"><h2>お客さんのおみやげ</h2>
      <p class="small">お客さん1人につき1日1回、${AV.souvenir_chance}%でおみやげをくれます（その時点の商店街ランクで出る候補から等確率）。</p>
      <div class="tbl-wrap"><table><thead><tr><th class="num">商店街ランク</th><th>候補に加わる道具</th></tr></thead><tbody>${
        Object.entries(AV.souvenirs).map(([r, list]) => `<tr><td class="num">${r}〜</td><td>${list.map(itemLink).join('、')}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="panel" id="av-reward"><h2>商店街ランクアップのおれい</h2>
      <p class="small">商店街のランクが上がると、管理人のところに届きます。</p>
      <div class="tbl-wrap"><table><thead><tr><th>道具</th><th>もらえるランク</th></tr></thead><tbody>${
        Object.values(rewards).map(r => `<tr><td>${itemLink(r.i)}${r.q > 1 ? `×${r.q}` : ''}</td><td>${ranges(r.rs)}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="panel" id="av-locked"><h2>解禁条件</h2>
      <p class="small">次の道具は、バッジがその数そろうまでお店にも鑑定にも出ません。</p>
      <div class="tbl-wrap"><table><thead><tr><th class="num">バッジ</th><th>道具</th></tr></thead><tbody>${
        Object.entries(AV.locked).map(([b, list]) => `<tr><td class="num">${b}個</td><td>${list.map(itemLink).join('、')}</td></tr>`).join('')}</tbody></table></div></div>`;
  $app.querySelectorAll('.av-tabs').forEach(seg => seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    $app.querySelectorAll(`[data-tab="${seg.dataset.tabs}"]`).forEach(el => { el.hidden = el.dataset.v !== b.dataset.v; });
  })));
  const target = arg && document.getElementById(`av-${arg}`);
  if (target) target.scrollIntoView();
}

// =====================================================================
// ページ: 検索
// =====================================================================
function pageSearch(q) {
  q = decodeURIComponent(q || '');
  document.getElementById('search-input').value = q;
  const lim = 60;
  const pk = D.order.filter(id => matches(q, sp(id).n, sp(id).fn, id));
  const mv = Object.keys(D.moves).filter(m => matches(q, D.moves[m].n, m));
  const ab = Object.keys(D.abilities).filter(a => matches(q, D.abilities[a].n, a));
  const it = Object.keys(D.items).filter(i => matches(q, D.items[i].n, i));
  const mp = IDX.encMaps.filter(g => matches(q, mapName(g.map)));
  const sec = (title, list, fn) => (list.length ? `<div class="panel search-sec"><h2>${title}（${list.length}）</h2><div class="pk-grid">${list.slice(0, lim).map(x => `<span class="cell">${fn(x)}</span>`).join('')}${list.length > lim ? '<span class="cell muted">…</span>' : ''}</div></div>` : '');
  const html = [
    sec('ポケモン', pk, id => pkLink(id)),
    sec('わざ', mv, m => `${typeBadge(D.moves[m].t)} ${moveLink(m)}`),
    sec('とくせい', ab, abilLink),
    sec('どうぐ', it, itemLink),
    sec('出現場所', mp, g => mapLink(g.map)),
  ].join('');
  $app.innerHTML = `<h1>「${esc(q)}」の検索結果</h1>${html || '<p class="muted">見つかりませんでした。</p>'}`;
}

function notFound() {
  $app.innerHTML = '<h1>ページが見つかりません</h1><p><a href="#/">トップへ</a></p>';
}

// =====================================================================
// ルーター
// =====================================================================
function parseQuery(s) {
  if (!s) return null;
  const o = {};
  s.split('&').forEach(kv => { const [k, v] = kv.split('='); if (k) o[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  return o;
}
function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const [page, ...rest] = path.split('/');
  const arg = decodeURIComponent(rest.join('/'));
  const query = parseQuery(qs);
  const navKey = { pokemon: 'pokemon', move: 'move', moves: 'move', ability: 'ability', abilities: 'ability', item: 'item', items: 'item', map: 'map', maps: 'map', avenue: 'avenue' }[page];
  document.querySelectorAll('.site-nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === navKey));
  window.scrollTo(0, 0);
  switch (page) {
    case '': pageHome(); break;
    case 'pokemon': arg ? pagePokemon(arg) : pagePokemonList(query); break;
    case 'moves': pageMoveList(query); break;
    case 'move': pageMove(arg); break;
    case 'abilities': pageAbilityList(query); break;
    case 'ability': pageAbility(arg); break;
    case 'items': pageItemList(query); break;
    case 'item': pageItem(arg); break;
    case 'maps': pageMapList(query); break;
    case 'map': pageMap(arg); break;
    case 'avenue': pageAvenue(arg); break;
    case 'search': pageSearch(rest.join('/')); break;
    default: notFound();
  }
}
document.getElementById('search-form').addEventListener('submit', e => {
  e.preventDefault();
  const q = document.getElementById('search-input').value.trim();
  if (q) location.hash = `#/search/${enc(q)}`;
});
window.addEventListener('hashchange', route);
route();
