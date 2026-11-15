/* AllTools Hub - logic tests. Run:  node test.js
   Tests normal, empty, invalid and edge inputs for every tool. */
'use strict';
if (!globalThis.crypto) globalThis.crypto = require('crypto').webcrypto;
const { TOOLS } = require('./tools.js');
let pass = 0, fail = 0;
const T = id => TOOLS.find(t => t.id === id);
const defaults = t => Object.fromEntries(t.fields.map(f => [f.name, f.type === 'checkbox' ? !!f.default : (f.default != null ? f.default : '')]));
const call = (id, over) => { const t = T(id); return t.run(Object.assign(defaults(t), over)); };
const stat = (r, label) => (r.stats.find(s => s[0] === label) || [])[1];
function ok(name, cond, info) { if (cond) pass++; else { fail++; console.log('FAIL: ' + name + (info !== undefined ? '  -> ' + JSON.stringify(info) : '')); } }
function throws(name, fn, part) { try { fn(); ok(name, false, 'did not throw'); } catch (e) { ok(name, !part || e.message.includes(part), e.message); } }
function eq(name, got, want) { ok(name, got === want, got); }

// structure: every tool has everything the page needs
TOOLS.forEach(t => {
  ok(t.id + ' has fields', t.fields && t.fields.length > 0);
  ok(t.id + ' has steps', t.steps && t.steps.length >= 3);
  ok(t.id + ' has intro/desc/icon', t.intro && t.desc && t.icon);
  const ids = TOOLS.filter(x => x.id === t.id).length; ok(t.id + ' unique id', ids === 1);
});

// word counter
let r = call('word-counter', { text: 'Hello world. This is 3.14 fine!\n\nNew paragraph' });
eq('wc words', stat(r, 'Words'), '8'); eq('wc sentences', stat(r, 'Sentences'), '3'); eq('wc paragraphs', stat(r, 'Paragraphs'), '2');
r = call('word-counter', { text: '' }); eq('wc empty words', stat(r, 'Words'), '0'); eq('wc empty reading', stat(r, 'Reading time'), '0 sec');
r = call('word-counter', { text: 'a😀b' }); eq('wc emoji chars', stat(r, 'Characters'), '3');
r = call('word-counter', { text: 'a b' }); eq('wc nospace', stat(r, 'Characters (no spaces)'), '2');

// case converter
eq('upper', call('case-converter', { text: 'hello World', mode: 'upper' }).text, 'HELLO WORLD');
eq('lower', call('case-converter', { text: 'Hello WORLD', mode: 'lower' }).text, 'hello world');
eq('title', call('case-converter', { text: "the don't stop-me NOW", mode: 'title' }).text, "The Don't Stop-Me Now");
eq('sentence', call('case-converter', { text: 'hello there. HOW are you? fine', mode: 'sentence' }).text, 'Hello there. How are you? Fine');
eq('camel', call('case-converter', { text: 'my cool_variable name', mode: 'camel' }).text, 'myCoolVariableName');
eq('pascal', call('case-converter', { text: 'my cool name', mode: 'pascal' }).text, 'MyCoolName');
eq('snake', call('case-converter', { text: 'My Cool Name', mode: 'snake' }).text, 'my_cool_name');
eq('kebab', call('case-converter', { text: 'My Cool Name', mode: 'kebab' }).text, 'my-cool-name');
throws('case empty', () => call('case-converter', { text: '  ' }), 'paste some text');
throws('case symbols only', () => call('case-converter', { text: '!!!', mode: 'snake' }), 'No letters');

// remove duplicate lines
r = call('remove-duplicate-lines', { text: 'a\nb\na\nB\n  a  \n\n\nb' });
eq('dedupe default', r.text, 'a\nb\nB\n'); eq('dedupe removed', stat(r, 'Lines removed'), '4');
r = call('remove-duplicate-lines', { text: 'a\nA\nb', ci: true }); eq('dedupe ignore case', r.text, 'a\nb');
r = call('remove-duplicate-lines', { text: 'a\n\n\nb\na', empty: true }); eq('dedupe empty removal', r.text, 'a\nb');
r = call('remove-duplicate-lines', { text: 'a\r\na\r\nb' }); eq('dedupe CRLF', r.text, 'a\nb');
r = call('remove-duplicate-lines', { text: '__proto__\nconstructor\n__proto__' }); eq('dedupe special words', r.text, '__proto__\nconstructor');
throws('dedupe empty', () => call('remove-duplicate-lines', { text: '' }), 'paste a list');

// slug
eq('slug basic', call('text-to-slug', { text: '  My First Blog Post!  ' }).text, 'my-first-blog-post');
eq('slug accents', call('text-to-slug', { text: 'Café Crème & Co.' }).text, 'cafe-creme-co');
eq('slug underscore', call('text-to-slug', { text: 'Hello World 2026', sep: '_' }).text, 'hello_world_2026');
throws('slug empty', () => call('text-to-slug', { text: '' }), 'type a title');
throws('slug hindi', () => call('text-to-slug', { text: 'नमस्ते' }), 'No English');

// GST
r = call('gst-calculator', { amount: '1000', rate: '18' });
eq('gst add net', stat(r, 'Price before GST'), '₹1,000.00'); eq('gst add tax', stat(r, 'GST amount'), '₹180.00'); eq('gst add total', stat(r, 'Total price'), '₹1,180.00'); eq('gst split', stat(r, 'If split equally (CGST + SGST), each'), '₹90.00');
r = call('gst-calculator', { amount: '1180', rate: '18', mode: 'remove', cur: '$' });
eq('gst remove net', stat(r, 'Price before GST'), '$1,000.00'); eq('gst remove tax', stat(r, 'GST amount'), '$180.00'); eq('gst remove total', stat(r, 'Total price'), '$1,180.00');
r = call('gst-calculator', { amount: '0', rate: '0' }); eq('gst zero', stat(r, 'Total price'), '₹0.00');
throws('gst empty', () => call('gst-calculator', { amount: '' }), 'enter an amount');
throws('gst negative', () => call('gst-calculator', { amount: '-5' }), '0 or more');
throws('gst rate high', () => call('gst-calculator', { amount: '5', rate: '150' }), '100 or less');
throws('gst text', () => call('gst-calculator', { amount: 'abc' }), 'must be a number');

// percentage
eq('pct of', call('percentage-calculator', { mode: 'of', a: '20', b: '350' }).stats[0][1], '70');
eq('pct is', call('percentage-calculator', { mode: 'is', a: '50', b: '200' }).stats[0][1], '25%');
r = call('percentage-calculator', { mode: 'change', a: '80', b: '100' }); eq('pct inc', r.stats[0][0], 'Increase'); eq('pct inc val', r.stats[0][1], '25%');
r = call('percentage-calculator', { mode: 'change', a: '100', b: '75' }); eq('pct dec', r.stats[0][0], 'Decrease'); eq('pct dec val', r.stats[0][1], '25%');
r = call('percentage-calculator', { mode: 'of', a: '0.1', b: '3' }); eq('pct float', r.stats[0][1], '0.003');
throws('pct div zero', () => call('percentage-calculator', { mode: 'is', a: '5', b: '0' }), 'cannot be 0');
throws('pct change zero', () => call('percentage-calculator', { mode: 'change', a: '0', b: '5' }), 'cannot be 0');
throws('pct empty', () => call('percentage-calculator', { a: '', b: '5' }), 'number A');

// discount
r = call('discount-calculator', { price: '2500', pct: '25', cur: '$' }); eq('disc save', stat(r, 'You save'), '$625.00'); eq('disc final', stat(r, 'Final price'), '$1,875.00');
eq('disc 100', stat(call('discount-calculator', { price: '50', pct: '100' }), 'Final price'), '₹0.00');
throws('disc over 100', () => call('discount-calculator', { price: '50', pct: '101' }), '100 or less');
throws('disc empty', () => call('discount-calculator', { price: '', pct: '5' }), 'original price');

// BMI
r = call('bmi-calculator', { w: '70', h: '170' }); eq('bmi metric', stat(r, 'Your BMI'), '24.2'); eq('bmi cat', stat(r, 'Category'), 'Healthy weight');
r = call('bmi-calculator', { unit: 'imperial', w: '154', h: '67' }); eq('bmi imperial', stat(r, 'Your BMI'), '24.1');
eq('bmi under', stat(call('bmi-calculator', { w: '45', h: '175' }), 'Category'), 'Underweight');
eq('bmi over', stat(call('bmi-calculator', { w: '85', h: '170' }), 'Category'), 'Overweight');
eq('bmi obese', stat(call('bmi-calculator', { w: '110', h: '170' }), 'Category'), 'Obesity');
throws('bmi height range', () => call('bmi-calculator', { w: '70', h: '17' }), 'height');
throws('bmi weight range', () => call('bmi-calculator', { w: '1', h: '170' }), 'weight');
throws('bmi empty', () => call('bmi-calculator', { w: '', h: '170' }), 'weight');

// age
r = call('age-calculator', { dob: '2000-01-15', asof: '2026-11-14' }); eq('age basic', stat(r, 'Age'), '26 years, 9 months, 30 days');
r = call('age-calculator', { dob: '2000-02-29', asof: '2001-03-01' }); eq('age leap', stat(r, 'Age'), '1 year, 0 months, 1 day');
r = call('age-calculator', { dob: '2000-03-31', asof: '2000-04-30' }); eq('age month end', stat(r, 'Age'), '0 years, 0 months, 30 days');
r = call('age-calculator', { dob: '2000-05-10', asof: '2026-05-10' }); eq('age birthday today', stat(r, 'Next birthday'), 'Today'); eq('age exact', stat(r, 'Age'), '26 years, 0 months, 0 days');
r = call('age-calculator', { dob: '2000-01-01', asof: '2000-01-02' }); r = call('age-calculator', { dob: '2000-01-01', asof: '2000-01-02' }); eq('age 1 day', stat(r, 'Age'), '0 years, 0 months, 1 day');
eq('age total days', stat(r, 'Total days lived'), '1');
r = call('age-calculator', { dob: '1990-12-25', asof: '2026-11-14' }); eq('age next bday', stat(r, 'Next birthday'), 'In 41 days, on a Friday');
ok('age today default', /years/.test(stat(call('age-calculator', { dob: '1990-01-01' }), 'Age')));
throws('age future', () => call('age-calculator', { dob: '2030-01-01', asof: '2026-01-01' }), 'before');
throws('age empty', () => call('age-calculator', { dob: '' }), 'date of birth');
r = call('age-calculator', { dob: '2020-01-31', asof: '2020-03-01' }); eq('age jan31 to mar1 leap', stat(r, 'Age'), '0 years, 1 month, 1 day');
r = call('age-calculator', { dob: '2019-01-31', asof: '2019-03-01' }); eq('age jan31 to mar1 nonleap', stat(r, 'Age'), '0 years, 1 month, 1 day');
r = call('age-calculator', { dob: '2020-08-31', asof: '2020-10-01' }); eq('age aug31 to oct1', stat(r, 'Age'), '0 years, 1 month, 1 day');
r = call('age-calculator', { dob: '2020-05-31', asof: '2020-07-01' }); eq('age may31 to jul1', stat(r, 'Age'), '0 years, 1 month, 1 day');
r = call('age-calculator', { dob: '2020-01-31', asof: '2020-02-29' }); eq('age jan31 to feb29', stat(r, 'Age'), '0 years, 0 months, 29 days');

// EMI
r = call('emi-calculator', { p: '500000', rate: '8.5', t: '5' }); eq('emi value', stat(r, 'Monthly EMI'), '₹10,258.27'); eq('emi n', stat(r, 'Number of payments'), '60 months');
r = call('emi-calculator', { p: '120000', rate: '0', t: '12', unit: 'months' }); eq('emi zero rate', stat(r, 'Monthly EMI'), '₹10,000.00'); eq('emi zero interest', stat(r, 'Total interest'), '₹0.00');
throws('emi zero principal', () => call('emi-calculator', { p: '0', rate: '5', t: '5' }), 'more than 0');
throws('emi tiny tenure', () => call('emi-calculator', { p: '1000', rate: '5', t: '0.01' }), 'at least 1 month');
throws('emi long tenure', () => call('emi-calculator', { p: '1000', rate: '5', t: '60' }), '50 years');
throws('emi empty', () => call('emi-calculator', { p: '1000', rate: '', t: '5' }), 'interest rate');

// password
r = call('password-generator', { len: '24' }); eq('pw length', r.text.length, 24);
ok('pw has all classes', /[A-Z]/.test(r.text) && /[a-z]/.test(r.text) && /[0-9]/.test(r.text) && /[^A-Za-z0-9]/.test(r.text), r.text);
r = call('password-generator', { len: '40', up: false, sy: false, nu: false }); ok('pw lower only', /^[a-z]{40}$/.test(r.text), r.text);
r = call('password-generator', { len: '60', sim: true }); ok('pw skips lookalikes', !/[0O1lI]/.test(r.text), r.text);
r = call('password-generator', { len: '4' }); eq('pw min length', r.text.length, 4);
let many = new Set(); for (let i = 0; i < 200; i++) many.add(call('password-generator', {}).text); ok('pw random', many.size === 200);
eq('pw strong', stat(call('password-generator', { len: '20' }), 'Strength'), 'Strong'); eq('pw weak', stat(call('password-generator', { len: '4', up: false, sy: false, lo: false }), 'Strength'), 'Weak');
throws('pw none ticked', () => call('password-generator', { up: false, lo: false, nu: false, sy: false }), 'at least one');
throws('pw too long', () => call('password-generator', { len: '500' }), '128 or less');
throws('pw too short', () => call('password-generator', { len: '2' }), '4 or more');
throws('pw decimal', () => call('password-generator', { len: '8.5' }), 'whole number');

// JSON
eq('json format', call('json-formatter', { text: '{"a":1,"b":[1,2]}' }).text, '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
eq('json indent4', call('json-formatter', { text: '{"a":1}', indent: '4' }).text, '{\n    "a": 1\n}');
eq('json tab', call('json-formatter', { text: '{"a":1}', indent: 'tab' }).text, '{\n\t"a": 1\n}');
eq('json minify', call('json-formatter', { text: '{ "a" : 1,\n "b": 2 }', mode: 'minify' }).text, '{"a":1,"b":2}');
r = call('json-formatter', { text: '[1,2]', mode: 'validate' }); eq('json validate', stat(r, 'Result'), 'Valid JSON'); eq('json type', stat(r, 'Top-level type'), 'Array'); ok('json validate no text', r.text === undefined);
eq('json primitive', stat(call('json-formatter', { text: 'null', mode: 'validate' }), 'Top-level type'), 'null');
throws('json invalid', () => call('json-formatter', { text: '{a:1}' }), 'not valid JSON');
throws('json trailing comma', () => call('json-formatter', { text: '[1,2,]' }), 'not valid JSON');
throws('json empty', () => call('json-formatter', { text: ' ' }), 'paste some JSON');

// base64
eq('b64 encode', call('base64-encoder-decoder', { text: 'Hello, world!' }).text, 'SGVsbG8sIHdvcmxkIQ==');
eq('b64 decode', call('base64-encoder-decoder', { text: 'SGVsbG8sIHdvcmxkIQ==', mode: 'decode' }).text, 'Hello, world!');
const uni = 'नमस्ते 😀 café'; const enc = call('base64-encoder-decoder', { text: uni }).text; eq('b64 unicode roundtrip', call('base64-encoder-decoder', { text: enc, mode: 'decode' }).text, uni);
eq('b64 no padding', call('base64-encoder-decoder', { text: 'SGVsbG8', mode: 'decode' }).text, 'Hello');
eq('b64 urlsafe', call('base64-encoder-decoder', { text: 'Pz8-Pg', mode: 'decode' }).text, '??>>');
eq('b64 whitespace', call('base64-encoder-decoder', { text: 'SGVs\nbG8=', mode: 'decode' }).text, 'Hello');
throws('b64 invalid chars', () => call('base64-encoder-decoder', { text: 'not base64!', mode: 'decode' }), 'not valid Base64');
throws('b64 not text', () => call('base64-encoder-decoder', { text: '/w==', mode: 'decode' }), 'readable text');
throws('b64 empty', () => call('base64-encoder-decoder', { text: '' }), 'enter some text');

// URL
eq('url component', call('url-encoder-decoder', { text: 'a b&c=d/é' }).text, 'a%20b%26c%3Dd%2F%C3%A9');
eq('url full', call('url-encoder-decoder', { text: 'https://x.com/a b?q=1&r=é', mode: 'full' }).text, 'https://x.com/a%20b?q=1&r=%C3%A9');
eq('url decode', call('url-encoder-decoder', { text: 'a%20b%26c', mode: 'decode' }).text, 'a b&c');
throws('url bad decode', () => call('url-encoder-decoder', { text: '100%', mode: 'decode' }), 'could not be converted');
throws('url empty', () => call('url-encoder-decoder', { text: '' }), 'enter some text');

// UUID
r = call('uuid-generator', { n: '10' }); const ids = r.text.split('\n');
eq('uuid count', ids.length, 10); ok('uuid format v4', ids.every(u => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(u)), ids[0]); ok('uuid unique', new Set(ids).size === 10);
ok('uuid upper', /^[0-9A-F-]{36}$/.test(call('uuid-generator', { n: '1', up: true }).text));
throws('uuid zero', () => call('uuid-generator', { n: '0' }), '1 or more'); throws('uuid too many', () => call('uuid-generator', { n: '101' }), '100 or less'); throws('uuid decimal', () => call('uuid-generator', { n: '2.5' }), 'whole');
const cr = crypto.randomUUID; crypto.randomUUID = undefined;
ok('uuid fallback v4', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(call('uuid-generator', { n: '1' }).text)); crypto.randomUUID = cr;

// converters
eq('km to mi', call('length-converter', { value: '1', from: 'km', to: 'mi' }).stats[0][1], '1 km = 0.6213711922 mi');
eq('ft to cm', call('length-converter', { value: '5', from: 'ft', to: 'cm' }).stats[0][1], '5 ft = 152.4 cm');
eq('m to m', call('length-converter', { value: '7', from: 'm', to: 'm' }).stats[0][1], '7 m = 7 m');
eq('negative length ok', call('length-converter', { value: '-2', from: 'm', to: 'cm' }).stats[0][1], '-2 m = -200 cm');
eq('length lists others', call('length-converter', { value: '1', from: 'm', to: 'cm' }).stats.length, 8);
eq('kg to lb', call('weight-converter', { value: '1', from: 'kg', to: 'lb' }).stats[0][1], '1 kg = 2.204622622 lb');
eq('oz to g', call('weight-converter', { value: '16', from: 'oz', to: 'g' }).stats[0][1], '16 oz = 453.59237 g');
throws('length empty', () => call('length-converter', { value: '' }), 'a value');
eq('c to f', call('temperature-converter', { value: '100', from: 'C', to: 'F' }).stats[0][1], '100 °C = 212 °F');
eq('f to c', call('temperature-converter', { value: '32', from: 'F', to: 'C' }).stats[0][1], '32 °F = 0 °C');
eq('c to k', call('temperature-converter', { value: '0', from: 'C', to: 'K' }).stats[0][1], '0 °C = 273.15 K');
eq('k to f', call('temperature-converter', { value: '0', from: 'K', to: 'F' }).stats[0][1], '0 K = -459.67 °F');
eq('minus 40', call('temperature-converter', { value: '-40', from: 'C', to: 'F' }).stats[0][1], '-40 °C = -40 °F');
throws('below zero K', () => call('temperature-converter', { value: '-1', from: 'K', to: 'C' }), 'absolute zero');
throws('below zero C', () => call('temperature-converter', { value: '-300', from: 'C', to: 'F' }), 'absolute zero');

// random numbers
r = call('random-number-generator', { min: '5', max: '5' }); eq('rng same', r.text, '5');
r = call('random-number-generator', { min: '1', max: '6', n: '1000' }); ok('rng range', r.text.split('\n').every(x => +x >= 1 && +x <= 6)); ok('rng covers all', new Set(r.text.split('\n')).size === 6);
r = call('random-number-generator', { min: '-3', max: '3', n: '7', uniq: true }); eq('rng unique all', new Set(r.text.split('\n')).size, 7);
r = call('random-number-generator', { min: '1', max: '100', n: '50', uniq: true }); eq('rng unique 50', new Set(r.text.split('\n')).size, 50);
throws('rng min>max', () => call('random-number-generator', { min: '10', max: '1' }), 'cannot be bigger');
throws('rng too many unique', () => call('random-number-generator', { min: '1', max: '3', n: '4', uniq: true }), 'only 3');
throws('rng decimal', () => call('random-number-generator', { min: '1.5', max: '3' }), 'whole');
throws('rng empty', () => call('random-number-generator', { min: '' }), 'smallest');
throws('rng count', () => call('random-number-generator', { n: '5000' }), '1000 or less');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
