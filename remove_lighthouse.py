import os
import re
import glob

directory = 'src/pages/portfolio/*.astro'
files = glob.glob(directory)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the import
    content = re.sub(r'import LighthouseScoreBlock.*?\n', '', content)
    
    # Remove the lighthouseScores constant array
    content = re.sub(r'const lighthouseScores = \[\s*\{ category.*?\];\s*\n', '', content, flags=re.DOTALL)
    
    # Remove the Lighthouse Audit section
    content = re.sub(r'\s*<!-- Lighthouse Audit -->\s*<div class="max-w-4xl mx-auto mb-16">\s*<SectionHeader\s*label="Bewezen prestaties".*?/>\s*</div>\n', '\n', content, flags=re.DOTALL)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print('Done!')
