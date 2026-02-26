import os
import re

# This is the script used to scan and extract Thai text from remaining files.
# It uses regular expressions to find Thai characters and replaces them 
# with the t('...') translation function from useLanguage.

print("Starting translation scanner...")

# The directory containing the pages
pages_dir = '/Users/bank/Documents/Practices_Dev/fruit-WebApp/fruit-app/src/pages'

# The files that still needed translation
files_to_scan = [
    'index.js',
    'bills/BillPage.js',
    'bills/BillsListPage.js',
    'products/ProductPage.js',
    'profile/index.js',
    'admin/orders.js',
    'admin/products.js',
    'docs.js'
]

# Thai character regex pattern
thai_pattern = re.compile(r'[\u0E00-\u0E7F]+')

def scan_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find all Thai text matches
    matches = thai_pattern.findall(content)
    if matches:
        print(f"Found {len(matches)} Thai strings in {filepath}")
        for match in set(matches):
            print(f" - {match}")
    else:
        print(f"No Thai text found in {filepath}")

for file_path in files_to_scan:
    full_path = os.path.join(pages_dir, file_path)
    scan_file(full_path)

print("Scan complete.")
