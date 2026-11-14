/* AllTools Hub - tool registry.
   Every tool is described once here: its text, its form fields and its logic.
   The website pages are generated from this list (see build.js). */
(function (root) {
  'use strict';

  var CATEGORIES = [
    { id: 'text', name: 'Text Tools', blurb: 'Count, clean and convert text.' },
    { id: 'calc', name: 'Calculators', blurb: 'Money, health, dates and percentages.' },
    { id: 'dev', name: 'Developer Tools', blurb: 'Format, encode and generate data.' },
    { id: 'unit', name: 'Unit Converters', blurb: 'Convert length, weight and temperature.' },
    { id: 'other', name: 'Other Tools', blurb: 'Handy everyday utilities.' }
  ];

  /* ---------- shared helpers ---------- */
  function fmt(n, d) {
    d = d == null ? 2 : d;
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function sig(n) {
    return Number(n).toLocaleString('en-US', { maximumSignificantDigits: 10 });
  }
  function money(n, c) { return (c || '') + fmt(n, 2); }

  function num(v, label, o) {
    o = o || {};
    if (v === '' || v == null) throw new Error('Please enter ' + label + '.');
    var n = Number(v);
    if (!isFinite(n)) throw new Error(label.charAt(0).toUpperCase() + label.slice(1) + ' must be a number.');
    if (o.min != null && n < o.min) throw new Error(label.charAt(0).toUpperCase() + label.slice(1) + ' must be ' + o.min + ' or more.');
    if (o.max != null && n > o.max) throw new Error(label.charAt(0).toUpperCase() + label.slice(1) + ' must be ' + o.max + ' or less.');
    if (o.int && Math.floor(n) !== n) throw new Error(label.charAt(0).toUpperCase() + label.slice(1) + ' must be a whole number.');
    return n;
  }

  function randInt(n) { // secure random whole number from 0 to n-1
    if (n <= 1) return 0;
    var lim = Math.floor(4294967296 / n) * n, a = new Uint32Array(1);
    do { crypto.getRandomValues(a); } while (a[0] >= lim);
    return a[0] % n;
  }

  var CURRENCIES = [['₹', '₹ Rupee'], ['$', '$ Dollar'], ['€', '€ Euro'], ['£', '£ Pound'], ['', 'No symbol']];
  var currencyField = { name: 'cur', label: 'Currency symbol', type: 'select', options: CURRENCIES, default: '₹' };

  function words(s) { return s.match(/[\p{L}\p{N}]+/gu) || []; }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }

  /* ---------- unit converters ---------- */
  function converter(o) {
    return {
      id: o.id, name: o.name, cat: 'unit', icon: o.icon, desc: o.desc, intro: o.intro,
      steps: ['Type the number you want to convert.', 'Choose the unit you start with in "From".', 'Choose the unit you want in "To".', 'Click Convert. The result and the same value in all other units appear below.'],
      keywords: o.keywords, popular: !!o.popular, added: '2026-11-14', action: 'Convert',
      fields: [
        { name: 'value', label: 'Value', type: 'number', default: '1', step: 'any' },
        { name: 'from', label: 'From', type: 'select', options: o.units.map(function (u) { return [u[0], u[1]]; }), default: o.from },
        { name: 'to', label: 'To', type: 'select', options: o.units.map(function (u) { return [u[0], u[1]]; }), default: o.to }
      ],
      run: function (v) {
        var x = num(v.value, 'a value'), f = {}, labels = {};
        o.units.forEach(function (u) { f[u[0]] = u[2]; labels[u[0]] = u[1]; });
        var short = function (k) { return k; };
        var stats = [['Result', sig(x) + ' ' + short(v.from) + ' = ' + sig(x * f[v.from] / f[v.to]) + ' ' + short(v.to)]];
        o.units.forEach(function (u) {
          if (u[0] !== v.from) stats.push([u[1], sig(x * f[v.from] / f[u[0]])]);
        });
        return { stats: stats };
      }
    };
  }

  /* ---------- tools ---------- */
  var TOOLS = [

    /* ===== TEXT ===== */
    {
      id: 'word-counter', name: 'Word Counter', cat: 'text', icon: 'Aa', live: true, popular: true, added: '2026-10-01',
      desc: 'Count words, characters, sentences and reading time.',
      intro: 'Count the words, characters, sentences and paragraphs in any text. Useful for essays, social posts, product descriptions and any writing with a length limit.',
      steps: ['Type or paste your text into the box.', 'The counts update as you type. There is no button to press.', 'Use Copy results to copy the numbers, or Reset to start again.'],
      keywords: ['character counter', 'letters', 'sentences', 'paragraphs', 'reading time', 'count'],
      fields: [{ name: 'text', label: 'Your text', type: 'textarea', rows: 9, placeholder: 'Type or paste your text here...' }],
      run: function (v) {
        var t = v.text, trimmed = t.trim();
        var w = trimmed ? trimmed.split(/\s+/).length : 0;
        var sentences = t.split(/[.!?]+(?=\s|$)/).filter(function (s) { return /[\p{L}\p{N}]/u.test(s); }).length;
        var paragraphs = t.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length;
        var secs = Math.round(w / 200 * 60);
        var reading = w === 0 ? '0 sec' : secs < 60 ? Math.max(secs, 1) + ' sec' : Math.ceil(w / 200) + ' min';
        return { stats: [
          ['Words', fmt(w, 0)], ['Characters', fmt(Array.from(t).length, 0)],
          ['Characters (no spaces)', fmt(Array.from(t.replace(/\s/g, '')).length, 0)],
          ['Sentences', fmt(sentences, 0)], ['Paragraphs', fmt(paragraphs, 0)], ['Reading time', reading]
        ] };
      }
    },

    {
      id: 'case-converter', name: 'Case Converter', cat: 'text', icon: 'aA', added: '2026-11-14', popular: true,
      desc: 'Change text to uppercase, lowercase, title case and more.',
      intro: 'Change the capital letters in your text in one click. Choose UPPERCASE, lowercase, Title Case, Sentence case, or programming styles such as camelCase and snake_case.',
      steps: ['Paste your text into the box.', 'Choose the style you want.', 'Click Convert.', 'Click Copy to copy the new text, or Download to save it as a file.'],
      keywords: ['uppercase', 'lowercase', 'title case', 'sentence case', 'camelcase', 'snake case', 'kebab case', 'capitalize'],
      action: 'Convert', download: 'converted-text.txt',
      fields: [
        { name: 'text', label: 'Your text', type: 'textarea', rows: 7, placeholder: 'Paste your text here...' },
        { name: 'mode', label: 'Style', type: 'select', default: 'title', options: [
          ['upper', 'UPPERCASE'], ['lower', 'lowercase'], ['title', 'Title Case'], ['sentence', 'Sentence case'],
          ['camel', 'camelCase'], ['pascal', 'PascalCase'], ['snake', 'snake_case'], ['kebab', 'kebab-case']] }
      ],
      run: function (v) {
        var s = v.text;
        if (!s.trim()) throw new Error('Please type or paste some text first.');
        var w = words(s), out;
        switch (v.mode) {
          case 'upper': out = s.toUpperCase(); break;
          case 'lower': out = s.toLowerCase(); break;
          case 'title': out = s.toLowerCase().replace(/(^|[\s\-_(\[])(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); }); break;
          case 'sentence': out = s.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); }); break;
          case 'camel': out = w.map(function (x, i) { return i ? cap(x) : x.toLowerCase(); }).join(''); break;
          case 'pascal': out = w.map(cap).join(''); break;
          case 'snake': out = w.map(function (x) { return x.toLowerCase(); }).join('_'); break;
          default: out = w.map(function (x) { return x.toLowerCase(); }).join('-');
        }
        if (!out) throw new Error('No letters or numbers were found in your text.');
        return { text: out, textLabel: 'Converted text' };
      }
    },

    {
      id: 'remove-duplicate-lines', name: 'Remove Duplicate Lines', cat: 'text', icon: '≡', added: '2026-11-14',
      desc: 'Delete repeated lines from a list and keep each line once.',
      intro: 'Paste a list and get it back with every repeated line removed. The first copy of each line is kept and the order stays the same. Good for email lists, keyword lists and log files.',
      steps: ['Paste your list with one item on each line.', 'Choose your options. For example, tick "Ignore capital letters" to treat Apple and apple as the same.', 'Click Remove duplicates.', 'Copy the clean list or download it.'],
      keywords: ['duplicate', 'unique', 'dedupe', 'lines', 'list', 'repeated'],
      action: 'Remove duplicates', download: 'unique-lines.txt',
      fields: [
        { name: 'text', label: 'Your list (one item per line)', type: 'textarea', rows: 9, placeholder: 'apple\nbanana\napple' },
        { name: 'ci', label: 'Ignore capital letters (Apple = apple)', type: 'checkbox', default: false },
        { name: 'trim', label: 'Ignore spaces at the start and end of each line', type: 'checkbox', default: true },
        { name: 'empty', label: 'Remove empty lines', type: 'checkbox', default: false }
      ],
      run: function (v) {
        if (!v.text.trim()) throw new Error('Please paste a list first.');
        var lines = v.text.split(/\r?\n/), seen = {}, out = [];
        lines.forEach(function (l) {
          var val = v.trim ? l.trim() : l;
          if (v.empty && val.trim() === '') return;
          var key = '$' + (v.ci ? val.toLowerCase() : val);
          if (seen[key]) return;
          seen[key] = true; out.push(val);
        });
        return { text: out.join('\n'), textLabel: 'Unique lines', stats: [
          ['Lines you pasted', fmt(lines.length, 0)], ['Lines kept', fmt(out.length, 0)], ['Lines removed', fmt(lines.length - out.length, 0)]] };
      }
    },

    {
      id: 'text-to-slug', name: 'Text to Slug Converter', cat: 'text', icon: '-/-', added: '2026-11-14',
      desc: 'Turn a title into a clean, web-friendly URL slug.',
      intro: 'A slug is the readable last part of a web address, like my-first-blog-post. This tool turns any title into a clean slug with only lowercase letters, numbers and dashes.',
      steps: ['Type or paste your title.', 'Choose a dash (-) or an underscore (_) to separate words.', 'Click Make slug.', 'Copy the slug and use it in your web address.'],
      keywords: ['slug', 'url', 'permalink', 'seo', 'web address'],
      action: 'Make slug',
      fields: [
        { name: 'text', label: 'Title or text', type: 'text', placeholder: 'My First Blog Post!' },
        { name: 'sep', label: 'Separator', type: 'select', default: '-', options: [['-', 'Dash ( - )'], ['_', 'Underscore ( _ )']] }
      ],
      note: 'Accents are removed (café becomes cafe). Letters from non-Latin alphabets, such as Hindi or Chinese, cannot be turned into slug letters and are left out.',
      run: function (v) {
        if (!v.text.trim()) throw new Error('Please type a title first.');
        var s = v.text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, v.sep);
        s = s.replace(new RegExp('^' + v.sep + '+|' + v.sep + '+$', 'g'), '');
        if (!s) throw new Error('No English letters or numbers were found, so no slug could be made.');
        return { text: s, textLabel: 'Your slug' };
      }
    },

    /* ===== CALCULATORS ===== */
    {
      id: 'gst-calculator', name: 'GST Calculator', cat: 'calc', icon: '%', popular: true, added: '2026-10-01',
      desc: 'Add GST to a price or remove it from a total.',
      intro: 'Work out the GST (or VAT / sales tax) on a price. You can add tax to a price, or find the original price when the tax is already included in the total.',
      steps: ['Enter the amount.', 'Enter the GST rate, for example 18.', 'Choose whether to add GST, or whether GST is already included in your amount.', 'Click Calculate to see the price before tax, the tax amount and the total.'],
      keywords: ['gst', 'vat', 'tax', 'sales tax', 'cgst', 'sgst', 'india'],
      action: 'Calculate',
      fields: [
        { name: 'amount', label: 'Amount', type: 'number', min: 0, step: 'any', placeholder: '1000' },
        { name: 'rate', label: 'GST rate (%)', type: 'number', min: 0, max: 100, step: 'any', default: '18' },
        { name: 'mode', label: 'What does your amount include?', type: 'select', default: 'add', options: [['add', 'Add GST to this amount'], ['remove', 'This amount already includes GST']] },
        currencyField
      ],
      note: 'Tax rules differ by country and by product. Check the rate that applies to you.',
      run: function (v) {
        var a = num(v.amount, 'an amount', { min: 0 }), r = num(v.rate, 'the GST rate', { min: 0, max: 100 }), net, gst, total;
        if (v.mode === 'add') { net = a; gst = a * r / 100; total = a + gst; }
        else { net = a / (1 + r / 100); gst = a - net; total = a; }
        return { stats: [['Price before GST', money(net, v.cur)], ['GST amount', money(gst, v.cur)], ['Total price', money(total, v.cur)],
          ['If split equally (CGST + SGST), each', money(gst / 2, v.cur)]] };
      }
    },

    {
      id: 'percentage-calculator', name: 'Percentage Calculator', cat: 'calc', icon: '÷%', popular: true, added: '2026-11-14',
      desc: 'Find a percentage, or a percentage increase or decrease.',
      intro: 'Answer the three most common percentage questions: what is a percentage of a number, what percentage one number is of another, and how much a value has gone up or down.',
      steps: ['Choose the question you want answered.', 'Enter number A and number B. The question you chose shows how each number is used.', 'Click Calculate.'],
      keywords: ['percent', 'percentage', 'increase', 'decrease', 'change', 'ratio'],
      action: 'Calculate',
      fields: [
        { name: 'mode', label: 'Question', type: 'select', default: 'of', options: [['of', 'What is A% of B?'], ['is', 'A is what percent of B?'], ['change', 'Percent change from A to B']] },
        { name: 'a', label: 'Number A', type: 'number', step: 'any', placeholder: '20' },
        { name: 'b', label: 'Number B', type: 'number', step: 'any', placeholder: '350' }
      ],
      run: function (v) {
        var a = num(v.a, 'number A'), b = num(v.b, 'number B');
        if (v.mode === 'of') return { stats: [[sig(a) + '% of ' + sig(b), sig(a / 100 * b)]] };
        if (v.mode === 'is') {
          if (b === 0) throw new Error('Number B cannot be 0 for this question.');
          return { stats: [[sig(a) + ' is this percent of ' + sig(b), sig(a / b * 100) + '%']] };
        }
        if (a === 0) throw new Error('Number A cannot be 0 when finding a percent change.');
        var c = (b - a) / Math.abs(a) * 100;
        return { stats: [[c >= 0 ? 'Increase' : 'Decrease', sig(Math.abs(c)) + '%'], ['Difference', sig(b - a)]] };
      }
    },

    {
      id: 'discount-calculator', name: 'Discount Calculator', cat: 'calc', icon: '−%', added: '2026-11-14',
      desc: 'See the sale price and how much you save.',
      intro: 'Find the final price after a discount and see exactly how much money you save. Handy when you are shopping in a sale.',
      steps: ['Enter the original price.', 'Enter the discount percentage.', 'Click Calculate to see your savings and the final price.'],
      keywords: ['discount', 'sale', 'offer', 'price', 'savings', 'off'],
      action: 'Calculate',
      fields: [
        { name: 'price', label: 'Original price', type: 'number', min: 0, step: 'any', placeholder: '2500' },
        { name: 'pct', label: 'Discount (%)', type: 'number', min: 0, max: 100, step: 'any', placeholder: '25' },
        currencyField
      ],
      run: function (v) {
        var p = num(v.price, 'the original price', { min: 0 }), d = num(v.pct, 'the discount', { min: 0, max: 100 });
        var save = p * d / 100;
        return { stats: [['Original price', money(p, v.cur)], ['You save', money(save, v.cur)], ['Final price', money(p - save, v.cur)]] };
      }
    },

    {
      id: 'bmi-calculator', name: 'BMI Calculator', cat: 'calc', icon: 'BMI', popular: true, added: '2026-11-14',
      desc: 'Calculate your Body Mass Index from height and weight.',
      intro: 'Body Mass Index (BMI) compares your weight with your height. It is a quick screening number for adults. This tool also shows the weight range that matches a healthy BMI for your height.',
      steps: ['Choose metric (kg and cm) or imperial (pounds and inches).', 'Enter your weight and your height.', 'Click Calculate BMI.'],
      keywords: ['bmi', 'body mass index', 'weight', 'height', 'health', 'obesity'],
      action: 'Calculate BMI',
      fields: [
        { name: 'unit', label: 'Units', type: 'select', default: 'metric', options: [['metric', 'Metric (kg, cm)'], ['imperial', 'Imperial (pounds, inches)']] },
        { name: 'w', label: 'Weight (kg or pounds)', type: 'number', min: 0, step: 'any', placeholder: '70' },
        { name: 'h', label: 'Height (cm or inches)', type: 'number', min: 0, step: 'any', placeholder: '170' }
      ],
      note: 'BMI is for adults aged 18 and over. It does not measure body fat and is not a medical diagnosis. Speak to a doctor about your health.',
      run: function (v) {
        var w = num(v.w, 'your weight', { min: 0 }), h = num(v.h, 'your height', { min: 0 });
        var kg = v.unit === 'metric' ? w : w * 0.45359237, cm = v.unit === 'metric' ? h : h * 2.54;
        if (kg < 2 || kg > 650) throw new Error('Please check your weight. It looks outside the normal range.');
        if (cm < 50 || cm > 275) throw new Error('Please check your height. It looks outside the normal range.');
        var m = cm / 100, bmi = kg / (m * m);
        var cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy weight' : bmi < 30 ? 'Overweight' : 'Obesity';
        var lo = 18.5 * m * m, hi = 24.9 * m * m;
        return { stats: [['Your BMI', fmt(bmi, 1)], ['Category', cat],
          ['Healthy weight range for your height', fmt(lo, 1) + ' to ' + fmt(hi, 1) + ' kg (' + fmt(lo / 0.45359237, 1) + ' to ' + fmt(hi / 0.45359237, 1) + ' lb)']] };
      }
    },

    {
      id: 'age-calculator', name: 'Age Calculator', cat: 'calc', icon: 'Age', featured: true, added: '2026-11-14',
      desc: 'Find your exact age in years, months and days.',
      intro: 'Enter a date of birth to see an exact age in years, months and days, the total days lived and how long until the next birthday. You can also check the age on any other date.',
      steps: ['Choose the date of birth.', 'Leave "Age on this date" empty to use today, or pick another date.', 'Click Calculate age.'],
      keywords: ['age', 'birthday', 'date of birth', 'dob', 'years months days'],
      action: 'Calculate age',
      fields: [
        { name: 'dob', label: 'Date of birth', type: 'date' },
        { name: 'asof', label: 'Age on this date (optional)', type: 'date', help: 'Leave empty to use today.' }
      ],
      run: function (v) {
        if (!v.dob) throw new Error('Please choose a date of birth.');
        var p = function (s) { var x = s.split('-').map(Number); return { y: x[0], m: x[1], d: x[2] }; };
        var b = p(v.dob), a;
        if (v.asof) a = p(v.asof); else { var n = new Date(); a = { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
        var bu = Date.UTC(b.y, b.m - 1, b.d), au = Date.UTC(a.y, a.m - 1, a.d);
        if (bu > au) throw new Error('The date of birth must be before the "Age on this date" date.');
        var y = a.y - b.y, m = a.m - b.m, d = a.d - b.d;
        if (d < 0) { m--; d += new Date(a.y, a.m - 1, 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        var next = Date.UTC(a.y, b.m - 1, b.d); if (next < au) next = Date.UTC(a.y + 1, b.m - 1, b.d);
        var left = Math.round((next - au) / 864e5), days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var pl = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
        return { stats: [['Age', pl(y, 'year') + ', ' + pl(m, 'month') + ', ' + pl(d, 'day')], ['Total days lived', fmt(Math.round((au - bu) / 864e5), 0)],
          ['Next birthday', left === 0 ? 'Today' : 'In ' + pl(left, 'day') + ', on a ' + days[new Date(next).getUTCDay()]]] };
      }
    },

    {
      id: 'emi-calculator', name: 'EMI Calculator', cat: 'calc', icon: 'EMI', featured: true, added: '2026-11-14',
      desc: 'Work out the monthly payment on a loan.',
      intro: 'EMI means Equated Monthly Instalment: the fixed amount you pay each month on a loan. Use it to compare loans for a home, car or personal purchase before you apply.',
      steps: ['Enter the loan amount.', 'Enter the yearly interest rate.', 'Enter how long you will repay, in years or months.', 'Click Calculate EMI to see the monthly payment, total interest and total cost.'],
      keywords: ['emi', 'loan', 'mortgage', 'interest', 'instalment', 'monthly payment', 'home loan', 'car loan'],
      action: 'Calculate EMI',
      fields: [
        { name: 'p', label: 'Loan amount', type: 'number', min: 0, step: 'any', placeholder: '500000' },
        { name: 'rate', label: 'Interest rate (% per year)', type: 'number', min: 0, max: 100, step: 'any', placeholder: '8.5' },
        { name: 't', label: 'Loan length', type: 'number', min: 0, step: 'any', placeholder: '5' },
        { name: 'unit', label: 'Length is in', type: 'select', default: 'years', options: [['years', 'Years'], ['months', 'Months']] },
        currencyField
      ],
      note: 'This is an estimate. Banks may add fees, and their rounding can change the result slightly.',
      run: function (v) {
        var P = num(v.p, 'the loan amount', { min: 0 }), R = num(v.rate, 'the interest rate', { min: 0, max: 100 }), T = num(v.t, 'the loan length', { min: 0 });
        var n = Math.round(v.unit === 'years' ? T * 12 : T);
        if (P <= 0) throw new Error('The loan amount must be more than 0.');
        if (n < 1) throw new Error('The loan length must be at least 1 month.');
        if (n > 600) throw new Error('The loan length cannot be more than 50 years.');
        var r = R / 1200, emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        return { stats: [['Monthly EMI', money(emi, v.cur)], ['Total interest', money(emi * n - P, v.cur)], ['Total amount paid', money(emi * n, v.cur)], ['Number of payments', n + (n === 1 ? ' month' : ' months')]] };
      }
    },

    /* ===== DEVELOPER ===== */
    {
      id: 'password-generator', name: 'Password Generator', cat: 'dev', icon: '***', popular: true, added: '2026-10-01',
      desc: 'Create a strong random password in one click.',
      intro: 'Create a strong, random password that is hard to guess. The password is made inside your browser using secure random numbers. It is never sent or stored anywhere.',
      steps: ['Choose the password length. 16 or more is a good choice.', 'Tick the kinds of characters you want.', 'Click Generate password.', 'Click Copy and paste it into your password manager or account form.'],
      keywords: ['password', 'random', 'secure', 'strong', 'generator', 'security'],
      action: 'Generate password',
      fields: [
        { name: 'len', label: 'Length (4 to 128)', type: 'number', default: '16', min: 4, max: 128, step: '1' },
        { name: 'up', label: 'Capital letters (A-Z)', type: 'checkbox', default: true },
        { name: 'lo', label: 'Small letters (a-z)', type: 'checkbox', default: true },
        { name: 'nu', label: 'Numbers (0-9)', type: 'checkbox', default: true },
        { name: 'sy', label: 'Symbols (!@#$...)', type: 'checkbox', default: true },
        { name: 'sim', label: 'Skip look-alike characters (0, O, 1, l, I)', type: 'checkbox', default: false }
      ],
      note: 'Use a different password for every account, and store them in a trusted password manager.',
      run: function (v) {
        var len = num(v.len, 'the length', { min: 4, max: 128, int: true });
        var sets = [];
        var strip = function (s) { return v.sim ? s.replace(/[0O1lI]/g, '') : s; };
        if (v.up) sets.push(strip('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
        if (v.lo) sets.push(strip('abcdefghijklmnopqrstuvwxyz'));
        if (v.nu) sets.push(strip('0123456789'));
        if (v.sy) sets.push('!@#$%^&*()-_=+[]{};:,.?');
        if (!sets.length) throw new Error('Please tick at least one kind of character.');
        var pool = sets.join(''), out = [];
        sets.forEach(function (s) { out.push(s.charAt(randInt(s.length))); });
        while (out.length < len) out.push(pool.charAt(randInt(pool.length)));
        out = out.slice(0, len);
        for (var i = out.length - 1; i > 0; i--) { var j = randInt(i + 1), t = out[i]; out[i] = out[j]; out[j] = t; }
        var bits = len * Math.log2(pool.length);
        var strength = bits < 40 ? 'Weak' : bits < 60 ? 'Fair' : bits < 80 ? 'Good' : 'Strong';
        return { text: out.join(''), textLabel: 'Your password', stats: [['Strength', strength], ['Estimated strength in bits', fmt(bits, 0)]] };
      }
    },

    {
      id: 'json-formatter', name: 'JSON Formatter and Validator', cat: 'dev', icon: '{ }', featured: true, added: '2026-11-14',
      desc: 'Format, minify and check JSON data.',
      intro: 'Paste JSON to make it easy to read, to shrink it for production, or to check that it is valid. If there is a mistake, the tool tells you what it found.',
      steps: ['Paste your JSON into the box.', 'Choose Format (easy to read), Minify (smallest size) or Validate only.', 'Click Run.', 'Copy or download the result.'],
      keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty print', 'validator'],
      action: 'Run', download: 'data.json',
      fields: [
        { name: 'text', label: 'Your JSON', type: 'textarea', rows: 9, placeholder: '{"name":"Asha","age":30}' },
        { name: 'mode', label: 'What do you want to do?', type: 'select', default: 'format', options: [['format', 'Format (easy to read)'], ['minify', 'Minify (smallest size)'], ['validate', 'Validate only']] },
        { name: 'indent', label: 'Indentation (for Format)', type: 'select', default: '2', options: [['2', '2 spaces'], ['4', '4 spaces'], ['tab', 'Tab']] }
      ],
      run: function (v) {
        if (!v.text.trim()) throw new Error('Please paste some JSON first.');
        var data;
        try { data = JSON.parse(v.text); } catch (e) { throw new Error('This is not valid JSON. ' + e.message); }
        var kind = Array.isArray(data) ? 'Array' : data === null ? 'null' : typeof data === 'object' ? 'Object' : typeof data;
        if (v.mode === 'validate') return { stats: [['Result', 'Valid JSON'], ['Top-level type', kind]] };
        var out = v.mode === 'minify' ? JSON.stringify(data) : JSON.stringify(data, null, v.indent === 'tab' ? '\t' : Number(v.indent));
        return { text: out, textLabel: v.mode === 'minify' ? 'Minified JSON' : 'Formatted JSON', stats: [['Result', 'Valid JSON'], ['Characters before', fmt(v.text.length, 0)], ['Characters after', fmt(out.length, 0)]] };
      }
    },

    {
      id: 'base64-encoder-decoder', name: 'Base64 Encoder and Decoder', cat: 'dev', icon: 'B64', added: '2026-11-14',
      desc: 'Convert text to Base64 and back again.',
      intro: 'Base64 is a way to write data using only letters, numbers and a few symbols. It is often used in web addresses, emails and APIs. This tool encodes text to Base64 or decodes Base64 back to text.',
      steps: ['Paste your text or your Base64 code.', 'Choose Encode (text to Base64) or Decode (Base64 to text).', 'Click Convert.', 'Copy the result.'],
      keywords: ['base64', 'encode', 'decode', 'encoder', 'decoder', 'binary'],
      action: 'Convert', download: 'base64-result.txt',
      fields: [
        { name: 'text', label: 'Input', type: 'textarea', rows: 7, placeholder: 'Hello, world!' },
        { name: 'mode', label: 'Direction', type: 'select', default: 'encode', options: [['encode', 'Encode (text to Base64)'], ['decode', 'Decode (Base64 to text)']] }
      ],
      note: 'Base64 is not encryption. Anyone can decode it, so never use it to hide passwords.',
      run: function (v) {
        if (!v.text.trim()) throw new Error('Please enter some text first.');
        if (v.mode === 'encode') {
          var bytes = new TextEncoder().encode(v.text), bin = '';
          for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          return { text: btoa(bin), textLabel: 'Base64 result' };
        }
        var s = v.text.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error('This is not valid Base64. It may contain characters that Base64 does not use.');
        while (s.length % 4) s += '=';
        try {
          var raw = atob(s), arr = new Uint8Array(raw.length);
          for (var k = 0; k < raw.length; k++) arr[k] = raw.charCodeAt(k);
          return { text: new TextDecoder('utf-8', { fatal: true }).decode(arr), textLabel: 'Decoded text' };
        } catch (e) { throw new Error('This Base64 could not be turned into readable text. It may be a file or an image.'); }
      }
    },

    {
      id: 'url-encoder-decoder', name: 'URL Encoder and Decoder', cat: 'dev', icon: '%20', added: '2026-11-14',
      desc: 'Make text safe for web addresses, or decode it.',
      intro: 'Web addresses can only contain certain characters. This tool replaces special characters, such as spaces and symbols, with safe codes like %20. It can also turn those codes back into normal text.',
      steps: ['Paste your text or web address.', 'Choose what you want to do.', 'Click Convert.', 'Copy the result.'],
      keywords: ['url', 'encode', 'decode', 'percent encoding', 'uri', 'query string', 'link'],
      action: 'Convert',
      fields: [
        { name: 'text', label: 'Input', type: 'textarea', rows: 5, placeholder: 'hello world & friends' },
        { name: 'mode', label: 'What do you want to do?', type: 'select', default: 'component', options: [
          ['component', 'Encode a piece of text (for example, a search word)'], ['full', 'Encode a full web address (keeps : / ? & =)'], ['decode', 'Decode (turn %20 codes back into text)']] }
      ],
      run: function (v) {
        if (!v.text.trim()) throw new Error('Please enter some text first.');
        try {
          if (v.mode === 'decode') return { text: decodeURIComponent(v.text), textLabel: 'Decoded text' };
          return { text: v.mode === 'full' ? encodeURI(v.text) : encodeURIComponent(v.text), textLabel: 'Encoded text' };
        } catch (e) { throw new Error('This text could not be converted. If you are decoding, check that every % is followed by two valid characters.'); }
      }
    },

    {
      id: 'uuid-generator', name: 'UUID Generator', cat: 'dev', icon: 'ID', added: '2026-11-14',
      desc: 'Generate random unique IDs (UUID version 4).',
      intro: 'A UUID is a long random ID that is practically guaranteed to be unique. Developers use them as database keys and file names. This tool creates version 4 UUIDs in your browser.',
      steps: ['Enter how many UUIDs you need (1 to 100).', 'Tick the box if you want capital letters.', 'Click Generate.', 'Copy or download the list.'],
      keywords: ['uuid', 'guid', 'unique id', 'random id', 'identifier'],
      action: 'Generate', download: 'uuids.txt',
      fields: [
        { name: 'n', label: 'How many?', type: 'number', default: '5', min: 1, max: 100, step: '1' },
        { name: 'up', label: 'Use capital letters', type: 'checkbox', default: false }
      ],
      run: function (v) {
        var n = num(v.n, 'the amount', { min: 1, max: 100, int: true }), list = [];
        for (var i = 0; i < n; i++) {
          var u;
          if (typeof crypto.randomUUID === 'function') u = crypto.randomUUID();
          else {
            var b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
            var h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
            u = h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
          }
          list.push(v.up ? u.toUpperCase() : u);
        }
        return { text: list.join('\n'), textLabel: 'Your UUIDs' };
      }
    },

    /* ===== UNIT CONVERTERS ===== */
    converter({
      id: 'length-converter', name: 'Length Converter', icon: 'm', popular: false, from: 'km', to: 'mi',
      desc: 'Convert between metres, kilometres, miles, feet and more.',
      intro: 'Convert a length from one unit to another, such as kilometres to miles or feet to centimetres.',
      keywords: ['length', 'distance', 'metre', 'meter', 'mile', 'kilometre', 'feet', 'inch', 'cm'],
      units: [['mm', 'Millimetres (mm)', 0.001], ['cm', 'Centimetres (cm)', 0.01], ['m', 'Metres (m)', 1], ['km', 'Kilometres (km)', 1000],
        ['in', 'Inches (in)', 0.0254], ['ft', 'Feet (ft)', 0.3048], ['yd', 'Yards (yd)', 0.9144], ['mi', 'Miles (mi)', 1609.344]]
    }),
    converter({
      id: 'weight-converter', name: 'Weight Converter', icon: 'kg', from: 'kg', to: 'lb',
      desc: 'Convert between kilograms, pounds, ounces and more.',
      intro: 'Convert a weight from one unit to another, such as kilograms to pounds or ounces to grams.',
      keywords: ['weight', 'mass', 'kilogram', 'pound', 'ounce', 'gram', 'stone', 'tonne'],
      units: [['mg', 'Milligrams (mg)', 0.000001], ['g', 'Grams (g)', 0.001], ['kg', 'Kilograms (kg)', 1], ['t', 'Tonnes (t)', 1000],
        ['oz', 'Ounces (oz)', 0.028349523125], ['lb', 'Pounds (lb)', 0.45359237], ['st', 'Stone (st)', 6.35029318]]
    }),
    {
      id: 'temperature-converter', name: 'Temperature Converter', cat: 'unit', icon: '°C', popular: false, added: '2026-11-14',
      desc: 'Convert between Celsius, Fahrenheit and Kelvin.',
      intro: 'Convert a temperature between Celsius, Fahrenheit and Kelvin. Useful for cooking, travel, weather and science.',
      steps: ['Type the temperature.', 'Choose the unit you start with in "From".', 'Choose the unit you want in "To".', 'Click Convert.'],
      keywords: ['temperature', 'celsius', 'fahrenheit', 'kelvin', 'degrees', 'weather'],
      action: 'Convert',
      fields: [
        { name: 'value', label: 'Temperature', type: 'number', default: '25', step: 'any' },
        { name: 'from', label: 'From', type: 'select', default: 'C', options: [['C', 'Celsius (°C)'], ['F', 'Fahrenheit (°F)'], ['K', 'Kelvin (K)']] },
        { name: 'to', label: 'To', type: 'select', default: 'F', options: [['C', 'Celsius (°C)'], ['F', 'Fahrenheit (°F)'], ['K', 'Kelvin (K)']] }
      ],
      run: function (v) {
        var x = num(v.value, 'a temperature'), c = v.from === 'C' ? x : v.from === 'F' ? (x - 32) * 5 / 9 : x - 273.15;
        if (c < -273.15 - 1e-9) throw new Error('That temperature is below absolute zero, which is not possible.');
        var from = function (u) { return u === 'C' ? c : u === 'F' ? c * 9 / 5 + 32 : c + 273.15; };
        var sym = { C: '°C', F: '°F', K: 'K' }, stats = [['Result', sig(x) + ' ' + sym[v.from] + ' = ' + sig(from(v.to)) + ' ' + sym[v.to]]];
        ['C', 'F', 'K'].forEach(function (u) { if (u !== v.from) stats.push([{ C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' }[u], sig(from(u)) + ' ' + sym[u]]); });
        return { stats: stats };
      }
    },

    /* ===== OTHER ===== */
    {
      id: 'random-number-generator', name: 'Random Number Generator', cat: 'other', icon: '#', added: '2026-11-14',
      desc: 'Pick random whole numbers between any two values.',
      intro: 'Pick one or many random whole numbers between a minimum and a maximum. Use it for games, draws, classroom activities and fair choices. Numbers come from your browser\'s secure random generator.',
      steps: ['Enter the smallest and the largest number.', 'Enter how many numbers you want.', 'Tick "No repeats" if every number must be different.', 'Click Generate.'],
      keywords: ['random', 'number', 'dice', 'lottery', 'draw', 'pick'],
      action: 'Generate', download: 'random-numbers.txt',
      fields: [
        { name: 'min', label: 'Smallest number', type: 'number', default: '1', step: '1' },
        { name: 'max', label: 'Largest number', type: 'number', default: '100', step: '1' },
        { name: 'n', label: 'How many numbers?', type: 'number', default: '1', min: 1, max: 1000, step: '1' },
        { name: 'uniq', label: 'No repeats (every number is different)', type: 'checkbox', default: false }
      ],
      run: function (v) {
        var lo = num(v.min, 'the smallest number', { int: true, min: -1e9, max: 1e9 }), hi = num(v.max, 'the largest number', { int: true, min: -1e9, max: 1e9 }), n = num(v.n, 'how many numbers', { int: true, min: 1, max: 1000 });
        if (lo > hi) throw new Error('The smallest number cannot be bigger than the largest number.');
        var range = hi - lo + 1;
        if (v.uniq && n > range) throw new Error('You asked for ' + n + ' different numbers, but there are only ' + range + ' numbers between ' + lo + ' and ' + hi + '.');
        var out = [], seen = {};
        while (out.length < n) {
          var r = lo + randInt(range);
          if (v.uniq) { if (seen[r]) continue; seen[r] = true; }
          out.push(r);
        }
        return { text: out.join('\n'), textLabel: n === 1 ? 'Your number' : 'Your numbers' };
      }
    }
  ];

  var api = { TOOLS: TOOLS, CATEGORIES: CATEGORIES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.TOOLS = TOOLS; root.CATEGORIES = CATEGORIES; }
})(typeof window !== 'undefined' ? window : globalThis);
