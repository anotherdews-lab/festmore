// utils/i18n.js — Festmore Translation System
const translations = {
  en: {
    nav_all:'All',nav_festivals:'Festivals',nav_markets:'Markets',nav_xmas:'Xmas Markets',nav_concerts:'Concerts',nav_city:'City',nav_flea:'Flea Markets',nav_articles:'Articles',nav_vendors:'Vendors',nav_pricing:'💰 Pricing',nav_login:'Login',nav_list_event:'+ List Event',nav_dashboard:'Dashboard',nav_logout:'Logout',nav_register:'Register',nav_become_vendor:'Become Vendor',nav_search:'Search events, cities, countries…',
    hero_badge:"Europe's #1 Festival & Vendor Platform",hero_h1_1:'Where Events',hero_h1_2:'Meet Their',hero_h1_3:'Perfect Vendors',hero_sub:'Festmore connects event organisers with verified vendors across 26 countries.',hero_cta1:'🎪 List Your Event — from Free',hero_cta2:'🏪 Become a Vendor — €49/yr',
    stat_events:'Events',stat_vendors:'Vendors',stat_countries:'Countries',stat_subscribers:'Subscribers',
    trust_1:'Secure Stripe Payments',trust_2:'Verified Vendor Profiles',trust_3:'26 Countries Covered',trust_4:'Free Listings Available',trust_5:'Daily New Events Added',
    why_tag:'Why Festmore',why_h:'Everything You Need to Grow Your Event Business',why_sub:"Whether you're an event organiser or a vendor — Festmore makes the connection simple, fast and profitable.",
    pricing_tag:'Simple Pricing',pricing_h:"Start Free. Grow Fast.\nPay Only When You're Ready.",pricing_sub:'No hidden fees. No long contracts. Cancel anytime.',for_organisers:'For Event Organisers',for_vendors:'For Vendors',list_event_cta:'List Your Event — Start Free →',vendor_cta:'Create Vendor Profile — €49/year →',
    how_tag:'Simple Process',how_h:'Live in Minutes',step1_title:'Fill in your details',step1_desc:'Add your event or vendor profile in less than 5 minutes.',step2_title:'Choose your plan',step2_desc:'Start free or choose Standard/Premium for maximum visibility.',step3_title:'Go live instantly',step3_desc:'Free listings go live immediately. Paid listings within minutes.',step4_title:'Start getting discovered',step4_desc:'Visitors across 26 countries can now find you on Festmore and Google.',
    browse_events:'Browse Events',browse_sub:'Find exactly the type of event you love',view_all:'View all',events_label:'events',featured_events:'Featured Events',featured_sub:'Hand-picked events you cannot miss',browse_country:'Browse by Country',festival_guides:'Festival Guides',guides_sub:'Expert guides updated daily',all_articles:'Articles',
    newsletter_h:'Never Miss an Event',newsletter_sub:'The best festivals and vendor opportunities every week by email.',newsletter_placeholder:'Your email address',newsletter_btn:'Subscribe Free →',newsletter_success:'You are subscribed! Welcome to Festmore.',
    urgency_h:'🔥 Join {events}+ Events and {vendors}+ Vendors',urgency_sub:'Start free today — upgrade when you are ready.',urgency_btn1:'List Your Event →',urgency_btn2:'Become a Vendor →',
    footer_desc:"Europe's Festival & Vendor Marketplace. Connecting organisers with verified vendors across 26 countries.",footer_for_org:'For Organisers',footer_for_ven:'For Vendors',footer_about:'Festmore',footer_list:'List an Event',footer_pricing:'Pricing Plans',footer_find_vendors:'Find Vendors',footer_browse:'Browse Events',footer_create:'Create Profile',footer_guide:'Vendor Guide',footer_contact:'Contact',footer_about_us:'About Us',footer_articles:'Festival Guides',
  },
  de: {
    nav_all:'Alle',nav_festivals:'Festivals',nav_markets:'Märkte',nav_xmas:'Weihnachtsmärkte',nav_concerts:'Konzerte',nav_city:'Stadtveranstaltungen',nav_flea:'Flohmärkte',nav_articles:'Artikel',nav_vendors:'Anbieter',nav_pricing:'💰 Preise',nav_login:'Anmelden',nav_list_event:'+ Event eintragen',nav_dashboard:'Dashboard',nav_logout:'Abmelden',nav_register:'Registrieren',nav_become_vendor:'Anbieter werden',nav_search:'Events, Städte, Länder suchen…',
    hero_badge:'Europas #1 Festival & Anbieter-Plattform',hero_h1_1:'Wo Events',hero_h1_2:'ihre perfekten',hero_h1_3:'Anbieter finden',hero_sub:'Festmore verbindet Veranstaltungsorganisatoren mit verifizierten Anbietern in 26 Ländern.',hero_cta1:'🎪 Event eintragen — kostenlos',hero_cta2:'🏪 Anbieter werden — 49€/Jahr',
    stat_events:'Events',stat_vendors:'Anbieter',stat_countries:'Länder',stat_subscribers:'Abonnenten',
    trust_1:'Sichere Stripe-Zahlung',trust_2:'Verifizierte Anbieterprofile',trust_3:'26 Länder abgedeckt',trust_4:'Kostenlose Einträge verfügbar',trust_5:'Täglich neue Events',
    why_tag:'Warum Festmore',why_h:'Alles was Sie für Ihr Event-Business brauchen',why_sub:'Egal ob Veranstalter oder Anbieter — Festmore macht die Verbindung einfach, schnell und profitabel.',
    pricing_tag:'Einfache Preise',pricing_h:'Kostenlos starten. Schnell wachsen.\nNur zahlen wenn Sie bereit sind.',pricing_sub:'Keine versteckten Gebühren. Keine langen Verträge. Jederzeit kündbar.',for_organisers:'Für Veranstalter',for_vendors:'Für Anbieter',list_event_cta:'Event eintragen — kostenlos starten →',vendor_cta:'Anbieterprofil erstellen — 49€/Jahr →',
    how_tag:'Einfacher Prozess',how_h:'In Minuten live',step1_title:'Details ausfüllen',step1_desc:'Event oder Anbieterprofil eintragen — dauert weniger als 5 Minuten.',step2_title:'Plan wählen',step2_desc:'Kostenlos starten oder Standard/Premium für maximale Sichtbarkeit wählen.',step3_title:'Sofort live gehen',step3_desc:'Kostenlose Einträge gehen sofort live. Bezahlte Einträge in Minuten.',step4_title:'Entdeckt werden',step4_desc:'Besucher aus 26 Ländern können Sie jetzt auf Festmore und Google finden.',
    browse_events:'Events durchsuchen',browse_sub:'Finden Sie genau den Event-Typ den Sie lieben',view_all:'Alle anzeigen',events_label:'Events',featured_events:'Empfohlene Events',featured_sub:'Handverlesene Events die Sie nicht verpassen sollten',browse_country:'Nach Land durchsuchen',festival_guides:'Festival-Guides',guides_sub:'Expertenguides täglich aktualisiert',all_articles:'Artikel',
    newsletter_h:'Kein Event verpassen',newsletter_sub:'Die besten Festivals und Anbietermöglichkeiten jede Woche per E-Mail.',newsletter_placeholder:'Ihre E-Mail-Adresse',newsletter_btn:'Kostenlos abonnieren →',newsletter_success:'Sie sind angemeldet! Willkommen bei Festmore.',
    urgency_h:'🔥 Schließen Sie sich {events}+ Events und {vendors}+ Anbietern an',urgency_sub:'Heute kostenlos starten — upgraden Sie wenn Sie bereit sind.',urgency_btn1:'Event eintragen →',urgency_btn2:'Anbieter werden →',
    footer_desc:'Europas Festival- und Anbieter-Marktplatz. Wir verbinden Veranstalter mit verifizierten Anbietern in 26 Ländern.',footer_for_org:'Für Veranstalter',footer_for_ven:'Für Anbieter',footer_about:'Festmore',footer_list:'Event eintragen',footer_pricing:'Preispläne',footer_find_vendors:'Anbieter finden',footer_browse:'Events durchsuchen',footer_create:'Profil erstellen',footer_guide:'Anbieter-Guide',footer_contact:'Kontakt',footer_about_us:'Über uns',footer_articles:'Festival-Guides',
  },
  dk: {
    nav_all:'Alle',nav_festivals:'Festivaler',nav_markets:'Markeder',nav_xmas:'Julemarked',nav_concerts:'Koncerter',nav_city:'Byarrangementer',nav_flea:'Loppemarkeder',nav_articles:'Artikler',nav_vendors:'Sælgere',nav_pricing:'💰 Priser',nav_login:'Log ind',nav_list_event:'+ Tilføj event',nav_dashboard:'Dashboard',nav_logout:'Log ud',nav_register:'Registrer',nav_become_vendor:'Bliv sælger',nav_search:'Søg events, byer, lande…',
    hero_badge:'Europas #1 Festival & Sælger Platform',hero_h1_1:'Hvor events',hero_h1_2:'møder deres',hero_h1_3:'perfekte sælgere',hero_sub:'Festmore forbinder eventarrangører med verificerede sælgere i 26 lande.',hero_cta1:'🎪 Tilføj dit event — gratis',hero_cta2:'🏪 Bliv sælger — €49/år',
    stat_events:'Events',stat_vendors:'Sælgere',stat_countries:'Lande',stat_subscribers:'Abonnenter',
    trust_1:'Sikker Stripe-betaling',trust_2:'Verificerede sælgerprofiler',trust_3:'26 lande dækket',trust_4:'Gratis opslag tilgængelige',trust_5:'Nye events dagligt',
    why_tag:'Hvorfor Festmore',why_h:'Alt hvad du behøver for at vækste din eventforretning',why_sub:'Uanset om du er arrangør eller sælger — Festmore gør forbindelsen enkel hurtig og profitabel.',
    pricing_tag:'Enkle priser',pricing_h:'Start gratis. Vækst hurtigt.\nBetal kun når du er klar.',pricing_sub:'Ingen skjulte gebyrer. Ingen lange kontrakter. Annuller til enhver tid.',for_organisers:'For arrangører',for_vendors:'For sælgere',list_event_cta:'Tilføj dit event — start gratis →',vendor_cta:'Opret sælgerprofil — €49/år →',
    how_tag:'Simpel proces',how_h:'Live på minutter',step1_title:'Udfyld dine oplysninger',step1_desc:'Tilføj dit event eller sælgerprofil — tager under 5 minutter.',step2_title:'Vælg din plan',step2_desc:'Start gratis eller vælg Standard/Premium for maksimal synlighed.',step3_title:'Gå live straks',step3_desc:'Gratis opslag går live med det samme. Betalte opslag inden for minutter.',step4_title:'Bliv opdaget',step4_desc:'Besøgende fra 26 lande kan nu finde dig på Festmore og Google.',
    browse_events:'Gennemse events',browse_sub:'Find præcis den type event du elsker',view_all:'Se alle',events_label:'events',featured_events:'Udvalgte events',featured_sub:'Håndplukkede events du ikke må gå glip af',browse_country:'Gennemse efter land',festival_guides:'Festival-guides',guides_sub:'Ekspertguides opdateres dagligt',all_articles:'Artikler',
    newsletter_h:'Gå aldrig glip af et event',newsletter_sub:'De bedste festivaler og sælgermuligheder hver uge på e-mail.',newsletter_placeholder:'Din e-mailadresse',newsletter_btn:'Abonner gratis →',newsletter_success:'Du er tilmeldt! Velkommen til Festmore.',
    urgency_h:'🔥 Slut dig til {events}+ events og {vendors}+ sælgere',urgency_sub:'Start gratis i dag — opgrader når du er klar.',urgency_btn1:'Tilføj dit event →',urgency_btn2:'Bliv sælger →',
    footer_desc:'Europas festival- og sælgermarkedsplads. Vi forbinder arrangører med verificerede sælgere i 26 lande.',footer_for_org:'For arrangører',footer_for_ven:'For sælgere',footer_about:'Festmore',footer_list:'Tilføj event',footer_pricing:'Prisplaner',footer_find_vendors:'Find sælgere',footer_browse:'Gennemse events',footer_create:'Opret profil',footer_guide:'Sælger guide',footer_contact:'Kontakt',footer_about_us:'Om os',footer_articles:'Festival-guides',
  },
  nl: {
    nav_all:'Alle',nav_festivals:'Festivals',nav_markets:'Markten',nav_xmas:'Kerstmarkten',nav_concerts:'Concerten',nav_city:'Stadsevents',nav_flea:'Vlooienmarkten',nav_articles:'Artikelen',nav_vendors:'Verkopers',nav_pricing:'💰 Prijzen',nav_login:'Inloggen',nav_list_event:'+ Event toevoegen',nav_dashboard:'Dashboard',nav_logout:'Uitloggen',nav_register:'Registreren',nav_become_vendor:'Verkoper worden',nav_search:'Zoek events, steden, landen…',
    hero_badge:"Europa's #1 Festival & Verkoper Platform",hero_h1_1:'Waar events',hero_h1_2:'hun perfecte',hero_h1_3:'verkopers vinden',hero_sub:'Festmore verbindt evenementenorganisatoren met geverifieerde verkopers in 26 landen.',hero_cta1:'🎪 Voeg je event toe — gratis',hero_cta2:'🏪 Verkoper worden — €49/jaar',
    stat_events:'Events',stat_vendors:'Verkopers',stat_countries:'Landen',stat_subscribers:'Abonnees',
    trust_1:'Veilige Stripe-betaling',trust_2:'Geverifieerde verkopersprofielen',trust_3:'26 landen gedekt',trust_4:'Gratis vermeldingen beschikbaar',trust_5:'Dagelijks nieuwe events',
    why_tag:'Waarom Festmore',why_h:'Alles wat je nodig hebt om je eventbedrijf te laten groeien',why_sub:'Of je nu organisator of verkoper bent — Festmore maakt de verbinding eenvoudig snel en winstgevend.',
    pricing_tag:'Eenvoudige prijzen',pricing_h:'Gratis beginnen. Snel groeien.\nBetaal alleen wanneer je er klaar voor bent.',pricing_sub:'Geen verborgen kosten. Geen lange contracten. Altijd opzegbaar.',for_organisers:'Voor organisatoren',for_vendors:'Voor verkopers',list_event_cta:'Voeg je event toe — gratis starten →',vendor_cta:'Maak verkopersprofiel — €49/jaar →',
    how_tag:'Eenvoudig proces',how_h:'Live in minuten',step1_title:'Vul je gegevens in',step1_desc:'Voeg je event of verkopersprofiel toe — duurt minder dan 5 minuten.',step2_title:'Kies je plan',step2_desc:'Begin gratis of kies Standard/Premium voor maximale zichtbaarheid.',step3_title:'Direct live gaan',step3_desc:'Gratis vermeldingen gaan direct live. Betaalde vermeldingen binnen minuten.',step4_title:'Ontdekt worden',step4_desc:'Bezoekers uit 26 landen kunnen je nu vinden op Festmore en Google.',
    browse_events:'Events bekijken',browse_sub:'Vind precies het type event dat je zoekt',view_all:'Bekijk alle',events_label:'events',featured_events:'Uitgelichte events',featured_sub:'Zorgvuldig geselecteerde events die je niet mag missen',browse_country:'Blader per land',festival_guides:'Festival-gidsen',guides_sub:'Expertgidsen dagelijks bijgewerkt',all_articles:'Artikelen',
    newsletter_h:'Mis nooit een event',newsletter_sub:'De beste festivals en verkoperskansen elke week per e-mail.',newsletter_placeholder:'Jouw e-mailadres',newsletter_btn:'Gratis abonneren →',newsletter_success:'Je bent ingeschreven! Welkom bij Festmore.',
    urgency_h:'🔥 Sluit je aan bij {events}+ events en {vendors}+ verkopers',urgency_sub:'Begin vandaag gratis — upgrade wanneer je er klaar voor bent.',urgency_btn1:'Voeg je event toe →',urgency_btn2:'Verkoper worden →',
    footer_desc:"Europa's Festival & Verkoper Marktplaats. Wij verbinden organisatoren met geverifieerde verkopers in 26 landen.",footer_for_org:'Voor organisatoren',footer_for_ven:'Voor verkopers',footer_about:'Festmore',footer_list:'Event toevoegen',footer_pricing:'Prijsplannen',footer_find_vendors:'Verkopers vinden',footer_browse:'Events bekijken',footer_create:'Profiel aanmaken',footer_guide:'Verkopersgids',footer_contact:'Contact',footer_about_us:'Over ons',footer_articles:'Festival-gidsen',
  },
  fr: {
    nav_all:'Tous',nav_festivals:'Festivals',nav_markets:'Marchés',nav_xmas:'Marchés de Noël',nav_concerts:'Concerts',nav_city:'Événements urbains',nav_flea:'Marchés aux puces',nav_articles:'Articles',nav_vendors:'Vendeurs',nav_pricing:'💰 Tarifs',nav_login:'Connexion',nav_list_event:'+ Ajouter un événement',nav_dashboard:'Tableau de bord',nav_logout:'Déconnexion',nav_register:"S'inscrire",nav_become_vendor:'Devenir vendeur',nav_search:'Rechercher événements, villes, pays…',
    hero_badge:'La plateforme #1 en Europe pour festivals et vendeurs',hero_h1_1:'Où les événements',hero_h1_2:'rencontrent leurs',hero_h1_3:'vendeurs parfaits',hero_sub:'Festmore connecte les organisateurs avec des vendeurs vérifiés dans 26 pays.',hero_cta1:'🎪 Ajouter votre événement — gratuit',hero_cta2:'🏪 Devenir vendeur — 49€/an',
    stat_events:'Événements',stat_vendors:'Vendeurs',stat_countries:'Pays',stat_subscribers:'Abonnés',
    trust_1:'Paiements sécurisés Stripe',trust_2:'Profils vendeurs vérifiés',trust_3:'26 pays couverts',trust_4:'Annonces gratuites disponibles',trust_5:'Nouveaux événements quotidiens',
    why_tag:'Pourquoi Festmore',why_h:'Tout ce dont vous avez besoin pour développer votre activité événementielle',why_sub:"Que vous soyez organisateur ou vendeur — Festmore rend la connexion simple rapide et profitable.",
    pricing_tag:'Tarifs simples',pricing_h:'Commencez gratuitement. Grandissez vite.\nPayez seulement quand vous êtes prêt.',pricing_sub:'Aucuns frais cachés. Aucun long contrat. Annulez à tout moment.',for_organisers:'Pour les organisateurs',for_vendors:'Pour les vendeurs',list_event_cta:'Ajouter votre événement — commencer gratuitement →',vendor_cta:'Créer un profil vendeur — 49€/an →',
    how_tag:'Processus simple',how_h:'En ligne en quelques minutes',step1_title:'Remplissez vos informations',step1_desc:'Ajoutez votre événement ou profil vendeur en moins de 5 minutes.',step2_title:'Choisissez votre plan',step2_desc:'Commencez gratuitement ou choisissez Standard/Premium pour une visibilité maximale.',step3_title:'Mise en ligne instantanée',step3_desc:'Les annonces gratuites sont en ligne immédiatement. Les annonces payantes en quelques minutes.',step4_title:'Commencez à être découvert',step4_desc:'Des visiteurs de 26 pays peuvent maintenant vous trouver sur Festmore et Google.',
    browse_events:'Parcourir les événements',browse_sub:"Trouvez exactement le type d'événement que vous aimez",view_all:'Voir tout',events_label:'événements',featured_events:'Événements à la une',featured_sub:'Événements sélectionnés à ne pas manquer',browse_country:'Parcourir par pays',festival_guides:'Guides festivals',guides_sub:'Guides experts mis à jour quotidiennement',all_articles:'Articles',
    newsletter_h:'Ne manquez aucun événement',newsletter_sub:'Les meilleurs festivals et opportunités vendeurs chaque semaine par e-mail.',newsletter_placeholder:'Votre adresse e-mail',newsletter_btn:"S'abonner gratuitement →",newsletter_success:'Vous êtes abonné ! Bienvenue sur Festmore.',
    urgency_h:'🔥 Rejoignez {events}+ événements et {vendors}+ vendeurs',urgency_sub:"Commencez gratuitement aujourd'hui — passez à la version supérieure quand vous êtes prêt.",urgency_btn1:'Ajouter votre événement →',urgency_btn2:'Devenir vendeur →',
    footer_desc:"La marketplace festivals et vendeurs d'Europe. Nous connectons les organisateurs avec des vendeurs vérifiés dans 26 pays.",footer_for_org:'Pour les organisateurs',footer_for_ven:'Pour les vendeurs',footer_about:'Festmore',footer_list:'Ajouter un événement',footer_pricing:'Plans tarifaires',footer_find_vendors:'Trouver des vendeurs',footer_browse:'Parcourir les événements',footer_create:'Créer un profil',footer_guide:'Guide vendeur',footer_contact:'Contact',footer_about_us:'À propos',footer_articles:'Guides festivals',
  },
  se: {
    nav_all:'Alla',nav_festivals:'Festivaler',nav_markets:'Marknader',nav_xmas:'Julmarknader',nav_concerts:'Konserter',nav_city:'Stadsevenemang',nav_flea:'Loppmarknader',nav_articles:'Artiklar',nav_vendors:'Säljare',nav_pricing:'💰 Priser',nav_login:'Logga in',nav_list_event:'+ Lägg till evenemang',nav_dashboard:'Dashboard',nav_logout:'Logga ut',nav_register:'Registrera',nav_become_vendor:'Bli säljare',nav_search:'Sök evenemang, städer, länder…',
    hero_badge:'Europas #1 Festival & Säljarplattform',hero_h1_1:'Där evenemang',hero_h1_2:'möter sina',hero_h1_3:'perfekta säljare',hero_sub:'Festmore kopplar samman evenemangsarrangörer med verifierade säljare i 26 länder.',hero_cta1:'🎪 Lägg till ditt evenemang — gratis',hero_cta2:'🏪 Bli säljare — €49/år',
    stat_events:'Evenemang',stat_vendors:'Säljare',stat_countries:'Länder',stat_subscribers:'Prenumeranter',
    trust_1:'Säkra Stripe-betalningar',trust_2:'Verifierade säljareprofiler',trust_3:'26 länder täckta',trust_4:'Gratis annonser tillgängliga',trust_5:'Nya evenemang dagligen',
    why_tag:'Varför Festmore',why_h:'Allt du behöver för att växa ditt evenemangsbusiness',why_sub:'Oavsett om du är arrangör eller säljare — Festmore gör kopplingen enkel snabb och lönsam.',
    pricing_tag:'Enkla priser',pricing_h:'Börja gratis. Väx snabbt.\nBetala bara när du är redo.',pricing_sub:'Inga dolda avgifter. Inga långa kontrakt. Avsluta när som helst.',for_organisers:'För arrangörer',for_vendors:'För säljare',list_event_cta:'Lägg till ditt evenemang — börja gratis →',vendor_cta:'Skapa säljareprofil — €49/år →',
    how_tag:'Enkel process',how_h:'Live på minuter',step1_title:'Fyll i dina uppgifter',step1_desc:'Lägg till ditt evenemang eller säljareprofil — tar under 5 minuter.',step2_title:'Välj din plan',step2_desc:'Börja gratis eller välj Standard/Premium för maximal synlighet.',step3_title:'Gå live direkt',step3_desc:'Gratis annonser går live omedelbart. Betalda annonser inom minuter.',step4_title:'Börja bli upptäckt',step4_desc:'Besökare från 26 länder kan nu hitta dig på Festmore och Google.',
    browse_events:'Bläddra evenemang',browse_sub:'Hitta exakt den typ av evenemang du älskar',view_all:'Visa alla',events_label:'evenemang',featured_events:'Utvalda evenemang',featured_sub:'Handplockade evenemang du inte får missa',browse_country:'Bläddra per land',festival_guides:'Festivalguider',guides_sub:'Expertguider uppdateras dagligen',all_articles:'Artiklar',
    newsletter_h:'Missa aldrig ett evenemang',newsletter_sub:'De bästa festivalerna och säljaremöjligheterna varje vecka via e-post.',newsletter_placeholder:'Din e-postadress',newsletter_btn:'Prenumerera gratis →',newsletter_success:'Du är prenumerant! Välkommen till Festmore.',
    urgency_h:'🔥 Gå med i {events}+ evenemang och {vendors}+ säljare',urgency_sub:'Börja gratis idag — uppgradera när du är redo.',urgency_btn1:'Lägg till ditt evenemang →',urgency_btn2:'Bli säljare →',
    footer_desc:'Europas festival- och säljarmarknadsplats. Vi kopplar samman arrangörer med verifierade säljare i 26 länder.',footer_for_org:'För arrangörer',footer_for_ven:'För säljare',footer_about:'Festmore',footer_list:'Lägg till evenemang',footer_pricing:'Prisplaner',footer_find_vendors:'Hitta säljare',footer_browse:'Bläddra evenemang',footer_create:'Skapa profil',footer_guide:'Säljareguide',footer_contact:'Kontakt',footer_about_us:'Om oss',footer_articles:'Festivalguider',
  },
};

function getLang(req) {
  if (req.query && req.query.lang && translations[req.query.lang]) {
    if (req.session) req.session.lang = req.query.lang;
    return req.query.lang;
  }
  if (req.session && req.session.lang && translations[req.session.lang]) {
    return req.session.lang;
  }
  const acceptLang = req.headers && req.headers['accept-language'];
  if (acceptLang) {
    const browserLang = acceptLang.substring(0, 2).toLowerCase();
    const langMap = { de:'de', da:'dk', nl:'nl', fr:'fr', sv:'se' };
    if (langMap[browserLang] && translations[langMap[browserLang]]) return langMap[browserLang];
  }
  return 'en';
}

function t(req) {
  const lang = getLang(req);
  return translations[lang] || translations.en;
}

function langSwitcher(req) {
  const current = getLang(req);
  const langs = [
    { code:'en', flag:'🇬🇧', name:'EN' },
    { code:'de', flag:'🇩🇪', name:'DE' },
    { code:'dk', flag:'🇩🇰', name:'DA' },
    { code:'nl', flag:'🇳🇱', name:'NL' },
    { code:'fr', flag:'🇫🇷', name:'FR' },
    { code:'se', flag:'🇸🇪', name:'SV' },
  ];
  return `<div class="lang-switcher" id="lang-switcher">
  <button class="lang-current" onclick="document.getElementById('lang-dropdown').classList.toggle('open')" aria-label="Change language">
    ${langs.find(l => l.code === current) ? langs.find(l => l.code === current).flag : '🌍'} ${current.toUpperCase()} ▾
  </button>
  <div class="lang-dropdown" id="lang-dropdown">
    ${langs.map(l => '<a href="?lang=' + l.code + '" class="lang-option ' + (l.code === current ? 'active' : '') + '">' + l.flag + ' ' + l.name + '</a>').join('')}
  </div>
</div>
<style>
.lang-switcher{position:relative;}
.lang-current{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;}
.lang-current:hover{background:rgba(255,255,255,.15);}
.lang-dropdown{display:none;position:absolute;top:calc(100% + 8px);right:0;background:#1a1612;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:6px;min-width:120px;box-shadow:0 20px 40px rgba(0,0,0,.4);z-index:999;flex-direction:column;gap:2px;}
.lang-dropdown.open{display:flex;}
.lang-option{padding:7px 12px;border-radius:8px;font-size:12px;font-weight:600;color:rgba(255,255,255,.7);text-decoration:none;transition:all .15s;white-space:nowrap;}
.lang-option:hover{background:rgba(255,255,255,.08);color:#fff;}
.lang-option.active{background:rgba(232,71,10,.2);color:#ff7043;}
</style>
<script>
document.addEventListener('click',function(e){if(!e.target.closest('#lang-switcher')){var dd=document.getElementById('lang-dropdown');if(dd)dd.classList.remove('open');}});
</script>`;
}

module.exports = { t, getLang, langSwitcher, translations };
