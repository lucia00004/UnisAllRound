const fetch = require('node-fetch');

const decodeHtmlEntities = (str) => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
};

const cleanHtml = (text) => {
  return decodeHtmlEntities(text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
};

const run = async () => {
  try {
    const response = await fetch('https://www.unisa.it');
    const html = await response.text();
    
    const bachecaStart = html.indexOf('<h2>bacheca</h2>') !== -1 
      ? html.indexOf('<h2>bacheca</h2>') 
      : html.indexOf('data-tts="true">bacheca</h2>');
      
    if (bachecaStart === -1) {
      console.log('bacheca not found');
      return;
    }
    
    const bachecaEnd = html.indexOf('</ul>', bachecaStart);
    if (bachecaEnd === -1) {
      console.log('</ul> end not found');
      return;
    }
    const bachecaHtml = html.substring(bachecaStart, bachecaEnd);
    
    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    const items = [];
    let match;
    let idCounter = 1;
    
    while ((match = liRegex.exec(bachecaHtml)) !== null && items.length < 5) {
      const liContent = match[1];
      console.log(`--- ITEM ${idCounter} RAW CONTENT ---`);
      
      const tagMatch = liContent.match(/<small[^>]*>([\s\S]*?)<\/small>/);
      const tag = tagMatch ? cleanHtml(tagMatch[1]) : 'Ateneo';
      
      const h3Match = liContent.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (!h3Match) {
        console.log('No H3 match');
        continue;
      }
      
      const aMatch = h3Match[1].match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (!aMatch) {
        console.log('No a href match');
        continue;
      }
      
      const link = aMatch[1].startsWith('http') ? aMatch[1] : `https://www.unisa.it${aMatch[1]}`;
      const title = cleanHtml(aMatch[2]);
      
      let body = '';
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
      let pMatch;
      while ((pMatch = pRegex.exec(liContent)) !== null) {
        const content = pMatch[1].trim();
        if (!content.includes('<small') && !content.includes('class="categoryover"')) {
          body = cleanHtml(content);
          break;
        }
      }
      
      if (!body) {
        body = title;
      }
      
      console.log(`PARSED:
  title: "${title}"
  tag: "${tag}"
  body: "${body}"
  link: "${link}"
`);
      items.push({
        id: `unisa-live-${idCounter++}`,
        title,
        body,
        tag,
        link,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

run();
