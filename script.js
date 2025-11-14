function formatCurrency(n) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function calcTargets() {
  const months = clamp(parseInt(document.getElementById('targetMonths').value || '12', 10), 1, 120);
  const total = 1_000_000;
  const perMonth = total / months;
  const perWeek = total / (months * 4.345);
  const perDay = total / (months * 30);
  document.getElementById('targetOutput').innerHTML = `
    <div><strong>${formatCurrency(perMonth)}</strong> / month</div>
    <div>${formatCurrency(perWeek)} / week</div>
    <div>${formatCurrency(perDay)} / day</div>
    <div class="small">Assumes 30 days/month, 4.345 weeks/month</div>
  `;
}

function calcUnitEconomics() {
  const price = Math.max(1, parseFloat(document.getElementById('pricePerSale').value || '1000'));
  const closeRate = clamp(parseFloat(document.getElementById('closeRate').value || '20'), 1, 100) / 100;
  const respRate = clamp(parseFloat(document.getElementById('respRate').value || '5'), 1, 100) / 100;
  const outreachPerDay = Math.max(1, parseInt(document.getElementById('outreachPerDay').value || '50', 10));

  const positivesPerDay = outreachPerDay * respRate;
  const dealsPerDay = positivesPerDay * closeRate;
  const revenuePerDay = dealsPerDay * price;
  const revenuePerMonth = revenuePerDay * 30;

  const unitOut = document.getElementById('unitOutput');
  unitOut.innerHTML = `
    <div><strong>${(positivesPerDay).toFixed(1)}</strong> positive responses/day</div>
    <div><strong>${dealsPerDay.toFixed(2)}</strong> deals/day</div>
    <div>${formatCurrency(revenuePerDay)} / day (~ ${formatCurrency(revenuePerMonth)} / month)</div>
  `;

  // Update KPIs
  const kpiOutreach = document.getElementById('kpiOutreach');
  const kpiLeads = document.getElementById('kpiLeads');
  const kpiDeals = document.getElementById('kpiDeals');
  if (kpiOutreach) kpiOutreach.textContent = outreachPerDay.toString();
  if (kpiLeads) kpiLeads.textContent = positivesPerDay.toFixed(1);
  if (kpiDeals) kpiDeals.textContent = (dealsPerDay * 7).toFixed(1);
}

function calcRunway() {
  const hoursPerDay = clamp(parseInt(document.getElementById('hoursPerDay').value || '6', 10), 1, 16);
  const daysPerWeek = clamp(parseInt(document.getElementById('daysPerWeek').value || '6', 10), 1, 7);

  // Model: Free flips (2?4 hrs each) + micro-gigs (1?2 hrs each)
  const flipsPerWeek = Math.max(1, Math.floor((hoursPerDay * daysPerWeek) / 10));
  const gigsPerWeek = Math.max(1, Math.floor((hoursPerDay * daysPerWeek) / 6));
  const avgFlipMargin = 90; // conservative
  const avgGigProfit = 40;  // conservative

  const weekly = flipsPerWeek * avgFlipMargin + gigsPerWeek * avgGigProfit;
  const monthly = weekly * 4.345;

  document.getElementById('runwayOutput').innerHTML = `
    <div><strong>${flipsPerWeek}</strong> flips / week @ ~$${avgFlipMargin} margin</div>
    <div><strong>${gigsPerWeek}</strong> micro-gigs / week @ ~$${avgGigProfit} profit</div>
    <div>~ ${formatCurrency(weekly)} / week (~ ${formatCurrency(monthly)} / month)</div>
    <div class="small">Use this to quickly fund software, domains, and small contractor spend.</div>
  `;
}

function persistChecklist() {
  const lists = document.querySelectorAll('[data-checklist]');
  lists.forEach(list => {
    const key = 'ck_' + list.getAttribute('data-checklist');
    const inputs = list.querySelectorAll('input[type="checkbox"]');
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    inputs.forEach((input, idx) => {
      input.checked = !!saved[idx];
      input.addEventListener('change', () => {
        const state = Array.from(inputs).map(i => i.checked);
        localStorage.setItem(key, JSON.stringify(state));
      });
    });
  });
}

function setupExport() {
  const btn = document.getElementById('exportPdfBtn');
  if (!btn) return;
  btn.addEventListener('click', () => window.print());
}

function setupListeners() {
  ['targetMonths'].forEach(id => document.getElementById(id).addEventListener('input', calcTargets));
  ['pricePerSale','closeRate','respRate','outreachPerDay'].forEach(id => document.getElementById(id).addEventListener('input', calcUnitEconomics));
  ['hoursPerDay','daysPerWeek'].forEach(id => document.getElementById(id).addEventListener('input', calcRunway));
}

(function init() {
  setupListeners();
  persistChecklist();
  setupExport();
  calcTargets();
  calcUnitEconomics();
  calcRunway();
})();
