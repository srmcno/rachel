"""Validate the static files GitHub Pages needs to serve the application."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class PageAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.local_files = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            url = attrs.get('href', '')
        elif tag in ('script', 'img'):
            url = attrs.get('src', '')
        else:
            return
        parsed = urlsplit(url)
        if parsed.path and not parsed.scheme and not parsed.netloc:
            self.local_files.append(parsed.path)


class SiteAssetTests(unittest.TestCase):
    def test_page_ids_are_unique(self):
        parser = PageAssets()
        parser.feed((ROOT / 'index.html').read_text())
        self.assertEqual(len(parser.ids), len(set(parser.ids)))

    def test_styles_modules_and_curated_images_are_published(self):
        html = (ROOT / 'index.html').read_text()
        parser = PageAssets()
        parser.feed(html)
        for file in parser.local_files:
            self.assertTrue((ROOT / file).is_file(), file)
        app = (ROOT / 'app.js').read_text() if (ROOT / 'app.js').is_file() else ''
        modules = re.findall(r"import\(['\"]([^'\"]+)['\"]\)", html + app)
        self.assertTrue(modules, 'Collection modules must be included in publication checks')
        texts = [html]
        for module in modules:
            path = ROOT / urlsplit(module).path
            self.assertTrue(path.is_file(), module)
            texts.append(path.read_text())
        for text in texts:
            for image in re.findall(r'img/[\w/.-]+\.(?:jpg|png|webp)', text):
                self.assertTrue((ROOT / image).is_file(), image)


if __name__ == '__main__':
    unittest.main()
