import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';
import fs from 'fs';
import MetaData from './metaData.model';
import User from '../auth/user.model';

const ADOBE_CATEGORIES = ["Animals", "Buildings and Architecture", "Business", "Drinks", "The Environment", "States of Mind", "Food", "Graphic Resources", "Hobbies and Leisure", "Industry", "Landscapes", "Lifestyle", "People", "Plants and Flowers", "Culture and Religion", "Science", "Social Issues", "Sports", "Technology", "Transport", "Travel"];
const SHUTTERSTOCK_CATEGORIES = ["Abstract", "Animals/Wildlife", "Arts", "Backgrounds/Textures", "Beauty/Fashion", "Buildings/Landmarks", "Business/Finance", "Celebrities", "Education", "Food and drink", "Healthcare/Medical", "Holidays", "Industrial", "Interiors", "Miscellaneous", "Nature", "Objects", "Parks/Outdoor", "People", "Religion", "Science", "Signs/Symbols", "Sports/Recreation", "Technology", "Transportation", "Vintage"];

const smartTrim = (text: string, maxLength: number) => {
  if (!text) return text;
  if (text.length <= maxLength) return text;
  let trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace > 0) {
    trimmed = trimmed.substring(0, lastSpace).trim();
  }
  // Remove dangling commas, hyphens, or common prepositions/conjunctions at the end
  trimmed = trimmed.replace(/(,|\s+and|\s+for|\s+with|\s+the|\s+a|\s+of|\s+in|\s+to|\s+or|\s+\-)$/i, '').trim();
  return trimmed;
};

const getTargetLengthRule = (length: number, isShutterstock: boolean) => {
  const minLength = isShutterstock ? 50 : Math.max(20, length - 40);
  return `between ${minLength} and ${length} characters. Do NOT exceed ${length} characters.`;
};

const generatePrompt = (options: any, isRetry: boolean = false) => {
  const {
    platform = 'general',
    titleLength = 157,
    descriptionLength = 200,
    keywordCount = 41,
    negativeTitleWords = '',
    negativeKeywords = ''
  } = options;

  let negativeInstructions = '';
  if (negativeTitleWords) {
    negativeInstructions += `\nCRITICAL: Do NOT include these words in the title/description: ${negativeTitleWords}.`;
  }
  if (negativeKeywords) {
    negativeInstructions += `\nCRITICAL: Do NOT include these words in the keywords: ${negativeKeywords}.`;
  }

  const retryInstruction = isRetry ? `\nCRITICAL WARNING: Your previous attempt was TOO LONG. You MUST make the text strictly under ${titleLength} characters this time!\n` : '';

  if (platform === 'both') {
    return `You are an expert metadata and search optimization specialist for both Adobe Stock and Shutterstock.

Analyze the provided asset carefully and generate accurate, commercially useful metadata for both platforms.

The asset may be:
- JPEG image
- Transparent PNG
- AI vector
- EPS vector
- SVG vector
- illustration
- icon
- isolated object
- graphic design
- 3D render

Your goal is NOT to generate as many keywords as possible.

Your goal is to generate the most accurate and searchable metadata based ONLY on what is actually visible or strongly supported by the asset.

IMPORTANT ACCURACY RULE:
Never invent or assume:
- location
- profession
- brand
- company
- celebrity
- organization
- event
- ethnicity
- nationality
- age
- emotion
- occupation
- industry
- usage
- concept

unless the visual content clearly supports it.

==================================================
STEP 1 — UNDERSTAND THE ASSET
==================================================

Internally identify:

1. Asset type:
   photo / transparent PNG / vector / illustration / icon / 3D render / graphic / pattern / background

2. Primary subject

3. Secondary subjects

4. Main action, if any

5. Important objects

6. Visual characteristics:
   - colors
   - shape
   - style
   - composition
   - orientation
   - background
   - transparency/isolated appearance

7. Environment or setting, only if visible

8. Strongly supported concepts

9. Potential commercial search intent, only when visually supported

Do NOT output this analysis.
Use it internally to generate the metadata.

==================================================
TITLE & DESCRIPTION RULES
==================================================

Generate ONE concise title for Adobe Stock and ONE detailed description for Shutterstock.

Requirements:

1. The Adobe Stock title MUST be ${getTargetLengthRule(titleLength, false)}${retryInstruction}
2. The Shutterstock description MUST be ${getTargetLengthRule(descriptionLength, true)}
3. Put the primary subject near the beginning.
4. Describe the most visually important elements.
5. Use natural buyer-friendly language.
6. Use specific words instead of generic words.
7. Do not write the title/description as a keyword list.
8. Do not keyword stuff.
9. Do not repeat unnecessary words.
10. Do not use promotional words such as:
   amazing, beautiful, best, perfect, stunning, awesome.
11. Do not include:
   brands, trademarks, company names, artist names,
   celebrity names, fictional character names.
12. Do not mention:
   AI, stock photo, stock image, metadata, generated image.
13. For vectors and illustrations, describe the actual illustrated content.
14. For transparent PNGs, describe the isolated subject rather than inventing a physical location.

The title and description must accurately represent what a buyer can see.

==================================================
KEYWORD RULES
==================================================

Generate ${keywordCount} unique keywords.

Maximum allowed keywords: 49.

Every keyword must be relevant to the asset.

Rank keywords from MOST IMPORTANT to LEAST IMPORTANT.

The FIRST 10 keywords are the highest priority.

KEYWORD PRIORITY:

Tier 1 — Primary search terms
- main subject
- main action
- strongest subject + action combinations

Tier 2 — Specific visual elements
- important objects
- distinctive characteristics
- specific subject types
- colors/shapes when useful

Tier 3 — Setting and composition
- environment
- isolated
- transparent background
- indoors/outdoors
- portrait/landscape
- relevant viewpoint

Only use these when clearly supported by the asset.

Tier 4 — Concepts
- business
- communication
- teamwork
- technology
- education
- healthcare
etc.

Only use concepts that are clearly supported by the visual content.

Tier 5 — Commercially useful terms
Use only relevant buyer-oriented terms supported by the asset.

==================================================
KEYWORD QUALITY RULES
==================================================

1. The first 10 keywords must contain the strongest search terms.

2. Important words from the title should appear naturally within the top 10 keywords.

3. Prefer specific keywords over generic keywords.

Example:

BAD:
technology

BETTER:
communication technology

BAD:
worker

BETTER:
construction worker

4. Do not generate keyword variations only to increase quantity.

Avoid unnecessary combinations such as:

phone
telephone
telephone phone
phone telephone
calling phone
phone calling

when they provide little additional search value.

5. Remove exact duplicates.

6. Remove near-duplicate keywords.

7. Remove irrelevant keywords.

8. Do not use unrelated trending keywords.

9. Do not use brands or trademarks.

10. Do not use unsupported locations.

11. Do not use unsupported professions.

12. Do not use unsupported concepts.

13. Do not use misleading keywords.

14. Do not add keywords simply because they are commercially popular.

ACCURACY IS MORE IMPORTANT THAN KEYWORD COUNT.

==================================================
SPECIAL RULES FOR VECTOR / AI / EPS / SVG
==================================================

If the asset is a vector, AI, EPS, SVG or vector-style illustration:

- Focus on illustrated subjects and objects.
- Describe the actual graphic content.
- Identify illustration style when useful.
- Identify isolated composition when visible.
- Do not use photography-related keywords unless visually appropriate.
- Do not assume the illustrated people are real people.
- Do not invent a physical location.
- Do not invent a profession unless the visual design clearly communicates it.
- Do not use "photo", "photography", "photograph" unless the asset is actually photographic.
- Do not use "real person" or similar wording.

==================================================
SPECIAL RULES FOR TRANSPARENT PNG
==================================================

If the asset has a transparent or isolated background:

- Focus on the isolated subject.
- "isolated" and "transparent background" may be used when visually supported.
- Do not invent an environment.
- Do not describe the asset as being inside an office, studio, outdoor location, etc. unless visible.

==================================================
SPECIAL RULES FOR ICONS / SYMBOLS
==================================================

If the asset is an icon or symbol:

Focus on:

- function
- symbol meaning
- visible object
- graphic style
- color
- interface/use concept when clearly supported

Example:

phone call icon
telephone symbol
calling
communication icon

Do not add unrelated concepts such as:
business
office
customer service
telecommunication company

unless visually supported.

==================================================
FINAL SEO CHECK
==================================================

Before returning the final result:

1. Verify every keyword against the asset.
2. Remove irrelevant keywords.
3. Remove duplicates.
4. Remove near duplicates.
5. Move the strongest keywords into positions 1–10.
6. Make sure important title concepts appear in the top 10 keywords.
7. Make sure the title and description are natural and concise.
8. Make sure the title is under ${titleLength} characters.
9. Make sure exactly ${keywordCount} keywords are returned.
10. Make sure every keyword is unique.
11. Make sure exactly ONE Adobe category and ONE Shutterstock category are selected.

==================================================
CATEGORY
==================================================

Select EXACTLY ONE category for Adobe from this list:
${ADOBE_CATEGORIES.join(', ')}

Select EXACTLY ONE category for Shutterstock from this list:
${SHUTTERSTOCK_CATEGORIES.join(', ')}

Never create, modify, or invent a category.
${negativeInstructions}

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.
No explanation.
No comments.

{
  "title": "string",
  "description": "string",
  "adobeCategory": "string",
  "shutterstockCategory": "string",
  "keywords": ["string"]
}`;
  } else if (platform === 'adobe') {
    return `You are an expert Adobe Stock metadata and search optimization specialist.

Analyze the provided asset carefully and generate accurate, commercially useful metadata for Adobe Stock.

The asset may be:
- JPEG image
- Transparent PNG
- AI vector
- EPS vector
- SVG vector
- illustration
- icon
- isolated object
- graphic design
- 3D render

Your goal is NOT to generate as many keywords as possible.

Your goal is to generate the most accurate and searchable metadata based ONLY on what is actually visible or strongly supported by the asset.

IMPORTANT ACCURACY RULE:
Never invent or assume:
- location
- profession
- brand
- company
- celebrity
- organization
- event
- ethnicity
- nationality
- age
- emotion
- occupation
- industry
- usage
- concept

unless the visual content clearly supports it.

==================================================
STEP 1 — UNDERSTAND THE ASSET
==================================================

Internally identify:

1. Asset type:
   photo / transparent PNG / vector / illustration / icon / 3D render / graphic / pattern / background

2. Primary subject

3. Secondary subjects

4. Main action, if any

5. Important objects

6. Visual characteristics:
   - colors
   - shape
   - style
   - composition
   - orientation
   - background
   - transparency/isolated appearance

7. Environment or setting, only if visible

8. Strongly supported concepts

9. Potential commercial search intent, only when visually supported

Do NOT output this analysis.
Use it internally to generate the metadata.

==================================================
TITLE RULES
==================================================

Generate ONE concise, factual and descriptive title.

Requirements:

1. The title MUST be ${getTargetLengthRule(titleLength, false)}${retryInstruction}
2. Put the primary subject near the beginning.
3. Describe the most visually important elements.
4. Use natural buyer-friendly language.
5. Use specific words instead of generic words.
6. Do not write the title as a keyword list.
7. Do not keyword stuff.
8. Do not repeat unnecessary words.
9. Do not use promotional words such as:
   amazing, beautiful, best, perfect, stunning, awesome.
10. Do not include:
   brands, trademarks, company names, artist names,
   celebrity names, fictional character names.
11. Do not mention:
   AI, stock photo, stock image, metadata, generated image.
12. For vectors and illustrations, describe the actual illustrated content.
13. For transparent PNGs, describe the isolated subject rather than inventing a physical location.

The title must accurately represent what a buyer can see.

==================================================
KEYWORD RULES
==================================================

Generate ${keywordCount} unique keywords.

Maximum allowed keywords: 49.

Every keyword must be relevant to the asset.

Rank keywords from MOST IMPORTANT to LEAST IMPORTANT.

The FIRST 10 keywords are the highest priority.

KEYWORD PRIORITY:

Tier 1 — Primary search terms
- main subject
- main action
- strongest subject + action combinations

Tier 2 — Specific visual elements
- important objects
- distinctive characteristics
- specific subject types
- colors/shapes when useful

Tier 3 — Setting and composition
- environment
- isolated
- transparent background
- indoors/outdoors
- portrait/landscape
- relevant viewpoint

Only use these when clearly supported by the asset.

Tier 4 — Concepts
- business
- communication
- teamwork
- technology
- education
- healthcare
etc.

Only use concepts that are clearly supported by the visual content.

Tier 5 — Commercially useful terms
Use only relevant buyer-oriented terms supported by the asset.

==================================================
KEYWORD QUALITY RULES
==================================================

1. The first 10 keywords must contain the strongest search terms.

2. Important words from the title should appear naturally within the top 10 keywords.

3. Prefer specific keywords over generic keywords.

Example:

BAD:
technology

BETTER:
communication technology

BAD:
worker

BETTER:
construction worker

4. Do not generate keyword variations only to increase quantity.

Avoid unnecessary combinations such as:

phone
telephone
telephone phone
phone telephone
calling phone
phone calling

when they provide little additional search value.

5. Remove exact duplicates.

6. Remove near-duplicate keywords.

7. Remove irrelevant keywords.

8. Do not use unrelated trending keywords.

9. Do not use brands or trademarks.

10. Do not use unsupported locations.

11. Do not use unsupported professions.

12. Do not use unsupported concepts.

13. Do not use misleading keywords.

14. Do not add keywords simply because they are commercially popular.

ACCURACY IS MORE IMPORTANT THAN KEYWORD COUNT.

==================================================
SPECIAL RULES FOR VECTOR / AI / EPS / SVG
==================================================

If the asset is a vector, AI, EPS, SVG or vector-style illustration:

- Focus on illustrated subjects and objects.
- Describe the actual graphic content.
- Identify illustration style when useful.
- Identify isolated composition when visible.
- Do not use photography-related keywords unless visually appropriate.
- Do not assume the illustrated people are real people.
- Do not invent a physical location.
- Do not invent a profession unless the visual design clearly communicates it.
- Do not use "photo", "photography", "photograph" unless the asset is actually photographic.
- Do not use "real person" or similar wording.

==================================================
SPECIAL RULES FOR TRANSPARENT PNG
==================================================

If the asset has a transparent or isolated background:

- Focus on the isolated subject.
- "isolated" and "transparent background" may be used when visually supported.
- Do not invent an environment.
- Do not describe the asset as being inside an office, studio, outdoor location, etc. unless visible.

==================================================
SPECIAL RULES FOR ICONS / SYMBOLS
==================================================

If the asset is an icon or symbol:

Focus on:

- function
- symbol meaning
- visible object
- graphic style
- color
- interface/use concept when clearly supported

Example:

phone call icon
telephone symbol
calling
communication icon

Do not add unrelated concepts such as:
business
office
customer service
telecommunication company

unless visually supported.

==================================================
FINAL SEO CHECK
==================================================

Before returning the final result:

1. Verify every keyword against the asset.
2. Remove irrelevant keywords.
3. Remove duplicates.
4. Remove near duplicates.
5. Move the strongest keywords into positions 1–10.
6. Make sure important title concepts appear in the top 10 keywords.
7. Make sure the title is natural and concise.
8. Make sure the title is under ${titleLength} characters.
9. Make sure exactly ${keywordCount} keywords are returned.
10. Make sure every keyword is unique.
11. Make sure exactly ONE Adobe category is selected.

==================================================
CATEGORY
==================================================

Select EXACTLY ONE category from:

${ADOBE_CATEGORIES.join(', ')}

Never create, modify, or invent a category.
${negativeInstructions}

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.
No explanation.
No comments.

{
  "title": "string",
  "category": "string",
  "keywords": ["string"]
}`;
  } else if (platform === 'shutterstock') {
    return `You are an expert Shutterstock metadata and search optimization specialist.

Analyze the provided asset carefully and generate accurate, commercially useful metadata for Shutterstock.

The asset may be:
- JPEG image
- Transparent PNG
- AI vector
- EPS vector
- SVG vector
- illustration
- icon
- isolated object
- graphic design
- 3D render

Your goal is NOT to generate as many keywords as possible.

Your goal is to generate the most accurate and searchable metadata based ONLY on what is actually visible or strongly supported by the asset.

IMPORTANT ACCURACY RULE:
Never invent or assume:
- location
- profession
- brand
- company
- celebrity
- organization
- event
- ethnicity
- nationality
- age
- emotion
- occupation
- industry
- usage
- concept

unless the visual content clearly supports it.

==================================================
STEP 1 — UNDERSTAND THE ASSET
==================================================

Internally identify:

1. Asset type:
   photo / transparent PNG / vector / illustration / icon / 3D render / graphic / pattern / background

2. Primary subject

3. Secondary subjects

4. Main action, if any

5. Important objects

6. Visual characteristics:
   - colors
   - shape
   - style
   - composition
   - orientation
   - background
   - transparency/isolated appearance

7. Environment or setting, only if visible

8. Strongly supported concepts

9. Potential commercial search intent, only when visually supported

Do NOT output this analysis.
Use it internally to generate the metadata.

==================================================
DESCRIPTION RULES
==================================================

Generate ONE concise, factual and detailed description.

Requirements:

1. The description MUST be ${getTargetLengthRule(titleLength, true)}${retryInstruction}
2. Put the primary subject near the beginning.
3. Describe the most visually important elements.
4. Use natural buyer-friendly language.
5. Use specific words instead of generic words.
6. Do not write the description as a keyword list.
7. Do not keyword stuff.
8. Do not repeat unnecessary words.
9. Do not use promotional words such as:
   amazing, beautiful, best, perfect, stunning, awesome.
10. Do not include:
   brands, trademarks, company names, artist names,
   celebrity names, fictional character names.
11. Do not mention:
   AI, stock photo, stock image, metadata, generated image.
12. For vectors and illustrations, describe the actual illustrated content.
13. For transparent PNGs, describe the isolated subject rather than inventing a physical location.
14. Description must contain at least 5 words.

The description must accurately represent what a buyer can see.

==================================================
KEYWORD RULES
==================================================

Generate ${keywordCount} unique keywords.

Maximum allowed keywords: 49.

Every keyword must be relevant to the asset.

Rank keywords from MOST IMPORTANT to LEAST IMPORTANT.

The FIRST 10 keywords are the highest priority.

KEYWORD PRIORITY:

Tier 1 — Primary search terms
- main subject
- main action
- strongest subject + action combinations

Tier 2 — Specific visual elements
- important objects
- distinctive characteristics
- specific subject types
- colors/shapes when useful

Tier 3 — Setting and composition
- environment
- isolated
- transparent background
- indoors/outdoors
- portrait/landscape
- relevant viewpoint

Only use these when clearly supported by the asset.

Tier 4 — Concepts
- business
- communication
- teamwork
- technology
- education
- healthcare
etc.

Only use concepts that are clearly supported by the visual content.

Tier 5 — Commercially useful terms
Use only relevant buyer-oriented terms supported by the asset.

==================================================
KEYWORD QUALITY RULES
==================================================

1. The first 10 keywords must contain the strongest search terms.

2. Important words from the title should appear naturally within the top 10 keywords.

3. Prefer specific keywords over generic keywords.

Example:

BAD:
technology

BETTER:
communication technology

BAD:
worker

BETTER:
construction worker

4. Do not generate keyword variations only to increase quantity.

Avoid unnecessary combinations such as:

phone
telephone
telephone phone
phone telephone
calling phone
phone calling

when they provide little additional search value.

5. Remove exact duplicates.

6. Remove near-duplicate keywords.

7. Remove irrelevant keywords.

8. Do not use unrelated trending keywords.

9. Do not use brands or trademarks.

10. Do not use unsupported locations.

11. Do not use unsupported professions.

12. Do not use unsupported concepts.

13. Do not use misleading keywords.

14. Do not add keywords simply because they are commercially popular.

ACCURACY IS MORE IMPORTANT THAN KEYWORD COUNT.

==================================================
SPECIAL RULES FOR VECTOR / AI / EPS / SVG
==================================================

If the asset is a vector, AI, EPS, SVG or vector-style illustration:

- Focus on illustrated subjects and objects.
- Describe the actual graphic content.
- Identify illustration style when useful.
- Identify isolated composition when visible.
- Do not use photography-related keywords unless visually appropriate.
- Do not assume the illustrated people are real people.
- Do not invent a physical location.
- Do not invent a profession unless the visual design clearly communicates it.
- Do not use "photo", "photography", "photograph" unless the asset is actually photographic.
- Do not use "real person" or similar wording.

==================================================
SPECIAL RULES FOR TRANSPARENT PNG
==================================================

If the asset has a transparent or isolated background:

- Focus on the isolated subject.
- "isolated" and "transparent background" may be used when visually supported.
- Do not invent an environment.
- Do not describe the asset as being inside an office, studio, outdoor location, etc. unless visible.

==================================================
SPECIAL RULES FOR ICONS / SYMBOLS
==================================================

If the asset is an icon or symbol:

Focus on:

- function
- symbol meaning
- visible object
- graphic style
- color
- interface/use concept when clearly supported

Example:

phone call icon
telephone symbol
calling
communication icon

Do not add unrelated concepts such as:
business
office
customer service
telecommunication company

unless visually supported.

==================================================
FINAL SEO CHECK
==================================================

Before returning the final result:

1. Verify every keyword against the asset.
2. Remove irrelevant keywords.
3. Remove duplicates.
4. Remove near duplicates.
5. Move the strongest keywords into positions 1–10.
6. Make sure important title concepts appear in the top 10 keywords.
7. Make sure the description is natural and concise.
8. Make sure the description is under ${titleLength} characters.
9. Make sure exactly ${keywordCount} keywords are returned.
10. Make sure every keyword is unique.
11. Make sure exactly ONE Shutterstock category is selected.

==================================================
CATEGORY
==================================================

Select EXACTLY ONE category from:

${SHUTTERSTOCK_CATEGORIES.join(', ')}

Never create, modify, or invent a category.
${negativeInstructions}

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.
No explanation.
No comments.

{
  "description": "string",
  "category": "string",
  "keywords": ["string"]
}`;
  }

  return `You are an expert metadata and search optimization specialist.

Analyze the provided asset carefully and generate accurate, commercially useful metadata.

The asset may be:
- JPEG image
- Transparent PNG
- AI vector
- EPS vector
- SVG vector
- illustration
- icon
- isolated object
- graphic design
- 3D render

Your goal is NOT to generate as many keywords as possible.

Your goal is to generate the most accurate and searchable metadata based ONLY on what is actually visible or strongly supported by the asset.

IMPORTANT ACCURACY RULE:
Never invent or assume:
- location
- profession
- brand
- company
- celebrity
- organization
- event
- ethnicity
- nationality
- age
- emotion
- occupation
- industry
- usage
- concept

unless the visual content clearly supports it.

==================================================
STEP 1 — UNDERSTAND THE ASSET
==================================================

Internally identify:

1. Asset type:
   photo / transparent PNG / vector / illustration / icon / 3D render / graphic / pattern / background

2. Primary subject

3. Secondary subjects

4. Main action, if any

5. Important objects

6. Visual characteristics:
   - colors
   - shape
   - style
   - composition
   - orientation
   - background
   - transparency/isolated appearance

7. Environment or setting, only if visible

8. Strongly supported concepts

9. Potential commercial search intent, only when visually supported

Do NOT output this analysis.
Use it internally to generate the metadata.

==================================================
TITLE RULES
==================================================

Generate ONE concise, factual and descriptive title.

Requirements:

1. The title MUST be ${getTargetLengthRule(titleLength, false)}${retryInstruction}
2. Put the primary subject near the beginning.
3. Describe the most visually important elements.
4. Use natural buyer-friendly language.
5. Use specific words instead of generic words.
6. Do not write the title as a keyword list.
7. Do not keyword stuff.
8. Do not repeat unnecessary words.
9. Do not use promotional words such as:
   amazing, beautiful, best, perfect, stunning, awesome.
10. Do not include:
   brands, trademarks, company names, artist names,
   celebrity names, fictional character names.
11. Do not mention:
   AI, stock photo, stock image, metadata, generated image.
12. For vectors and illustrations, describe the actual illustrated content.
13. For transparent PNGs, describe the isolated subject rather than inventing a physical location.

The title must accurately represent what a buyer can see.

==================================================
KEYWORD RULES
==================================================

Generate ${keywordCount} unique keywords.

Maximum allowed keywords: 49.

Every keyword must be relevant to the asset.

Rank keywords from MOST IMPORTANT to LEAST IMPORTANT.

The FIRST 10 keywords are the highest priority.

KEYWORD PRIORITY:

Tier 1 — Primary search terms
- main subject
- main action
- strongest subject + action combinations

Tier 2 — Specific visual elements
- important objects
- distinctive characteristics
- specific subject types
- colors/shapes when useful

Tier 3 — Setting and composition
- environment
- isolated
- transparent background
- indoors/outdoors
- portrait/landscape
- relevant viewpoint

Only use these when clearly supported by the asset.

Tier 4 — Concepts
- business
- communication
- teamwork
- technology
- education
- healthcare
etc.

Only use concepts that are clearly supported by the visual content.

Tier 5 — Commercially useful terms
Use only relevant buyer-oriented terms supported by the asset.

==================================================
KEYWORD QUALITY RULES
==================================================

1. The first 10 keywords must contain the strongest search terms.

2. Important words from the title should appear naturally within the top 10 keywords.

3. Prefer specific keywords over generic keywords.

Example:

BAD:
technology

BETTER:
communication technology

BAD:
worker

BETTER:
construction worker

4. Do not generate keyword variations only to increase quantity.

Avoid unnecessary combinations such as:

phone
telephone
telephone phone
phone telephone
calling phone
phone calling

when they provide little additional search value.

5. Remove exact duplicates.

6. Remove near-duplicate keywords.

7. Remove irrelevant keywords.

8. Do not use unrelated trending keywords.

9. Do not use brands or trademarks.

10. Do not use unsupported locations.

11. Do not use unsupported professions.

12. Do not use unsupported concepts.

13. Do not use misleading keywords.

14. Do not add keywords simply because they are commercially popular.

ACCURACY IS MORE IMPORTANT THAN KEYWORD COUNT.

==================================================
SPECIAL RULES FOR VECTOR / AI / EPS / SVG
==================================================

If the asset is a vector, AI, EPS, SVG or vector-style illustration:

- Focus on illustrated subjects and objects.
- Describe the actual graphic content.
- Identify illustration style when useful.
- Identify isolated composition when visible.
- Do not use photography-related keywords unless visually appropriate.
- Do not assume the illustrated people are real people.
- Do not invent a physical location.
- Do not invent a profession unless the visual design clearly communicates it.
- Do not use "photo", "photography", "photograph" unless the asset is actually photographic.
- Do not use "real person" or similar wording.

==================================================
SPECIAL RULES FOR TRANSPARENT PNG
==================================================

If the asset has a transparent or isolated background:

- Focus on the isolated subject.
- "isolated" and "transparent background" may be used when visually supported.
- Do not invent an environment.
- Do not describe the asset as being inside an office, studio, outdoor location, etc. unless visible.

==================================================
SPECIAL RULES FOR ICONS / SYMBOLS
==================================================

If the asset is an icon or symbol:

Focus on:

- function
- symbol meaning
- visible object
- graphic style
- color
- interface/use concept when clearly supported

Example:

phone call icon
telephone symbol
calling
communication icon

Do not add unrelated concepts such as:
business
office
customer service
telecommunication company

unless visually supported.

==================================================
FINAL SEO CHECK
==================================================

Before returning the final result:

1. Verify every keyword against the asset.
2. Remove irrelevant keywords.
3. Remove duplicates.
4. Remove near duplicates.
5. Move the strongest keywords into positions 1–10.
6. Make sure important title concepts appear in the top 10 keywords.
7. Make sure the title is natural and concise.
8. Make sure the title is under ${titleLength} characters.
9. Make sure exactly ${keywordCount} keywords are returned.
10. Make sure every keyword is unique.


==================================================
CATEGORY
==================================================

Select a single, highly relevant category word. Do not invent obscure categories.
${negativeInstructions}

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.
No explanation.
No comments.

{
  "title": "string",
  "category": "string",
  "keywords": ["string"]
}`;
};

const applyPrefixSuffix = (text: string, prefix: string, suffix: string) => {
  let finalText = text;
  if (prefix) finalText = `${prefix} ${finalText}`.trim();
  if (suffix) finalText = `${finalText} ${suffix}`.trim();
  return finalText;
};

const validatePlatformData = (metadata: any, options: any) => {
  const { platform, titleLength, keywordCount } = options;
  let isValid = true;
  
  if (platform === 'adobe') {
    if (metadata.title && metadata.title.length > titleLength) isValid = false;
    if (!ADOBE_CATEGORIES.includes(metadata.category)) metadata.category = ADOBE_CATEGORIES[0];
  } else if (platform === 'shutterstock') {
    if (metadata.description && metadata.description.length > titleLength) isValid = false;
    if (!SHUTTERSTOCK_CATEGORIES.includes(metadata.category)) metadata.category = SHUTTERSTOCK_CATEGORIES[0];
  } else if (platform === 'both') {
    if (metadata.title && metadata.title.length > titleLength) isValid = false;
    if (metadata.description && metadata.description.length > (options.descriptionLength || 2048)) isValid = false;
    if (!ADOBE_CATEGORIES.includes(metadata.adobeCategory)) metadata.adobeCategory = ADOBE_CATEGORIES[0];
    if (!SHUTTERSTOCK_CATEGORIES.includes(metadata.shutterstockCategory)) metadata.shutterstockCategory = SHUTTERSTOCK_CATEGORIES[0];
  } else {
    if (metadata.title && metadata.title.length > titleLength) isValid = false;
  }
  
  if (metadata.keywords && Array.isArray(metadata.keywords)) {
    metadata.keywords = metadata.keywords.slice(0, keywordCount);
  }
  
  return isValid;
};

const generateAndValidateMetadata = async (aiImageUrl: string, options: any) => {
  let openai: OpenAI;
  let modelName: string;

  if (process.env.GROK_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });
    modelName = process.env.TEXT_MODEL_BASIC || "grok-2-vision-1212";
  } else {
    const apiKey = process.env.OPENAI_API_KEY || 'dummy_key_to_prevent_crash_on_startup';
    const isOpenRouter = apiKey.startsWith('sk-or-');
    
    openai = new OpenAI({
      apiKey: apiKey,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouter ? {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Meta Generator",
      } : undefined,
    });
    modelName = isOpenRouter ? "openai/gpt-4o" : "gpt-4o";
  }

  let finalMetadata: any = null;
  let attempts = 0;
  let isValid = false;

  while (attempts < 2 && !isValid) {
    const isRetry = attempts > 0;
    const promptText = generatePrompt(options, isRetry);

    const response = await openai.chat.completions.create({
      model: modelName,
      response_format: process.env.GROK_API_KEY ? undefined : { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: aiImageUrl } },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const aiResponse = response.choices[0]?.message?.content || '{}';
    let metadata;
    try {
      metadata = JSON.parse(aiResponse);
    } catch (e) {
      const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      metadata = JSON.parse(cleaned);
    }

    isValid = validatePlatformData(metadata, options);
    finalMetadata = metadata;
    attempts++;
  }

  if (!isValid && finalMetadata) {
    if (options.platform === 'shutterstock') {
      if (finalMetadata.description) finalMetadata.description = smartTrim(finalMetadata.description, options.descriptionLength || options.titleLength);
    } else if (options.platform === 'both') {
      if (finalMetadata.title) finalMetadata.title = smartTrim(finalMetadata.title, options.titleLength);
      if (finalMetadata.description) finalMetadata.description = smartTrim(finalMetadata.description, options.descriptionLength || 2048);
    } else {
      if (finalMetadata.title) finalMetadata.title = smartTrim(finalMetadata.title, options.titleLength);
    }
  }

  if (options.platform === 'shutterstock') {
    finalMetadata.description = applyPrefixSuffix(finalMetadata.description || '', options.prefix, options.suffix);
  } else if (options.platform === 'both') {
    finalMetadata.title = applyPrefixSuffix(finalMetadata.title || '', options.prefix, options.suffix);
    finalMetadata.description = applyPrefixSuffix(finalMetadata.description || '', options.prefix, options.suffix);
  } else {
    finalMetadata.title = applyPrefixSuffix(finalMetadata.title || '', options.prefix, options.suffix);
  }

  return finalMetadata;
};

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user || user.credits <= 0) {
      res.status(403).json({ error: 'Not enough credits' });
      return;
    }

    const platform = req.body.platform || 'general';
    const titleLength = parseInt(req.body.titleLength) || 157;
    const descriptionLength = parseInt(req.body.descriptionLength) || 200;
    const keywordCount = parseInt(req.body.keywordCount) || 41;
    const prefix = req.body.prefix || '';
    const suffix = req.body.suffix || '';
    const negativeTitleWords = req.body.negativeTitleWords || '';
    const negativeKeywords = req.body.negativeKeywords || '';

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ai-meta-generator',
    });

    fs.unlinkSync(req.file.path);

    let aiImageUrl = result.secure_url;
    if (aiImageUrl.toLowerCase().endsWith('.eps') || aiImageUrl.toLowerCase().endsWith('.avif')) {
      aiImageUrl = aiImageUrl.substring(0, aiImageUrl.lastIndexOf('.')) + '.jpg';
    }

    const metadata = await generateAndValidateMetadata(aiImageUrl, {
      platform, titleLength, descriptionLength, keywordCount, prefix, suffix, negativeTitleWords, negativeKeywords
    });

    const metaDataDoc = await MetaData.create({
      user: req.user?._id,
      imageUrl: aiImageUrl,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category || 'Miscellaneous',
      adobeCategory: metadata.adobeCategory,
      shutterstockCategory: metadata.shutterstockCategory,
      keywords: metadata.keywords || [],
      platform: platform
    });

    user.credits -= 1;
    await user.save();

    res.status(200).json({
      metadata: metaDataDoc,
      creditsRemaining: user.credits
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await MetaData.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const deleteHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const historyItem = await MetaData.findOne({ _id: id, user: req.user?._id });
    
    if (!historyItem) {
      res.status(404).json({ error: 'History item not found' });
      return;
    }

    await MetaData.deleteOne({ _id: id });
    res.status(200).json({ message: 'History item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history item' });
  }
};

export const regenerateMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl, platform, titleLength, descriptionLength, keywordCount, prefix, suffix, negativeTitleWords, negativeKeywords } = req.body;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user || user.credits < 2) {
      res.status(403).json({ error: 'Not enough credits. Regenerating costs 2 credits.' });
      return;
    }

    const metadata = await generateAndValidateMetadata(imageUrl, {
      platform, titleLength, descriptionLength, keywordCount, prefix, suffix, negativeTitleWords, negativeKeywords
    });

    const metaDataDoc = await MetaData.create({
      user: req.user?._id,
      imageUrl: imageUrl, 
      title: metadata.title,
      description: metadata.description,
      category: metadata.category || 'Miscellaneous',
      adobeCategory: metadata.adobeCategory,
      shutterstockCategory: metadata.shutterstockCategory,
      keywords: metadata.keywords || [],
      platform: platform
    });

    user.credits -= 2;
    await user.save();

    res.status(200).json({
      metadata: metaDataDoc,
      creditsRemaining: user.credits
    });
  } catch (error: any) {
    console.error('Regenerate Error:', error);
    res.status(500).json({ error: 'Failed to regenerate metadata' });
  }
};
