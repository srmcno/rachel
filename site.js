/* Site settings. Everything that differs between the family archives lives here and in the data files;
   index.html, app.js and the shared modules are identical on both sites. */
window.SITE = {
  id: 'rachel',
  storage: 'rachel',
  title: "Rachel's Family Tree",
  data: 'content',                       // content.json + tree.json
  rootName: 'Rachel',
  rootPossessive: "Rachel’s",
  text: {
    brandSmall: 'Johnson · Bell · Nelton · Rivers',
    heroTitle: 'Rachel’s family history.',
    heroIntro: 'Explore the Johnson and Bell families of Oklahoma and north Texas, and the Nelton, Rivers and Canfield families along the Mississippi. Meet the people, see their photographs and follow the records across generations.',
    heroNote: '<strong>Diane’s birth family · Kocak, Stinar and Garms</strong><br><a href="#/tree/I392641098709">Open Evelyn’s family tree</a> · <a href="#/story/evelyn-kocak-garms-lead">Read the birth-family story</a>',
    gpIntro: 'Rachel’s four grandparents connect the Johnson, Bell, Nelton and Rivers families.',
    placesPath: 'From the Mississippi valley to Oklahoma and Texas.',
    momBlurb: 'Winona, Rollingstone and La Crosse, on both banks of the Mississippi.',
    momNames: 'Nelton · Rivers · Canfield · Brose · Frisch',
    dadBlurb: 'Choctaw County, Oklahoma, and Grayson and Collin counties, Texas.',
    dadNames: 'Johnson · Tyson · Bell · Williams · Parker',
    rootGroup: 'Rachel and her parents',
    aboutIntro: 'This family history follows the records. Where Rachel’s Ancestry tree disagrees with a record, the site shows what the record says and lists the change below.',
    aboutCompare: 'Compared with the Ancestry research copy on 1 November 2026. Record-backed corrections are retained below when the copied tree differs. Sources accompany each story; some collections require a subscription. <a href="https://www.ancestry.com/family-tree/tree/213201259/family" target="_blank" rel="noopener noreferrer">Open the Ancestry research tree</a>.',
    fixesTitle: 'Corrections to the Ancestry tree',
    sources: 'U.S. censuses 1880–1950; World War I and II draft cards; veterans’ headstone applications; Texas death certificates; Minnesota, Wisconsin, Texas and Arkansas marriage records; county histories of Winona and Wabasha counties; the Handbook of Texas and the Encyclopedia of Oklahoma History; and newspapers including the Winona Daily News, La Crosse Tribune, Boswell News, The Paris News, Atoka County Times and the McKinney Courier-Gazette.',
    credits: 'Family photographs come from the Nelton Family Tree on Ancestry. Restored and colorized editions are AI interpretations; the originals are always available for comparison.'
  },
  lineBlurbs: ['Choctaw County, Oklahoma, and Milam County, Texas', 'Grayson and Collin counties, Texas', 'Winona, Minnesota, with German and Pennsylvania roots', 'Rollingstone, Minnesota, with Luxembourg roots'],
  featured: ['evelyn-kocak-garms-lead', 'wedding-1958', 'bob-airborne', 'margie-bell', 'arthur-carpenter', 'brose-family-winona', 'hall-wabasha-households'],
  topics: {
    birthFamily: { label: 'Diane’s birth family', copy: 'Evelyn Kocak Garms, the Stinar family and Diane’s discovery of her birth family.', ids: ['evelyn-kocak-garms-lead', 'kocak-two-marys', 'stinar-family-minneota', 'john-garms-sioux-valley'] },
    service: { label: 'Military service', copy: 'Army careers, wartime service and the families at home.', ids: ['bob-airborne', 'joe-johnson', 'johns-hart-township'], img: 'img/news/bob_johnson_obit_photo.jpg' },
    work: { label: 'Work and community', copy: 'Carpenters, farmers, merchants and the towns they helped build.', ids: ['george-nelton', 'arthur-carpenter', 'rivers-family-store', 'hall-wabasha-households', 'rivers-rollingstone', 'joel-anderson', 'bell-farm'], img: 'img/p/f83312b9.jpg' },
    family: { label: 'Family life', copy: 'Weddings, shared households and the next generation.', ids: ['wedding-1958', 'margie-bell', 'diane-rivers', 'tyson-sisters', 'canfield-springs', 'brose-family-winona', 'rivers-heffingen'], img: 'img/news/wedding_1958_photo.jpg' }
  },
  regions: [
    { id: 'winona', name: 'Winona & Rollingstone', label: 'Minnesota', terms: ['winona', 'rollingstone', 'minnesota city', 'oak ridge', 'hart township'], description: 'River towns, hill farms, the Nelton building trade and the Rivers family’s long ties to Rollingstone.', archive: 'winona-levee' },
    { id: 'wabasha', name: 'Kellogg & Wabasha County', label: 'Minnesota', terms: ['wabasha', 'kellogg', 'canfield springs', 'highland township'], description: 'The Canfield and Hall families’ Minnesota connections, from Cook’s Valley to the towns along the river.' },
    { id: 'la-crosse', name: 'La Crosse & the river valley', label: 'Wisconsin', terms: ['la crosse', 'holmen', 'bangor', 'middle ridge'], description: 'The Wisconsin communities that became home to David and Diane’s family.', archive: 'la-crosse' },
    { id: 'choctaw', name: 'Boswell & Choctaw County', label: 'Oklahoma', terms: ['choctaw', 'boswell', 'soper', 'boehler', 'buckhorn', 'sand bluff', 'calera'], description: 'Johnson and Tyson family connections across the farms and small communities of southeastern Oklahoma.' },
    { id: 'north-texas', name: 'North Texas', label: 'Texas', terms: ['grayson', 'collin', 'van alstyne', 'denison', 'sherman', 'mantua', 'savoy', 'sadler', 'anna, texas'], description: 'The Bell, Williams and Parker families’ farm country, and the Texas towns linked to Bob and Margie.' },
    { id: 'milam', name: 'Milam County', label: 'Texas', terms: ['milam'], description: 'A place to follow the Fail family and the still-unresolved early Johnson connections.' },
    { id: 'pennsylvania', name: 'Pennsylvania', label: 'Earlier roots', terms: ['pennsylvania', 'perry county', 'cumberland county', 'berks', 'linesville'], description: 'Earlier Hall, Butturff and Canfield family connections before the move west.' },
    { id: 'luxembourg', name: 'Luxembourg', label: 'Across the Atlantic', terms: ['luxembourg', 'heffingen', 'beaufort', 'fischbach', 'mersch', 'echternach'], description: 'The places named in the Rivers and Frisch families’ histories before their settlement in Minnesota.' },
    { id: 'germany', name: 'Germany & Prussia', label: 'Across the Atlantic', terms: ['germany', 'prussia', 'posen', 'wolwark', 'pommern', 'bromberg'], description: 'Recorded origins on the Nelton and Brose branches. Some exact birthplaces remain uncertain.' }
  ]
};
document.title = window.SITE.title;
document.documentElement.dataset.site = window.SITE.id;
