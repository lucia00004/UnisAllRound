import express from 'express';

const router = express.Router();

const CANTEEN_URL = 'https://www.adisurcampania.it/ristorazione/mense-ed-esercizi-convenzionati/mensa-di-fisciano-e-baronissi';

// Parse a menu section (pranzo or cena) from the HTML content
function parseMenuSection(html: string, sectionTitle: string) {
  const startIndex = html.indexOf(sectionTitle);
  if (startIndex === -1) return [];

  // Find where this section ends (e.g. next section or body tag)
  let endIndex = html.indexOf('field field--name-field-titolo', startIndex + sectionTitle.length);
  if (endIndex === -1) {
    endIndex = html.indexOf('field field--name-field-body', startIndex + sectionTitle.length);
  }
  if (endIndex === -1) {
    endIndex = html.length;
  }

  const sectionHtml = html.substring(startIndex, endIndex);
  const items: { day: string; date: string; url: string }[] = [];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Match <a> tags inside block-scadenze and capture day, month, year
  const aRegex = /<a href="([^"]*)"[^>]*>[\s\S]*?<div class="block-scadenze-day">(\d+)<\/div>[\s\S]*?<div class="block-scadenze-month">([^<]*)<\/div>[\s\S]*?<div class="block-scadenze-year">(\d+)<\/div>/g;
  
  let match;
  let index = 0;
  while ((match = aRegex.exec(sectionHtml)) !== null && index < 7) {
    const rawUrl = match[1].trim();
    const dayVal = match[2].trim();
    const monthVal = match[3].trim();
    const yearVal = match[4].trim();
    
    // Check if the URL is non-empty, and prepend domain if relative
    const url = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://www.adisurcampania.it${rawUrl}`) : '';
    
    items.push({
      day: dayNames[index] || 'Giorno',
      date: `${dayVal} ${monthVal} ${yearVal}`,
      url: url
    });
    index++;
  }
  return items;
}

router.get('/menu', async (req, res) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(CANTEEN_URL, { signal: controller.signal });
    const html = await response.text();
    clearTimeout(timeoutId);

    const lunchItems = parseMenuSection(html, 'Menu pranzo');
    const dinnerItems = parseMenuSection(html, 'Menu cena');

    res.json({
      lunch: lunchItems,
      dinner: dinnerItems,
      officialPageUrl: CANTEEN_URL
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Backend failed to fetch ADISURC canteen page:', err.message);
    // Graceful fallback with empty lists in case of errors
    res.json({
      lunch: [],
      dinner: [],
      officialPageUrl: CANTEEN_URL
    });
  }
});

export default router;
