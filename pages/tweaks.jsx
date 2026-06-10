// Z'Expert tweaks — three expressive controls that reshape the feel
const { useEffect } = React;

const MOODS = {
  confiance: {
    label: 'Confiance',
    blue: '#1E9EBC', blueDk: '#1580A0', blueLt: '#e8f7fb',
    yellow: '#F5C842', navy: '#12253A', navyLt: '#1e3a55',
    grain: 'fintech',
  },
  patrimoine: {
    label: 'Patrimoine',
    blue: '#7A5230', blueDk: '#5C3D22', blueLt: '#f5ede0',
    yellow: '#D4AF37', navy: '#1F1611', navyLt: '#3a2a1e',
    grain: 'warm',
  },
  audace: {
    label: 'Audace',
    blue: '#0AB6C7', blueDk: '#089AAB', blueLt: '#dffbff',
    yellow: '#E8FF3F', navy: '#0A0A0A', navyLt: '#1a1a1a',
    grain: 'sharp',
  },
};

const HEROES = {
  video:    { label: 'Cinéma',  showVideo: true,  bgKind: 'video',   bgImg: '' },
  still:    { label: 'Photo',   showVideo: false, bgKind: 'still',
              bgImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80&auto=format&fit=crop' },
  minimal:  { label: 'Sobre',   showVideo: false, bgKind: 'minimal', bgImg: '' },
};

const DENSITY = {
  aérée:    { label: 'Aérée',    heroH: '110vh', titleScale: 1.18, gapScale: 1.25, contentMaxW: 820 },
  standard: { label: 'Standard', heroH: '100vh', titleScale: 1.0,  gapScale: 1.0,  contentMaxW: 760 },
  compacte: { label: 'Compacte', heroH: '88vh',  titleScale: 0.86, gapScale: 0.78, contentMaxW: 700 },
};

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood": "confiance",
  "hero": "video",
  "density": "standard"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  const m = MOODS[t.mood] || MOODS.confiance;
  const h = HEROES[t.hero] || HEROES.video;
  const d = DENSITY[t.density] || DENSITY.standard;

  // ── MOOD : palette ──
  root.style.setProperty('--blue', m.blue);
  root.style.setProperty('--blue-dk', m.blueDk);
  root.style.setProperty('--blue-lt', m.blueLt);
  root.style.setProperty('--yellow', m.yellow);
  root.style.setProperty('--navy', m.navy);
  root.style.setProperty('--navy-lt', m.navyLt);
  document.body.dataset.mood = t.mood;

  // ── HERO atmosphere ──
  const wrap = document.getElementById('heroVideoWrap');
  const mobileBg = document.querySelector('.hero-mobile-bg');
  const overlay = document.querySelector('.hero-overlay');
  if (wrap) {
    wrap.style.display = h.showVideo ? '' : 'none';
    if (h.showVideo) {
      wrap.querySelectorAll('video').forEach((v, i) => { if (i === 0) v.play().catch(() => {}); });
    } else {
      wrap.querySelectorAll('video').forEach(v => v.pause());
    }
  }
  if (mobileBg) {
    if (h.bgKind === 'still') {
      mobileBg.style.display = 'block';
      mobileBg.style.backgroundImage = `url('${h.bgImg}')`;
    } else if (h.bgKind === 'minimal') {
      mobileBg.style.display = 'block';
      mobileBg.style.background = `linear-gradient(135deg, ${m.navy} 0%, ${m.navyLt} 60%, ${m.blue}33 100%)`;
      mobileBg.style.backgroundImage = '';
    } else {
      // video desktop: hide mobile bg on >768
      mobileBg.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    }
  }
  if (overlay) {
    if (h.bgKind === 'minimal') {
      overlay.style.background = 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))';
    } else {
      overlay.style.background = '';
    }
  }
  document.body.dataset.hero = t.hero;

  // ── DENSITY ──
  const hero = document.querySelector('.hero');
  if (hero) hero.style.height = d.heroH;
  root.style.setProperty('--tw-title-scale', d.titleScale);
  root.style.setProperty('--tw-gap-scale', d.gapScale);
  root.style.setProperty('--tw-content-max', d.contentMaxW + 'px');
  document.body.dataset.density = t.density;
}

function ZExpertTweaks() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Ambiance">
        <TweakRadio
          label="Palette"
          value={t.mood}
          options={[
            { value: 'confiance',  label: 'Confiance' },
            { value: 'patrimoine', label: 'Patrimoine' },
            { value: 'audace',     label: 'Audace' },
          ]}
          onChange={v => setTweak('mood', v)}
        />
      </TweakSection>

      <TweakSection label="Hero">
        <TweakRadio
          label="Signature"
          value={t.hero}
          options={[
            { value: 'video',   label: 'Cinéma' },
            { value: 'still',   label: 'Photo' },
            { value: 'minimal', label: 'Sobre' },
          ]}
          onChange={v => setTweak('hero', v)}
        />
      </TweakSection>

      <TweakSection label="Densité">
        <TweakRadio
          label="Rythme"
          value={t.density}
          options={[
            { value: 'aérée',    label: 'Aérée' },
            { value: 'standard', label: 'Standard' },
            { value: 'compacte', label: 'Compacte' },
          ]}
          onChange={v => setTweak('density', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<ZExpertTweaks />);
