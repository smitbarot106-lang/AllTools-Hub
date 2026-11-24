/* AllTools Hub - written content for every tool page, category page and guide.
   Used only by build.js (never sent to the browser).
   In any text, {{tool-id}} becomes a link to that tool and {{guide:slug}} a link to that guide.
   `check` entries are re-run against the real tool logic by test-site.js, so a worked example
   written here can never drift away from what the tool actually returns. */
'use strict';

const TOOL_CONTENT = {
  'word-counter': {
    about: [
      'The word counter tells you how long a piece of writing is while you type. It reports words, characters with and without spaces, sentences, paragraphs and an estimated reading time, and updates instantly with no button to press.',
      'Length limits are everywhere: a meta description, a social post, a university essay, an application form. Counting the numbers as you write is quicker than pasting the text into a word processor each time. Need to tidy the text afterwards? Try the {{case-converter}} or the {{remove-duplicate-lines}} tool.'
    ],
    formula: [
      'Words = the number of groups of non-space characters separated by spaces, tabs or line breaks.',
      'Reading time = words / 200 words per minute (an average silent reading speed, rounded up to whole minutes once it passes a minute).',
      'Characters are counted as visible symbols, so an emoji counts as one character, not two.'
    ],
    example: { title: 'Worked example', text: 'The text "The quick brown fox jumps over the lazy dog. It was a sunny day!" contains 14 words, 64 characters (51 without spaces) and 2 sentences.' },
    check: { id: 'word-counter', inputs: { text: 'The quick brown fox jumps over the lazy dog. It was a sunny day!' }, label: 'Words', equals: '14' },
    uses: ['Keeping a social media post or meta description under a limit.', 'Checking an essay or assignment against a word target.', 'Estimating how long a speech or blog post will take to read aloud or silently.', 'Counting the length of product descriptions and ad copy.'],
    limits: ['Words are split on spaces, so languages written without spaces (such as Chinese or Japanese) will be counted as very few words. Use the character count instead.', 'The reading time uses a single average speed. Real reading speed varies with the reader and the material.', 'Different programs count hyphenated words and numbers differently, so a result can differ by a few words from another tool.'],
    faqs: [
      ['Does the word counter save my text?', 'No. Counting happens in your browser and the text is never uploaded or stored.'],
      ['How is the reading time worked out?', 'It divides the word count by 200 words per minute, a commonly used average for silent reading.'],
      ['Why does my word processor show a slightly different count?', 'Programs treat dashes, numbers and symbols differently. The difference is normally a handful of words.'],
      ['Are spaces included in the character count?', 'Both numbers are shown: "Characters" includes spaces and "Characters (no spaces)" leaves them out.']
    ]
  },

  'case-converter': {
    about: [
      'The case converter changes the capital letters in your text in one step. Choose UPPERCASE, lowercase, Title Case or Sentence case for writing, or camelCase, PascalCase, snake_case and kebab-case for programming.',
      'It is useful when text arrives in the wrong shape: a heading typed in capitals, a column of names in lowercase, or a phrase that has to become a variable name. If you need a web address instead of a variable, the {{text-to-slug}} tool is a better fit.'
    ],
    formula: [
      'Title Case capitalises the first letter of every word and lowercases the rest.',
      'Sentence case capitalises the first letter after each full stop, question mark or exclamation mark.',
      'camelCase, PascalCase, snake_case and kebab-case first split your text into words (letters and numbers), then join them in the chosen style.'
    ],
    example: { title: 'Worked example', text: 'The text "hello world example" becomes helloWorldExample in camelCase, HelloWorldExample in PascalCase, hello_world_example in snake_case and hello-world-example in kebab-case.' },
    check: { id: 'case-converter', inputs: { text: 'hello world example', mode: 'camel' }, label: null, text: 'helloWorldExample' },
    uses: ['Fixing a heading or caption typed with caps lock on.', 'Turning a phrase into a variable or file name.', 'Making a list of names consistent before importing it.', 'Preparing text for a style guide that requires Title Case or Sentence case.'],
    limits: ['Title Case capitalises every word. It does not skip small words such as "of" or "the", which some style guides leave in lowercase.', 'Programming styles keep only letters and numbers and drop punctuation.', 'Case rules for a few languages (for example Turkish dotted and dotless i) follow your browser\'s default rules.'],
    faqs: [
      ['What is the difference between Title Case and Sentence case?', 'Title Case capitalises each word ("The Quick Brown Fox"). Sentence case capitalises only the first word of each sentence ("The quick brown fox").'],
      ['What is camelCase used for?', 'Programmers use it for variable and function names, because names cannot contain spaces. The first word is lowercase and each later word starts with a capital letter.'],
      ['Is my text sent anywhere?', 'No. The conversion runs in your browser.'],
      ['Can I convert a large document?', 'Yes, but very large text can make the page slow on older phones. Convert it in sections if that happens.']
    ]
  },

  'remove-duplicate-lines': {
    about: [
      'This tool removes repeated lines from a list and keeps the first copy of each one, in the original order. Options let you ignore capital letters, ignore spaces at the start and end of a line, and drop empty lines.',
      'Typical jobs are cleaning an email or keyword list, merging two lists into one, or tidying a log file. After cleaning, you can check how many lines are left with the {{word-counter}}.'
    ],
    formula: ['Each line is compared with the lines already kept. If an identical line has been seen before, it is skipped. With "Ignore capital letters" on, Apple and apple are treated as the same line.'],
    example: { title: 'Worked example', text: 'The list apple, banana, apple, cherry, banana (one per line) becomes apple, banana, cherry. Five lines were pasted, three were kept and two were removed.' },
    check: { id: 'remove-duplicate-lines', inputs: { text: 'apple\nbanana\napple\ncherry\nbanana' }, label: 'Lines removed', equals: '2' },
    uses: ['Cleaning a mailing or keyword list.', 'Merging two lists and removing the overlap.', 'Reducing a log file to its unique entries.', 'Checking how many distinct values a column contains.'],
    limits: ['Only whole lines are compared. Two lines that differ by a single character are both kept.', 'The original order is kept, so the tool does not sort the list.', 'Lines that differ only in inner spacing (for example two spaces versus one) are treated as different.'],
    faqs: [
      ['Which copy of a repeated line is kept?', 'The first one. Later copies are removed.'],
      ['Does it sort my list?', 'No. The order of the lines you pasted is preserved.'],
      ['How do I treat "Apple" and "apple" as the same?', 'Tick "Ignore capital letters" before you run the tool.'],
      ['How many lines can I paste?', 'There is no fixed limit, but very large lists (hundreds of thousands of lines) may be slow in your browser.']
    ]
  },

  'text-to-slug': {
    about: [
      'A slug is the readable last part of a web address, such as the part after the final slash in /blog/my-first-blog-post. This tool converts any title into a clean slug that uses only lowercase letters, numbers and dashes.',
      'Short, descriptive slugs are easier to read, share and remember than long addresses full of codes. Accented letters are simplified (café becomes cafe) and punctuation is removed. To change the capitals in a title first, use the {{case-converter}}.'
    ],
    formula: ['1. Accents are removed. 2. Letters are made lowercase. 3. Every run of characters that is not a letter or number becomes one separator (a dash or an underscore). 4. Separators at the start and end are trimmed.'],
    example: { title: 'Worked example', text: 'The title "10 Tips for Better Sleep!" becomes 10-tips-for-better-sleep.' },
    check: { id: 'text-to-slug', inputs: { text: '10 Tips for Better Sleep!' }, label: null, text: '10-tips-for-better-sleep' },
    uses: ['Creating the address for a blog post or product page.', 'Naming files so they are safe to upload and link to.', 'Building consistent identifiers for a database or content system.'],
    limits: ['Letters from non-Latin alphabets, such as Hindi, Arabic or Chinese, cannot be turned into slug letters and are left out. If nothing is left, the tool shows an error.', 'The tool does not check whether the slug already exists on your site.'],
    faqs: [
      ['Should I use a dash or an underscore?', 'Dashes are the usual choice for web addresses because they separate words clearly. Underscores are common in file names and code.'],
      ['Does the slug affect search rankings?', 'A clear slug helps people understand a link, but it is only one small signal. Do not expect a slug alone to change your ranking.'],
      ['Why was part of my title removed?', 'Only English letters and numbers are kept. Other characters, symbols and non-Latin letters are dropped.'],
      ['Can I change a slug after publishing?', 'You can, but the old address will stop working unless you redirect it to the new one.']
    ]
  },

  'gst-calculator': {
    about: [
      'The GST calculator works out the tax on a price. You can add GST to a price before tax, or enter a total that already includes GST and find the original price and the tax inside it. It also shows the amount split equally into CGST and SGST, as used for in-state sales in India.',
      'The same method works for VAT and sales tax: type the rate that applies to you. For the reasoning behind the numbers, read the guide {{guide:how-gst-is-calculated}}. To work out a discount first, use the {{discount-calculator}}.'
    ],
    formula: [
      'Add GST: GST amount = price x rate / 100, and total = price + GST amount.',
      'Remove GST: price before GST = total / (1 + rate / 100), and GST amount = total - price before GST.',
      'CGST and SGST are each half of the GST amount when both apply.'
    ],
    example: { title: 'Worked examples', text: 'Adding 18% GST to 2,500 gives GST of 450 and a total of 2,950. Going the other way, a total of 1,180 that already includes 18% GST is a price of 1,000 plus GST of 180.' },
    check: { id: 'gst-calculator', inputs: { amount: '2500', rate: '18' }, label: 'Total price', equals: '₹2,950.00' },
    uses: ['Checking the GST on an invoice or quote.', 'Finding the price before tax from a tax-inclusive price.', 'Setting a shelf price that includes tax.', 'Splitting the tax into CGST and SGST for bookkeeping.'],
    limits: ['The tool does not know which rate applies to a product. Check the rate that applies to your item and place.', 'It does not handle IGST rules, cess or input tax credit.', 'Results are rounded to two decimal places for display. Invoices may round each line differently.'],
    faqs: [
      ['How do I remove GST from a price?', 'Divide the total by 1 plus the rate as a decimal. For 18% that is dividing by 1.18. Choose "This amount already includes GST" and the tool does it for you.'],
      ['Can I use this for VAT or sales tax?', 'Yes. The maths is the same for any percentage tax. Enter your own rate.'],
      ['What are CGST and SGST?', 'In India, GST on a sale inside one state is split equally between the central government (CGST) and the state government (SGST).'],
      ['Is this an official tax calculation?', 'No. It is an estimate. Confirm the rate and the rules with the seller, an accountant or the official tax authority.']
    ],
    guide: 'how-gst-is-calculated'
  },

  'percentage-calculator': {
    about: [
      'The percentage calculator answers the three questions people ask most often: what is a percentage of a number, what percentage is one number of another, and by what percentage has a value changed.',
      'Percentages appear in shopping, grades, interest, statistics and tax. If you are working with prices, the {{discount-calculator}} and the {{gst-calculator}} apply the same ideas to money.'
    ],
    formula: [
      'A% of B = A / 100 x B.',
      'A is what percent of B = A / B x 100.',
      'Percent change from A to B = (B - A) / |A| x 100. A positive result is an increase and a negative result is a decrease.'
    ],
    example: { title: 'Worked examples', text: '15% of 240 is 36. The number 45 is 25% of 180. A value that goes from 80 to 100 has increased by 25%.' },
    check: { id: 'percentage-calculator', inputs: { mode: 'change', a: '80', b: '100' }, label: 'Increase', equals: '25%' },
    uses: ['Working out a tip, commission or share of a total.', 'Finding what fraction of a budget or score a number represents.', 'Measuring how much a price, salary or measurement has grown or fallen.'],
    limits: ['A percent change cannot be calculated from a starting value of zero, because the change would be infinite.', 'A rise of 25% followed by a fall of 25% does not return to the start, because each percentage applies to a different base.'],
    faqs: [
      ['How do I calculate a percentage of a number?', 'Divide the percentage by 100 and multiply by the number. For 15% of 240: 15 / 100 x 240 = 36.'],
      ['What is the difference between percent change and percentage points?', 'If a rate moves from 10% to 12%, it rises by 2 percentage points, which is a 20% increase in the rate.'],
      ['Why does a 50% increase then a 50% decrease not cancel out?', 'The decrease is taken from the larger, increased number. 100 up 50% is 150, and 150 down 50% is 75.'],
      ['Can I enter negative numbers?', 'Yes. Negative values are accepted for all three questions, apart from the zero cases described above.']
    ]
  },

  'discount-calculator': {
    about: [
      'The discount calculator shows the sale price after a percentage discount and how much money you save. Enter the original price and the discount, and the final price appears.',
      'It is handy for comparing offers: a larger discount on a higher price is not always the better deal, so check the final amount. If the shop also charges tax, add it afterwards with the {{gst-calculator}}. For other percentage questions, use the {{percentage-calculator}}.'
    ],
    formula: ['Savings = original price x discount / 100.', 'Final price = original price - savings.'],
    example: { title: 'Worked example', text: 'A jacket costs 2,500 and has a 25% discount. You save 625, so the final price is 1,875.' },
    check: { id: 'discount-calculator', inputs: { price: '2500', pct: '25' }, label: 'Final price', equals: '₹1,875.00' },
    uses: ['Checking the real price during a sale.', 'Comparing two offers with different discounts.', 'Working out how much a coupon takes off a bill.'],
    limits: ['The tool applies one discount. For "extra 10% off" on top of another discount, run it twice: the second discount applies to the already reduced price.', 'It does not add tax or delivery charges.'],
    faqs: [
      ['How do I find the price after a discount?', 'Subtract the discount from the original price: price x (1 - discount / 100). For 25% off, multiply by 0.75.'],
      ['How do two discounts combine?', 'They multiply, they do not add. 20% off followed by 10% off is a total of 28% off, not 30%.'],
      ['Does the calculator include tax?', 'No. Use the GST calculator to add tax to the final price.'],
      ['Which currency symbol does it use?', 'Choose the symbol you want from the list. It is only a label and does not convert money.']
    ]
  },

  'bmi-calculator': {
    about: [
      'Body Mass Index (BMI) compares a person\'s weight with their height. Enter your weight and height in metric or imperial units to see your BMI, the standard adult category and the weight range that corresponds to a BMI of 18.5 to 24.9 for your height.',
      'BMI is a quick screening number, not a diagnosis. It does not measure body fat, muscle, age, or where weight is carried. If you only need to switch between kilograms and pounds, use the {{weight-converter}}.'
    ],
    formula: [
      'BMI = weight in kg / (height in metres x height in metres).',
      'Imperial inputs are converted first: 1 pound = 0.45359237 kg and 1 inch = 2.54 cm.',
      'Adult categories used here: below 18.5 underweight, 18.5 to 24.9 healthy weight, 25 to 29.9 overweight, 30 and above obesity.'
    ],
    example: { title: 'Worked example', text: 'A person weighing 70 kg who is 175 cm tall has a BMI of 70 / (1.75 x 1.75) = 22.9, which is in the healthy weight range.' },
    check: { id: 'bmi-calculator', inputs: { w: '70', h: '175' }, label: 'Your BMI', equals: '22.9' },
    uses: ['A quick health screening check for adults.', 'Finding the weight range that matches a healthy BMI for your height.', 'Tracking BMI alongside advice from a doctor or dietitian.'],
    limits: ['Intended for adults aged 18 and over. Children and teenagers use age-specific growth charts.', 'BMI does not distinguish muscle from fat, so athletes can score high without excess body fat.', 'Healthy ranges can differ for some ethnic groups, and during pregnancy BMI is not a useful guide.', 'It is not medical advice. Speak to a doctor about your health.'],
    faqs: [
      ['What is a healthy BMI?', 'For most adults, a BMI from 18.5 to 24.9 is classed as a healthy weight.'],
      ['Is BMI accurate?', 'It is a simple screening tool. It is useful across large groups but can be misleading for an individual, because it ignores muscle, bone and fat distribution.'],
      ['Can I use pounds and inches?', 'Yes. Choose "Imperial" and enter your weight in pounds and your height in inches.'],
      ['Why does the tool reject some values?', 'Weights outside about 2 to 650 kg and heights outside about 50 to 275 cm are treated as typing mistakes.']
    ]
  },

  'age-calculator': {
    about: [
      'The age calculator finds an exact age in years, months and days from a date of birth. It also shows the total number of days lived and how long it is until the next birthday. You can check the age on today\'s date or on any other date.',
      'Use it for forms that ask for an exact age, for planning a birthday, or for checking eligibility on a particular day. The same date arithmetic is handy for dates in the past or future, for example the age on a school admission cut-off date.'
    ],
    formula: [
      'The calculator subtracts the date of birth from the chosen date, borrowing days from the previous month when needed, then borrowing months from the year.',
      'Total days = the number of calendar days between the two dates. Days to the next birthday = the days until the next occurrence of the same month and day.'
    ],
    example: { title: 'Worked example', text: 'Someone born on 15 May 1990 is 36 years, 6 months and 9 days old on 24 November 2026, and has lived 13,342 days.' },
    check: { id: 'age-calculator', inputs: { dob: '1990-05-15', asof: '2026-11-24' }, label: 'Age', equals: '36 years, 6 months, 9 days' },
    uses: ['Filling in forms that need an exact age.', 'Checking age limits for an exam, job or competition on a specific date.', 'Finding how many days remain until a birthday.', 'Calculating the age a person will be on a future date.'],
    limits: ['A date of birth on 29 February is treated as 28 February in non-leap years for the "months and days" step.', 'The calculation uses calendar dates only and ignores time of day and time zones.', 'Dates must be entered in the date picker\'s format for your browser.'],
    faqs: [
      ['Can I find age on a past or future date?', 'Yes. Fill in "Age on this date" and the calculator will use it instead of today.'],
      ['Does it handle leap years?', 'Yes. The number of days in each month is taken from the real calendar.'],
      ['Why does the next-birthday result say "Today"?', 'Because the date you chose falls on the day and month of the birthday.'],
      ['Is my date of birth stored?', 'No. The calculation happens in your browser and nothing is uploaded.']
    ]
  },

  'emi-calculator': {
    about: [
      'EMI stands for Equated Monthly Instalment: the fixed payment you make each month to repay a loan with interest. This calculator shows your monthly EMI, the total interest you will pay and the total cost of the loan from the loan amount, the yearly interest rate and the loan length.',
      'Try different lengths to see the trade-off: a longer loan lowers the monthly payment but increases the total interest. Read the guide {{guide:how-emi-is-calculated}} for the full explanation. If you are comparing prices before borrowing, the {{discount-calculator}} and {{percentage-calculator}} may help.'
    ],
    formula: [
      'EMI = P x r x (1 + r)^n / ((1 + r)^n - 1)',
      'P = loan amount, r = monthly interest rate (yearly rate / 12 / 100), n = number of monthly payments.',
      'Total paid = EMI x n, and total interest = total paid - P. If the rate is 0%, EMI = P / n.'
    ],
    example: { title: 'Worked example', text: 'A loan of 500,000 at 8.5% a year for 5 years (60 months) has an EMI of about 10,258.27. Over 60 payments you pay 615,495.94 in total, of which 115,495.94 is interest.' },
    check: { id: 'emi-calculator', inputs: { p: '500000', rate: '8.5', t: '5' }, label: 'Monthly EMI', equals: '₹10,258.27' },
    uses: ['Comparing a home, car or personal loan before applying.', 'Deciding how long a loan should run.', 'Checking whether a monthly payment fits your budget.', 'Seeing how much interest a loan adds to its price.'],
    limits: ['It assumes a fixed rate and equal monthly payments. Floating-rate loans, part-prepayments and moratorium periods change the real figures.', 'Processing fees, insurance and taxes are not included.', 'Banks may round the EMI differently, so the figure can differ by a small amount.', 'Loan length is limited to 50 years.'],
    faqs: [
      ['What does EMI mean?', 'Equated Monthly Instalment: a fixed monthly payment that covers both interest and part of the loan amount.'],
      ['Does a longer tenure save money?', 'It lowers each payment but raises the total interest, because you owe money for longer.'],
      ['Is the interest calculated monthly or yearly?', 'The yearly rate is divided by 12 and applied each month to the balance that is still owed (the reducing balance method).'],
      ['Why does my bank show a different EMI?', 'Banks may round the figures, add fees, or use a different compounding or day-count rule. Treat this as an estimate and confirm with your lender.']
    ],
    guide: 'how-emi-is-calculated'
  },

  'password-generator': {
    about: [
      'The password generator creates a random password from the character types you choose, using your browser\'s secure random number generator. Nothing is sent to a server and nothing is saved, so the password exists only on your screen until you copy it.',
      'Length matters more than complexity: every extra character multiplies the number of possible passwords. Read the guide {{guide:how-to-create-a-strong-password}} for practical advice. If you need a unique identifier instead of a password, see the {{uuid-generator}}.'
    ],
    formula: [
      'Strength in bits = length x log2(number of possible characters).',
      'With all four character types the pool is 85 characters, so each character adds about 6.4 bits. A 16-character password is about 102 bits.',
      'The tool labels the result Weak below 40 bits, Fair below 60, Good below 80 and Strong from 80 upwards. These labels are a guide, not a guarantee.'
    ],
    example: { title: 'Worked example', text: 'A password that uses a pool of 26 lowercase letters has about 4.7 bits per character, so 8 characters give about 38 bits (Weak). Using all four character types and 16 characters gives about 102 bits (Strong).' },
    uses: ['Creating a new password for an account.', 'Generating a master password or a Wi-Fi key.', 'Making temporary passwords for testing.'],
    limits: ['A random password is only as safe as the place you keep it. Use a trusted password manager.', 'Some websites reject certain symbols or limit the length. Untick symbols or shorten the length if a site refuses the result.', 'The strength estimate assumes the password is random and used on one site only.'],
    faqs: [
      ['Is the generated password sent to your server?', 'No. It is created in your browser and is never transmitted or stored.'],
      ['How long should a password be?', 'Sixteen characters or more is a good choice for important accounts, with a different password for every account.'],
      ['Why skip look-alike characters?', 'Characters like 0, O, 1, l and I are easy to confuse when you have to type a password by hand.'],
      ['Is a generated password better than one I make up?', 'Usually yes. People tend to pick predictable patterns, while a generator picks characters at random.']
    ],
    guide: 'how-to-create-a-strong-password'
  },

  'json-formatter': {
    about: [
      'The JSON formatter and validator makes JSON easy to read, shrinks it for production and checks that it is valid. Paste your data, choose Format, Minify or Validate only, and copy or download the result. If the JSON is broken, the tool shows the error message from the browser\'s JSON parser.',
      'JSON is the most common format for sending data between websites and apps, but a single missing comma or quote breaks it. Working with encoded data as well? See the {{base64-encoder-decoder}} and {{url-encoder-decoder}}.'
    ],
    formula: [
      'Format: the data is parsed and written back with 2 spaces, 4 spaces or a tab for each level of nesting.',
      'Minify: the data is parsed and written back with no extra spaces or line breaks.',
      'Validate: the data is parsed and the tool reports whether it is valid and what its top-level type is (object, array, string, number, boolean or null).'
    ],
    example: { title: 'Worked example', text: 'The input {"name":"Asha","age":30} is formatted with each property on its own indented line. The formatted version is 33 characters long, compared with 24 characters before.' },
    check: { id: 'json-formatter', inputs: { text: '{"name":"Asha","age":30}' }, label: 'Characters after', equals: '33' },
    uses: ['Reading an API response that arrives on one line.', 'Finding a syntax error in a configuration file.', 'Minifying JSON to reduce its size.', 'Checking data before you send it to a service.'],
    limits: ['Only strict JSON is accepted. Comments, trailing commas and single-quoted strings are not valid JSON and will be rejected.', 'Very large files (many megabytes) can be slow in a browser tab.', 'Large numbers beyond the range JavaScript can represent exactly may lose precision when the data is re-written.'],
    faqs: [
      ['Why does my JSON say it is invalid?', 'Common causes are a trailing comma, single quotes instead of double quotes, unquoted property names, or a missing bracket. The error message points to the position of the problem.'],
      ['Is my JSON uploaded?', 'No. It is parsed in your browser and never leaves your device.'],
      ['What is the difference between format and minify?', 'Format adds indentation for people to read. Minify removes all unnecessary spaces to make the data smaller.'],
      ['Does formatting change my data?', 'No, apart from whitespace. The order of properties is kept.']
    ]
  },

  'base64-encoder-decoder': {
    about: [
      'Base64 is a way of writing data using only letters, numbers and a few symbols, so that it can travel safely through systems built for plain text, such as emails, web addresses and some APIs. This tool encodes text to Base64 or decodes Base64 back into text, with full support for accented letters and emoji (UTF-8).',
      'Base64 is an encoding, not encryption: anyone can decode it. If your data is part of a web address, the {{url-encoder-decoder}} may be what you need. To check structured data, try the {{json-formatter}}.'
    ],
    formula: [
      'Base64 takes the data 3 bytes (24 bits) at a time and writes it as four characters from a 64-character alphabet (A-Z, a-z, 0-9, + and /).',
      'If the data does not divide into groups of three, one or two = characters are added as padding.',
      'Encoded text is about one third larger than the original.'
    ],
    example: { title: 'Worked example', text: 'The text "Hello, world!" encodes to SGVsbG8sIHdvcmxkIQ==. Decoding that string returns the original text.' },
    check: { id: 'base64-encoder-decoder', inputs: { text: 'Hello, world!' }, label: null, text: 'SGVsbG8sIHdvcmxkIQ==' },
    uses: ['Reading the contents of a Base64 string from an API or email header.', 'Preparing text to be placed in a URL, JSON field or configuration value.', 'Debugging tokens and data URLs.'],
    limits: ['Base64 is not encryption and offers no protection. Never use it to hide passwords or secrets.', 'Only text is supported. Decoding a Base64 file or image will fail with a message, because the result is not readable text.', 'The tool accepts URL-safe Base64 (using - and _), but does not add line breaks.'],
    faqs: [
      ['Is Base64 secure?', 'No. It only changes how data is written. Anyone can reverse it, so it provides no confidentiality.'],
      ['Why does decoding give an error?', 'The input may contain characters Base64 does not use, or the decoded data may be a file or an image rather than text.'],
      ['Why does the output end with = signs?', 'They are padding that fills the last group of characters.'],
      ['Does it support emoji and non-English letters?', 'Yes. Text is converted with UTF-8 before encoding.']
    ]
  },

  'url-encoder-decoder': {
    about: [
      'Web addresses can only contain a limited set of characters. Spaces, ampersands and many symbols have to be written as percent codes such as %20. This tool encodes text so it is safe to place in a web address, and decodes percent codes back into readable text.',
      'Pick "Encode a piece of text" for a single value such as a search term, "Encode a full web address" to keep characters like : / ? & = in place, or "Decode" to reverse the process. Working with API data? The {{json-formatter}} and {{base64-encoder-decoder}} may also help.'
    ],
    formula: [
      'Encoding a piece of text (encodeURIComponent) converts every character except letters, numbers and - _ . ! ~ * \' ( ) into %XX codes, where XX is the character\'s UTF-8 value in hexadecimal.',
      'Encoding a full address (encodeURI) leaves the address punctuation characters, such as : / ? # & =, unchanged.'
    ],
    example: { title: 'Worked example', text: 'The text "hello world & friends" encodes to hello%20world%20%26%20friends. The space becomes %20 and the ampersand becomes %26.' },
    check: { id: 'url-encoder-decoder', inputs: { text: 'hello world & friends' }, label: null, text: 'hello%20world%20%26%20friends' },
    uses: ['Building a query string by hand.', 'Reading an encoded link that is full of % codes.', 'Making a link that contains a space or an ampersand work correctly.'],
    limits: ['Encoding a complete address as a single piece of text will also encode its slashes and colons, which breaks the link. Use the full-address option for that.', 'Decoding fails if a % is not followed by two valid hexadecimal characters.'],
    faqs: [
      ['What does %20 mean?', 'It is the encoded form of a space character.'],
      ['What is the difference between the two encode options?', 'The piece-of-text option encodes everything that is not a letter or number, which is correct for a value inside a query string. The full-address option leaves the address punctuation alone.'],
      ['Why does decoding fail?', 'Usually because a % sign is not followed by two valid characters, for example a plain "100%" typed in the text.'],
      ['Is anything sent to a server?', 'No. The conversion runs in your browser.']
    ]
  },

  'uuid-generator': {
    about: [
      'A UUID (Universally Unique Identifier) is a 128-bit ID written as 36 characters, such as 123e4567-e89b-42d3-a456-426614174000. Version 4 UUIDs are generated from random numbers, so the chance of two being the same is extremely small, which makes them useful as database keys, file names and tracking IDs without a central counter.',
      'This tool makes up to 100 UUIDs at a time using your browser\'s secure random generator. Need a password rather than an ID? Use the {{password-generator}}. For a plain random number, try the {{random-number-generator}}.'
    ],
    formula: [
      'A version 4 UUID has 122 random bits. The other 6 bits are fixed to mark the version (the "4" at the start of the third group) and the variant (the first character of the fourth group is 8, 9, a or b).',
      'The format is 8-4-4-4-12 hexadecimal digits separated by dashes.'
    ],
    uses: ['Creating primary keys for database records.', 'Naming uploaded files so they never clash.', 'Creating test data.', 'Labelling events, sessions and requests in logs.'],
    limits: ['A UUID is an identifier, not a secret. Do not use it as a password or access token.', 'Version 4 UUIDs are not sortable by time. Other versions exist for that purpose.', 'Uniqueness is statistical, not absolute, though collisions are practically impossible in normal use.'],
    faqs: [
      ['What is a UUID version 4?', 'A UUID made from random numbers. It is the most widely used type.'],
      ['Can two UUIDs be the same?', 'It is theoretically possible but so unlikely that systems treat UUIDs as unique.'],
      ['What is the difference between a UUID and a GUID?', 'GUID is the name Microsoft uses for the same kind of identifier.'],
      ['Are the UUIDs stored anywhere?', 'No. They are created in your browser and disappear when you leave the page.']
    ]
  },

  'length-converter': {
    about: [
      'The length converter changes a distance or measurement from one unit to another: millimetres, centimetres, metres, kilometres, inches, feet, yards and miles. Enter a value, pick the units and you also see the same length in every other unit.',
      'It is useful for travel distances, DIY projects, sports, school work and product sizes. Converting height for health calculations? The {{bmi-calculator}} accepts inches directly. For mass, use the {{weight-converter}}.'
    ],
    formula: [
      'Each unit is defined in metres, and conversions go through metres: result = value x (metres per from-unit) / (metres per to-unit).',
      '1 inch = 0.0254 m, 1 foot = 0.3048 m, 1 yard = 0.9144 m, 1 mile = 1,609.344 m. These are the exact international definitions.'
    ],
    example: { title: 'Worked example', text: '10 kilometres = 10 x 1,000 / 1,609.344 = 6.2137 miles.' },
    check: { id: 'length-converter', inputs: { value: '10', from: 'km', to: 'mi' }, label: 'Result', equals: '10 km = 6.213711922 mi' },
    uses: ['Converting road distances between kilometres and miles.', 'Switching between feet and metres for heights and room sizes.', 'Checking screen, furniture or luggage dimensions in another unit.'],
    limits: ['Results are shown to 10 significant digits, which is more than most uses need.', 'Only common metric and imperial units are included. Nautical miles and astronomical units are not.'],
    faqs: [
      ['How many miles are in a kilometre?', 'One kilometre is about 0.621371 miles.'],
      ['How many centimetres are in an inch?', 'Exactly 2.54 centimetres.'],
      ['Are the conversions exact?', 'The factors are the exact international definitions. Displayed numbers are rounded to 10 significant digits.'],
      ['Can I enter decimals and negative numbers?', 'Yes. Any number is accepted.']
    ]
  },

  'weight-converter': {
    about: [
      'The weight converter changes a mass from one unit to another: milligrams, grams, kilograms, tonnes, ounces, pounds and stone. Enter a value, choose the units, and the same weight is shown in every other unit.',
      'Use it for cooking, shipping, gym weights, travel baggage allowances or body weight. For a health check from weight and height, try the {{bmi-calculator}}. To convert distance instead, use the {{length-converter}}.'
    ],
    formula: [
      'Each unit is defined in kilograms, and conversions go through kilograms: result = value x (kg per from-unit) / (kg per to-unit).',
      '1 pound = 0.45359237 kg exactly, 1 ounce = 0.028349523125 kg, and 1 stone = 6.35029318 kg (14 pounds).'
    ],
    example: { title: 'Worked example', text: '70 kilograms = 70 / 0.45359237 = about 154.32 pounds.' },
    check: { id: 'weight-converter', inputs: { value: '70', from: 'kg', to: 'lb' }, label: 'Result', equals: '70 kg = 154.3235835 lb' },
    uses: ['Converting recipe quantities between grams and ounces.', 'Checking baggage and parcel weight limits.', 'Converting body weight between kilograms, pounds and stone.'],
    limits: ['This tool converts mass. It does not convert volume (such as cups to grams), because that depends on the ingredient.', 'Results are shown to 10 significant digits.'],
    faqs: [
      ['How many pounds are in a kilogram?', 'One kilogram is about 2.20462 pounds.'],
      ['How many pounds are in a stone?', 'One stone is 14 pounds.'],
      ['Is a tonne the same as a ton?', 'A tonne (metric ton) is 1,000 kg. The US ton is 2,000 pounds, which is not the same and is not included here.'],
      ['Can I convert cups to grams?', 'No. That needs the density of the ingredient. This tool only converts units of weight.']
    ]
  },

  'temperature-converter': {
    about: [
      'The temperature converter changes a temperature between Celsius, Fahrenheit and Kelvin. It also rejects values below absolute zero, which cannot exist.',
      'Celsius is used in most of the world for weather and cooking, Fahrenheit is common in the United States, and Kelvin is the scientific scale. For other conversions, see the {{length-converter}} and {{weight-converter}}.'
    ],
    formula: [
      'Fahrenheit = Celsius x 9 / 5 + 32',
      'Celsius = (Fahrenheit - 32) x 5 / 9',
      'Kelvin = Celsius + 273.15'
    ],
    example: { title: 'Worked examples', text: 'Water boils at 100 °C, which is 212 °F and 373.15 K. Normal human body temperature of 98.6 °F is 37 °C.' },
    check: { id: 'temperature-converter', inputs: { value: '100', from: 'C', to: 'F' }, label: 'Result', equals: '100 °C = 212 °F' },
    uses: ['Reading an oven temperature from a recipe written in another unit.', 'Understanding a weather forecast when travelling.', 'Science and homework problems that use Kelvin.'],
    limits: ['Temperatures below absolute zero (-273.15 °C, -459.67 °F, 0 K) are rejected.', 'Results are shown to 10 significant digits, so tiny floating-point differences may appear in rare cases.'],
    faqs: [
      ['How do I convert Celsius to Fahrenheit?', 'Multiply by 9, divide by 5, then add 32.'],
      ['What is absolute zero?', 'The lowest possible temperature: 0 K, which is -273.15 °C or -459.67 °F.'],
      ['At what temperature are Celsius and Fahrenheit equal?', 'At -40, both scales show the same number.'],
      ['Why is Kelvin written without a degree sign?', 'Kelvin is an absolute scale, so the unit is written simply as K.']
    ]
  },

  'random-number-generator': {
    about: [
      'The random number generator picks one or many whole numbers between a minimum and a maximum. You can ask for numbers that never repeat, which is useful for draws and for choosing winners without picking anyone twice.',
      'Numbers come from your browser\'s secure random generator (crypto.getRandomValues), and the code removes the small bias that a simple modulo would introduce, so every number in the range has an equal chance. For random IDs instead of numbers, see the {{uuid-generator}}.'
    ],
    formula: [
      'Each number is chosen uniformly from min to max, so the range contains max - min + 1 possible values.',
      'With "No repeats" ticked, numbers that have already been picked are skipped, so you cannot ask for more numbers than the range contains.'
    ],
    uses: ['Picking a winner for a giveaway or classroom draw.', 'Rolling dice for a board game (1 to 6).', 'Choosing a random order or sample.', 'Generating test data.'],
    limits: ['Only whole numbers are generated. Decimals are not supported.', 'The range is limited to -1,000,000,000 to 1,000,000,000 and up to 1,000 numbers at a time.', 'Do not use the tool for regulated lotteries or gambling.'],
    faqs: [
      ['Is the generator really random?', 'It uses your browser\'s cryptographically secure random source, which is suitable for draws and games.'],
      ['How do I draw several different winners?', 'Set the range to the number of entries, ask for the number of winners and tick "No repeats".'],
      ['Can I pick a number between 1 and 6 like a die?', 'Yes. Set the smallest number to 1, the largest to 6, and how many numbers to 1.'],
      ['Why does it say there are not enough numbers?', 'With "No repeats" on, you cannot ask for more numbers than the range contains.']
    ]
  }
};

const CATEGORY_CONTENT = {
  text: {
    slug: 'text-tools', title: 'Free Online Text Tools',
    desc: 'Free online text tools: word counter, case converter, duplicate line remover and slug generator. They run in your browser, so your text stays private.',
    intro: ['Text tools help you measure, clean and reshape writing quickly. Count words against a limit, fix capital letters, remove repeated lines from a list or turn a title into a web-friendly slug.', 'Everything runs in your browser, so the text you paste is not uploaded.']
  },
  calc: {
    slug: 'calculators', title: 'Free Online Calculators',
    desc: 'Free online calculators for GST, percentages, discounts, BMI, age and loan EMI. Clear formulas, worked examples and no sign-up.',
    intro: ['These calculators cover everyday money, health and date questions. Each page shows the formula it uses and a worked example, so you can check the result and understand it.', 'Results are estimates for information only and not financial, tax or medical advice.']
  },
  dev: {
    slug: 'developer-tools', title: 'Free Online Developer Tools',
    desc: 'Free developer tools: JSON formatter and validator, Base64 and URL encoder/decoder, UUID and password generators. Private and browser-based.',
    intro: ['Small developer utilities for the jobs that come up every day: formatting and validating JSON, encoding and decoding Base64 and URLs, and generating UUIDs and passwords.', 'All processing happens in your browser. Your data is not sent to our servers.']
  },
  unit: {
    slug: 'unit-converters', title: 'Free Online Unit Converters',
    desc: 'Free unit converters for length, weight and temperature. Exact conversion factors and every result shown at once.',
    intro: ['Convert between metric and imperial units for length, weight and temperature. Every conversion shows the same value in all of the other units, so you can pick the one you need.', 'Conversion factors are the exact international definitions.']
  }
};

const GUIDES = [
  {
    slug: 'how-gst-is-calculated',
    title: 'How GST Is Calculated: Formulas and Worked Examples',
    h1: 'How GST is calculated',
    desc: 'Learn how to add GST to a price, remove GST from a total and split it into CGST and SGST, with formulas and worked examples.',
    updated: '2026-11-24',
    tools: ['gst-calculator', 'discount-calculator', 'percentage-calculator'],
    sections: [
      { h: 'What GST is', p: ['GST (Goods and Services Tax) is a tax added to the price of goods and services. Many countries use a similar tax under another name, such as VAT or sales tax. The calculation is the same: a percentage of the price is added to the price.', 'The rate depends on the country and on the type of product or service, and rates can change. Always check the current rate with the seller, a tax professional or the official tax authority.'] },
      { h: 'Adding GST to a price', p: ['If the price does not include tax, multiply it by the rate and add the result.'], formula: ['GST amount = price x rate / 100', 'Total = price + GST amount'], example: 'Example: a price of 2,500 with 18% GST. GST = 2,500 x 18 / 100 = 450, so the total is 2,950.' },
      { h: 'Removing GST from a total', p: ['If the total already includes GST, you cannot simply subtract the rate from the total. The tax was calculated on the price before tax, so you divide instead.'], formula: ['Price before GST = total / (1 + rate / 100)', 'GST amount = total - price before GST'], example: 'Example: a total of 1,180 that includes 18% GST. Price before GST = 1,180 / 1.18 = 1,000, so the GST is 180. Subtracting 18% of 1,180 would give 967.60, which is wrong.' },
      { h: 'CGST and SGST', p: ['In India, GST on a sale within one state is split equally between the central government (CGST) and the state government (SGST). An 18% GST is therefore 9% CGST plus 9% SGST. For a sale between states, IGST is charged instead, at the full rate.'] },
      { h: 'Common mistakes', list: ['Subtracting the percentage from a tax-inclusive total instead of dividing.', 'Using the wrong rate for the product.', 'Forgetting that a discount is applied before tax, so the tax is charged on the reduced price.', 'Rounding each step too early and ending up a few cents away from the invoice.'] }
    ],
    faqs: [
      ['Is GST added before or after a discount?', 'Normally the discount reduces the price first, and GST is charged on the discounted price. Check the invoice, because exceptions exist.'],
      ['Can I use the same method for VAT?', 'Yes. Replace the GST rate with your VAT rate.']
    ]
  },
  {
    slug: 'how-emi-is-calculated',
    title: 'How EMI Is Calculated: Formula, Example and Tips',
    h1: 'How EMI is calculated',
    desc: 'Understand the EMI formula, see a worked loan example and learn how amount, rate and tenure change what you pay.',
    updated: '2026-11-24',
    tools: ['emi-calculator', 'percentage-calculator'],
    sections: [
      { h: 'What EMI means', p: ['EMI is the Equated Monthly Instalment: one fixed payment you make every month until a loan is repaid. Each payment covers the interest owed for that month and part of the original loan amount. Early payments are mostly interest, and later payments are mostly principal.'] },
      { h: 'The EMI formula', p: ['For a loan with a fixed interest rate and equal monthly payments, the formula is:'], formula: ['EMI = P x r x (1 + r)^n / ((1 + r)^n - 1)', 'P = loan amount; r = monthly rate = yearly rate / 12 / 100; n = number of months'], example: 'Total paid = EMI x n. Total interest = total paid - P. If the interest rate is 0%, EMI is simply P / n.' },
      { h: 'A worked example', p: ['Take a loan of 1,000,000 at 9% a year for 10 years. The monthly rate is 9 / 12 / 100 = 0.0075 and the number of payments is 120.'], example: 'The EMI works out to about 12,667.58. Over 120 months you pay 1,520,109.29 in total, so the interest is about 520,109.29. Use the EMI calculator to check any figures against your own loan.' },
      { h: 'How amount, rate and tenure change the EMI', list: ['A larger loan raises the EMI in proportion to the amount.', 'A higher interest rate raises both the EMI and the total interest.', 'A longer tenure lowers the EMI but increases the total interest, because the balance stays outstanding for longer.', 'Making a part-prepayment early in the loan usually saves more interest than one made later.'] },
      { h: 'What the formula leaves out', p: ['The formula covers interest and principal only. Processing fees, insurance, taxes and changes to a floating interest rate are not included, so a lender\'s statement can differ. Ask for the full repayment schedule before you sign.'] }
    ],
    faqs: [
      ['Is EMI the same every month?', 'For a fixed-rate loan, yes. For a floating-rate loan, the EMI or the tenure can change when the rate changes.'],
      ['Which is better, a shorter or longer tenure?', 'A shorter tenure costs less in interest but needs a higher monthly payment. Choose the shortest tenure you can comfortably afford.']
    ]
  },
  {
    slug: 'how-to-create-a-strong-password',
    title: 'How to Create a Strong Password: A Practical Guide',
    h1: 'How to create a strong password',
    desc: 'Practical advice on password length, randomness, password managers and two-step verification, with the maths behind password strength.',
    updated: '2026-11-24',
    tools: ['password-generator', 'uuid-generator'],
    sections: [
      { h: 'Length beats complexity', p: ['The strength of a random password depends on how many possible passwords there are. That number grows with every character you add. Each extra character multiplies the possibilities by the size of the character set, so a longer password is much harder to guess than a shorter one with more symbols.'], formula: ['Strength in bits = length x log2(number of possible characters)'], example: 'Example: 8 lowercase letters give 8 x log2(26) = about 38 bits. 16 characters drawn from a pool of 85 (letters, numbers and symbols) give 16 x log2(85) = about 102 bits.' },
      { h: 'Random is better than clever', p: ['People tend to choose predictable passwords: names, dates, keyboard patterns, or a word with a number on the end. Attackers try these first. A password produced by a random generator has no pattern to guess.'] },
      { h: 'Use a different password for every account', p: ['If one website is breached, attackers try the same email and password on other sites. A unique password limits the damage to a single account.'] },
      { h: 'Store passwords in a password manager', p: ['Nobody can remember dozens of long random passwords. A reputable password manager stores them for you, so you only need to remember one strong master password. Do not keep passwords in a plain text file or in your email.'] },
      { h: 'Turn on two-step verification', p: ['Two-step verification asks for a second proof, such as a code from an authenticator app, in addition to your password. It protects the account even if the password is stolen. Prefer an authenticator app or a security key over text messages where the service offers a choice.'] },
      { h: 'Quick checklist', list: ['Use 16 or more characters for important accounts.', 'Let a generator choose the characters.', 'Never reuse a password.', 'Use a password manager.', 'Enable two-step verification.', 'Change a password immediately if you think it has been exposed.'] }
    ],
    faqs: [
      ['Is it safe to use an online password generator?', 'It is safe when the password is created in your browser and not sent anywhere, as this tool does. Never use a generator that asks you to submit your own password.'],
      ['How often should I change passwords?', 'There is no need to change a strong, unique password on a schedule. Change it if the service reports a breach or you suspect it has been exposed.']
    ]
  }
];

module.exports = { TOOL_CONTENT, CATEGORY_CONTENT, GUIDES };
