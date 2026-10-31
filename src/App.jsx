import { useEffect, useMemo, useState } from "react";
import {
  Bell, BookOpen, CalendarDays, Check, ChevronRight, CircleHelp, Clipboard,
  Copy, FileText, GraduationCap, Home, Library, Menu, MessageCircle, Search,
  Settings, ShieldCheck, Sparkles, Video, X, Megaphone, Clock3, Users
} from "lucide-react";
import { supabase, supabaseConfigured } from "./lib/supabase";

const initialAnnouncements = [
  { id: 1, category: "Vie scolaire", title: "Bienvenue dans votre espace scolaire", body: "Retrouvez ici les annonces, les ressources et les événements importants de l’INJS.", date: "Aujourd’hui", urgent: false },
  { id: 2, category: "Administration", title: "Mise à jour des informations scolaires", body: "Consultez régulièrement les informations publiées par l’administration. Les annonces officielles seront affichées dans cet espace.", date: "Cette semaine", urgent: true },
  { id: 3, category: "Événement", title: "Préparer la semaine à venir", body: "Pensez à vérifier les emplois du temps, les devoirs et les activités annoncées par vos enseignants.", date: "Cette semaine", urgent: false }
];

const modules = [
  { title: "Vie scolaire", desc: "Règles, contacts et informations pratiques", icon: Users, color: "blue" },
  { title: "Emploi du temps", desc: "Horaires, salles et organisation des cours", icon: CalendarDays, color: "purple" },
  { title: "Cours et ressources", desc: "Supports pédagogiques et documents utiles", icon: BookOpen, color: "green" },
  { title: "Devoirs et évaluations", desc: "Consignes, révisions et dates importantes", icon: FileText, color: "orange" },
  { title: "Événements", desc: "Activités, réunions et rendez-vous scolaires", icon: Bell, color: "pink" },
  { title: "Informations pratiques", desc: "Procédures et réponses aux questions fréquentes", icon: Clipboard, color: "teal" },
  { title: "Aide et assistance", desc: "Trouver de l’aide ou contacter l’équipe", icon: CircleHelp, color: "indigo" }
];

const quickResources = [
  { title: "Annonce aux familles", type: "Message", text: "Chers parents, nous vous informons que [information à compléter]. Merci de votre attention et de votre collaboration avec l’établissement." },
  { title: "Rappel aux élèves", type: "Message", text: "Bonjour à toutes et à tous. Pensez à [consigne à compléter] avant le [date]. En cas de question, rapprochez-vous de votre professeur ou de l’administration." },
  { title: "Plan de séance", type: "Pédagogie", text: "Objectif de la séance : [objectif]. Notions à étudier : [notions]. Activité d’application : [activité]. Travail à faire : [consigne et échéance]." },
  { title: "Annonce d’événement", type: "Événement", text: "L’établissement organise [nom de l’événement] le [date] à [heure], à [lieu]. Public concerné : [public]. Informations complémentaires : [détails]." }
];

const navItems = [
  ["Accueil", Home], ["Parcours en 7 étapes", GraduationCap], ["Ressources rapides", Library],
  ["Assistant IA", Sparkles], ["Vidéos & médias", Video], ["Administration", ShieldCheck]
];

export default function App() {
  const [page, setPage] = useState("Accueil");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [resources, setResources] = useState(quickResources);
  const [copied, setCopied] = useState("");
  const [role, setRole] = useState("Membre de l’école");
  const [aiGoal, setAiGoal] = useState("Annonce hebdomadaire");
  const [aiAudience, setAiAudience] = useState("Élèves");
  const [aiTopic, setAiTopic] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [notice, setNotice] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;
    supabase.from("school_announcements").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data?.length) setAnnouncements(data.map(a => ({
          id: a.id, title: a.title, body: a.body, category: a.category || "École",
          date: new Date(a.created_at).toLocaleDateString("fr-FR"), urgent: Boolean(a.is_urgent)
        })));
      });
    return () => { active = false; };
  }, []);

  const filteredAnnouncements = useMemo(() => announcements.filter(a =>
    `${a.title} ${a.body} ${a.category}`.toLowerCase().includes(query.toLowerCase())
  ), [announcements, query]);

  async function copyText(text, title) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(title);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setNotice("La copie automatique n’est pas disponible sur ce navigateur. Sélectionnez le texte puis copiez-le.");
    }
  }

  function generateDraft() {
    if (!aiTopic.trim()) {
      setAiOutput("Saisissez d’abord le sujet à traiter pour préparer un contenu adapté.");
      return;
    }
    const draft = `Objet : ${aiTopic.trim()}\n\nChers ${aiAudience.toLowerCase()},\n\nDans le cadre de la vie de notre école, nous souhaitons vous informer de ce qui suit : ${aiTopic.trim()}.\n\nNous vous invitons à prendre connaissance de cette information et à vous rapprocher de l’équipe éducative pour toute précision.\n\nMerci pour votre attention et votre collaboration.\n\nL’administration`;
    setAiOutput(draft);
    setNotice("Brouillon préparé à partir d’un modèle local. Pour une génération par IA réelle, il faudra connecter un service IA via un serveur sécurisé.");
  }

  async function publishAnnouncement(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      setNotice("Complétez le titre et le contenu de l’annonce.");
      return;
    }
    if (supabaseConfigured) {
      const { data, error } = await supabase.from("school_announcements").insert({
        title: newTitle.trim(), body: newBody.trim(), category: "Administration", is_urgent: false
      }).select().single();
      if (error) {
        setNotice(`Publication non enregistrée : ${error.message}`);
        return;
      }
      setAnnouncements(prev => [{ id: data.id, title: data.title, body: data.body, category: data.category || "Administration", date: "À l’instant", urgent: data.is_urgent }, ...prev]);
    } else {
      setAnnouncements(prev => [{ id: Date.now(), title: newTitle.trim(), body: newBody.trim(), category: "Administration", date: "À l’instant", urgent: false }, ...prev]);
      setNotice("Annonce ajoutée à cette session de démonstration seulement. Configurez Supabase pour la conserver.");
    }
    setNewTitle("");
    setNewBody("");
  }

  const heading = page === "Accueil" ? "Bonjour et bienvenue 👋" : page;
  const subtitle = page === "Accueil"
    ? "Toute la vie de l’INJS, au même endroit."
    : "Un espace simple pour organiser et partager les informations scolaires.";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={25} /></div>
          <div><strong>INJS Connect</strong><span>ESPACE SCOLAIRE</span></div>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu"><X size={20}/></button>
        </div>
        <div className="school-chip"><div className="school-avatar">É</div><div><strong>INJS</strong><span>Communauté INJS</span></div></div>
        <div className="nav-label">MENU PRINCIPAL</div>
        <nav className="side-nav">
          {navItems.map(([label, Icon]) => (
            <button key={label} className={`nav-link ${page === label ? "active" : ""}`} onClick={() => { setPage(label); setMobileMenu(false); }}>
              <Icon size={19}/><span>{label}</span>{label === "Administration" && <span className="nav-lock">•</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><MessageCircle size={18}/></div><strong>Besoin d’aide ?</strong><p>Retrouvez les informations utiles et les contacts de l’INJS.</p><button onClick={() => setPage("Aide et assistance")}>Accéder à l’aide <ChevronRight size={15}/></button></div>
          <div className="profile-row"><div className="profile-avatar">U</div><div className="profile-info"><strong>Utilisateur</strong><span>{role}</span></div><button className="icon-button" aria-label="Paramètres" onClick={() => setPage("Paramètres")}><Settings size={18}/></button></div>
        </div>
      </aside>

      {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Fermer le menu"/>}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" onClick={() => setMobileMenu(true)} aria-label="Ouvrir le menu"><Menu size={21}/></button>
          <div className="breadcrumbs">Espace INJS <ChevronRight size={14}/> <span>{page}</span></div>
          <div className="top-actions">
            <label className="role-select"><span>Profil</span><select value={role} onChange={e => setRole(e.target.value)}><option>Membre de l’école</option><option>Élève</option><option>Professeur</option><option>Administration</option></select></label>
            <button className="notification-button" aria-label="Notifications" onClick={() => setNotice("Les notifications seront activées lorsque les comptes et les préférences seront configurés.")}><Bell size={19}/><i/></button>
            <div className="top-avatar">U</div>
          </div>
        </header>

        <div className="page-content">
          {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Fermer"><X size={16}/></button></div>}
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot"/> PORTAIL DE L’ÉTABLISSEMENT</div><h1>{heading}</h1><p>{subtitle}</p></div>
            <div className="heading-date"><CalendarDays size={17}/><span>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span></div>
          </section>

          {page === "Accueil" && <HomePage announcements={filteredAnnouncements} query={query} setQuery={setQuery} setPage={setPage} />}
          {page === "Parcours en 7 étapes" && <ModulesPage />}
          {page === "Ressources rapides" && <ResourcesPage resources={resources} setResources={setResources} copyText={copyText} copied={copied} />}
          {page === "Assistant IA" && <AssistantPage aiGoal={aiGoal} setAiGoal={setAiGoal} aiAudience={aiAudience} setAiAudience={setAiAudience} aiTopic={aiTopic} setAiTopic={setAiTopic} aiOutput={aiOutput} generateDraft={generateDraft} copyText={copyText} copied={copied} />}
          {page === "Vidéos & médias" && <MediaPage />}
          {page === "Administration" && <AdminPage announcements={announcements} newTitle={newTitle} setNewTitle={setNewTitle} newBody={newBody} setNewBody={setNewBody} publishAnnouncement={publishAnnouncement} />}
          {!["Accueil", "Parcours en 7 étapes", "Ressources rapides", "Assistant IA", "Vidéos & médias", "Administration"].includes(page) && <GenericPage page={page} />}
          <footer className="footer"><span>© {new Date().getFullYear()} INJS Connect</span><span>Apprendre · Communiquer · Grandir</span><span className={`connection ${supabaseConfigured ? "connected" : ""}`}><i/>{supabaseConfigured ? "Supabase configuré" : "Mode démonstration"}</span></footer>
        </div>
      </main>
    </div>
  );
}

function HomePage({ announcements, query, setQuery, setPage }) {
  return <>
    <section className="welcome-banner">
      <div className="welcome-copy"><div className="banner-pill"><Sparkles size={14}/> L’ESSENTIEL DE L’INJS</div><h2>Tout pour une communauté<br/><em>scolaire connectée.</em></h2><p>Les annonces, les ressources et les rendez-vous importants réunis dans un seul espace.</p><button className="button-light" onClick={() => setPage("Parcours en 7 étapes")}>Explorer mon espace <ChevronRight size={17}/></button></div>
      <div className="banner-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-book"><BookOpen size={70} strokeWidth={1.2}/></div><div className="floating-card card-top"><Check size={15}/> Informations centralisées</div><div className="floating-card card-bottom"><Users size={16}/> Toute la communauté</div></div>
    </section>
    <section className="stats-grid">
      <Stat icon={Megaphone} label="Annonces" value={String(announcements.length).padStart(2,"0")} detail="Informations récentes" color="blue"/>
      <Stat icon={BookOpen} label="Parcours guidés" value="07" detail="Pour aller à l’essentiel" color="green"/>
      <Stat icon={Library} label="Ressources" value="04" detail="Modèles prêts à adapter" color="orange"/>
      <Stat icon={Video} label="Médiathèque" value="À venir" detail="Capsules et vidéos" color="purple"/>
    </section>
    <section className="content-grid">
      <div className="panel announcements-panel"><div className="panel-header"><div><h3>Actualités & annonces</h3><p>Les dernières informations de l’INJS</p></div><span className="count-pill">{announcements.length} annonces</span></div>
        <div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une annonce…"/></div>
        <div className="announcement-list">{announcements.map(a => <article className="announcement" key={a.id}><div className={`announcement-icon ${a.urgent ? "urgent" : ""}`}>{a.urgent ? <Bell size={18}/> : <Megaphone size={18}/>}</div><div className="announcement-body"><div className="announcement-meta"><span>{a.category}</span><i/> {a.date} {a.urgent && <b className="urgent-label">Important</b>}</div><h4>{a.title}</h4><p>{a.body}</p></div><ChevronRight className="announcement-arrow" size={18}/></article>)}{announcements.length === 0 && <p className="empty-state">Aucune annonce ne correspond à cette recherche.</p>}</div>
      </div>
      <div className="right-column"><div className="panel shortcuts-panel"><div className="panel-header"><div><h3>Accès rapide</h3><p>Les outils essentiels</p></div></div><div className="shortcut-list">{[[CalendarDays,"Emploi du temps","Parcours en 7 étapes"],[BookOpen,"Cours & ressources","Ressources rapides"],[Sparkles,"Assistant IA","Assistant IA"],[Video,"Vidéos éducatives","Vidéos & médias"]].map(([Icon,label,target])=><button className="shortcut" key={label} onClick={() => setPage(target)}><span className="shortcut-icon"><Icon size={18}/></span><span>{label}</span><ChevronRight size={17}/></button>)}</div></div>
        <div className="tip-card"><div className="tip-title"><Sparkles size={17}/> Le conseil de la semaine</div><p>Consultez régulièrement les annonces et vérifiez les dates importantes pour bien préparer votre semaine.</p><span>ORGANISATION SCOLAIRE</span></div></div>
    </section>
  </>;
}

function Stat({ icon: Icon, label, value, detail, color }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>;
}

function ModulesPage() {
  return <><div className="section-intro"><h2>Votre parcours en 7 étapes</h2><p>Choisissez une rubrique pour retrouver les informations utiles à votre quotidien scolaire.</p></div><div className="module-grid">{modules.map((m,i)=><button className="module-card" key={m.title} onClick={() => alert(`La rubrique « ${m.title} » sera reliée à ses contenus lors de la configuration de l’école.`)}><div className={`module-icon ${m.color}`}><m.icon size={22}/></div><div className="module-number">ÉTAPE {String(i+1).padStart(2,"0")}</div><h3>{m.title}</h3><p>{m.desc}</p><span className="module-open">Ouvrir la rubrique <ChevronRight size={16}/></span></button>)}</div></>;
}

function ResourcesPage({ resources, setResources, copyText, copied }) {
  const [filter, setFilter] = useState("Tout");
  const [customTitle, setCustomTitle] = useState("");
  const [customText, setCustomText] = useState("");
  const filtered = resources.filter(r => filter === "Tout" || r.type === filter);
  function addResource(e) {
    e.preventDefault();
    if (!customTitle.trim() || !customText.trim()) return;
    setResources(prev => [{title:customTitle.trim(),type:"Personnalisé",text:customText.trim()},...prev]);
    setCustomTitle(""); setCustomText("");
  }
  return <><div className="section-intro"><h2>Ressources prêtes à l’emploi</h2><p>Copiez, adaptez et diffusez rapidement les informations de l’INJS.</p></div><div className="filter-row">{["Tout","Message","Pédagogie","Événement","Personnalisé"].map(f=><button key={f} className={`filter-chip ${filter===f?"selected":""}`} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="resource-grid">{filtered.map((r,i)=><article className="resource-card" key={r.title+i}><div className="resource-top"><div className="resource-file"><FileText size={20}/></div><span className="resource-type">{r.type}</span></div><h3>{r.title}</h3><p>{r.text}</p><button className="button-outline" onClick={()=>copyText(r.text,r.title)}>{copied===r.title?<Check size={16}/>:<Copy size={16}/>} {copied===r.title?"Copié !":"Copier le contenu"}</button></article>)}</div><form className="panel add-resource" onSubmit={addResource}><h3>Créer une ressource rapide</h3><div className="form-grid"><label>Titre<input value={customTitle} onChange={e=>setCustomTitle(e.target.value)} placeholder="Ex. Rappel pour les parents" required/></label><label>Contenu<textarea value={customText} onChange={e=>setCustomText(e.target.value)} placeholder="Rédigez le texte à réutiliser…" rows="3" required/></label></div><button className="button-primary" type="submit">Ajouter à mes ressources</button><p className="form-hint">Cette version garde les ressources personnalisées dans la session actuelle. La sauvegarde permanente pourra être activée avec Supabase.</p></form></>;
}

function AssistantPage({ aiGoal, setAiGoal, aiAudience, setAiAudience, aiTopic, setAiTopic, aiOutput, generateDraft, copyText, copied }) {
  return <><div className="section-intro"><h2>Assistant de contenu scolaire</h2><p>Préparez un premier brouillon de communication à partir de quelques informations.</p></div><div className="assistant-layout"><div className="panel assistant-form"><div className="assistant-heading"><div className="assistant-logo"><Sparkles size={22}/></div><div><h3>Préparer un contenu</h3><p>Complétez les champs ci-dessous</p></div></div><label>Type de contenu<select value={aiGoal} onChange={e=>setAiGoal(e.target.value)}><option>Annonce hebdomadaire</option><option>Message aux parents</option><option>Consigne aux élèves</option><option>Présentation d’un événement</option><option>Résumé pédagogique</option></select></label><label>Public visé<select value={aiAudience} onChange={e=>setAiAudience(e.target.value)}><option>Élèves</option><option>Parents</option><option>Professeurs</option><option>Administration</option><option>Toute la communauté scolaire</option></select></label><label>Sujet et détails<textarea value={aiTopic} onChange={e=>setAiTopic(e.target.value)} rows="5" placeholder="Ex. Réunion des parents vendredi à 15 h dans la salle polyvalente…"/></label><button className="button-primary full-width" onClick={generateDraft}><Sparkles size={17}/> Préparer le brouillon</button><p className="form-hint">Pour protéger vos données, la clé d’un service d’IA ne doit jamais être placée dans le code du navigateur.</p></div><div className="panel output-panel"><div className="panel-header"><div><h3>Votre brouillon</h3><p>Relisez et vérifiez avant diffusion</p></div><span className="draft-badge">Brouillon</span></div>{aiOutput?<><pre className="ai-output">{aiOutput}</pre><button className="button-outline" onClick={()=>copyText(aiOutput,"brouillon")}>{copied==="brouillon"?<Check size={16}/>:<Copy size={16}/>} {copied==="brouillon"?"Copié !":"Copier le brouillon"}</button></>:<div className="output-empty"><div className="empty-sparkle"><Sparkles size={27}/></div><h4>Votre contenu apparaîtra ici</h4><p>Ajoutez le sujet puis préparez votre brouillon. Cette version de départ utilise un modèle local, pas encore un service d’IA externe.</p></div>}</div></div></>;
}

function MediaPage() {
  return <><div className="section-intro"><h2>Vidéos & médias</h2><p>Une médiathèque pour les capsules éducatives, les présentations et la sensibilisation.</p></div><div className="media-banner"><div className="media-play"><Video size={30}/></div><div><span className="banner-pill">MÉDIATHÈQUE SCOLAIRE</span><h2>Apprendre aussi en vidéo.</h2><p>Centralisez les contenus audiovisuels de l’INJS dans une bibliothèque organisée.</p></div></div><div className="empty-media"><div className="empty-sparkle"><Video size={26}/></div><h3>Votre médiathèque est prête à être configurée</h3><p>Les vidéos pourront être hébergées sur un stockage adapté ou intégrées depuis un service vidéo. « Sans limite » dépendra des quotas, du coût et des conditions du fournisseur.</p><div className="media-tags"><span>Capsules pédagogiques</span><span>Vie scolaire</span><span>Sensibilisation</span><span>Événements</span></div></div></>;
}

function AdminPage({ announcements, newTitle, setNewTitle, newBody, setNewBody, publishAnnouncement }) {
  return <><div className="section-intro"><h2>Gestion des annonces</h2><p>Rédigez une annonce pour la communauté scolaire.</p></div><div className="admin-layout"><form className="panel admin-form" onSubmit={publishAnnouncement}><div className="assistant-heading"><div className="assistant-logo"><ShieldCheck size={22}/></div><div><h3>Nouvelle annonce</h3><p>Les informations publiées doivent être vérifiées.</p></div></div><label>Titre de l’annonce<input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Ex. Réunion des parents" required/></label><label>Contenu<textarea value={newBody} onChange={e=>setNewBody(e.target.value)} rows="6" placeholder="Saisissez le message officiel…" required/></label><button className="button-primary" type="submit"><Megaphone size={17}/> Publier l’annonce</button><p className="form-hint">La publication Supabase nécessite les tables et règles de sécurité du fichier schema.sql.</p></form><div className="panel admin-recent"><h3>Annonces existantes</h3><p className="muted">{announcements.length} élément(s) affiché(s)</p>{announcements.slice(0,5).map(a=><div className="admin-row" key={a.id}><div className="admin-row-icon"><Megaphone size={16}/></div><div><strong>{a.title}</strong><span>{a.category} · {a.date}</span></div></div>)}</div></div></>;
}

function GenericPage({ page }) {
  return <div className="panel generic-panel"><div className="empty-sparkle"><CircleHelp size={25}/></div><h2>{page}</h2><p>Cette rubrique est prévue dans la structure de l’application. Son contenu et ses droits d’accès seront adaptés à l’organisation de l’INJS.</p><div className="generic-note"><ShieldCheck size={18}/><span>Les données personnelles des élèves devront être protégées par des comptes, des rôles et des règles d’accès adaptées.</span></div></div>;
}
